import {
    DOCUMENT_RULES,
    IMAGE_QUALITY_RULES,
    MAX_IMAGE_DIMENSION_FOR_ANALYSIS,
    NAME_MATCH_THRESHOLD,
    ADDRESS_MATCH_THRESHOLD,
    LOW_RISK_MAX,
    MEDIUM_RISK_MAX,
} from '../config/documentRules';
import { stringSimilarity } from './fuzzyMatch';
import { mockOcrExtractFields } from './mockOcr';

/**
 * Low-level file checks that do not depend on image parsing.
 */
const EXT_TO_MIME = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf',
};

function resolveMimeType(file) {
    const reported = file.type?.toLowerCase();
    if (reported && reported !== 'application/octet-stream') return reported;
    const ext = (file.name || '').split('.').pop()?.toLowerCase();
    return ext ? EXT_TO_MIME[ext] || reported : reported;
}

export function validateFileBasics(file, rules) {
    const issues = [];

    if (!file) {
        issues.push('No file selected.');
        return { issues, isValid: false };
    }

    const mime = resolveMimeType(file);
    if (rules.allowedMimeTypes && mime && !rules.allowedMimeTypes.includes(mime)) {
        issues.push('File type not allowed for this document.');
    }

    if (rules.maxSizeBytes && file.size > rules.maxSizeBytes) {
        issues.push('File size exceeds the recommended maximum for upload.');
    }

    return { issues, isValid: issues.length === 0 };
}

/**
 * Draws the image onto an in-memory canvas and computes:
 *  - approximate blur score (edge variance)
 *  - brightness (mean luminance)
 *  - contrast (standard deviation of luminance)
 *
 * Large images are downscaled before analysis to keep validation fast
 * while preserving relative quality metrics.
 */
async function getImageMetrics(file) {
    const imageUrl = URL.createObjectURL(file);

    try {
        const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = imageUrl;
        });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
            throw new Error('Canvas context not available');
        }

        let width = img.width;
        let height = img.height;
        const maxDim = MAX_IMAGE_DIMENSION_FOR_ANALYSIS;
        if (width > maxDim || height > maxDim) {
            const scale = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(img, 0, 0, width, height);

        const imageData = context.getImageData(0, 0, width, height);
        const { data } = imageData;

        // Compute luminance per pixel
        const luminances = [];
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Standard ITU-R BT.709 luma transform
            const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            luminances.push(y);
        }

        const mean =
            luminances.reduce((sum, v) => sum + v, 0) / luminances.length;
        const variance =
            luminances.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
            luminances.length;
        const contrast = Math.sqrt(variance);

        // Approximate blur: compute gradient magnitude variance on a coarse grid.
        // Coarser step for larger images to keep iteration count bounded.
        const step = Math.max(4, Math.floor(Math.min(width, height) / 100));
        let edgeValues = [];
        for (let y = 0; y < height - step; y += step) {
            for (let x = 0; x < width - step; x += step) {
                const idx = (y * width + x) * 4;
                const rightIdx = (y * width + (x + step)) * 4;
                const downIdx = ((y + step) * width + x) * 4;

                const yHere =
                    0.2126 * data[idx] +
                    0.7152 * data[idx + 1] +
                    0.0722 * data[idx + 2];
                const yRight =
                    0.2126 * data[rightIdx] +
                    0.7152 * data[rightIdx + 1] +
                    0.0722 * data[rightIdx + 2];
                const yDown =
                    0.2126 * data[downIdx] +
                    0.7152 * data[downIdx + 1] +
                    0.0722 * data[downIdx + 2];

                const dx = yRight - yHere;
                const dy = yDown - yHere;
                const gradientMag = Math.sqrt(dx * dx + dy * dy);
                edgeValues.push(gradientMag);
            }
        }

        if (edgeValues.length === 0) {
            edgeValues = [0];
        }

        const edgeMean =
            edgeValues.reduce((sum, v) => sum + v, 0) / edgeValues.length;
        const edgeVar =
            edgeValues.reduce((sum, v) => sum + (v - edgeMean) ** 2, 0) /
            edgeValues.length;
        const blurScore = edgeVar;

        return {
            width,
            height,
            brightness: mean,
            contrast,
            blurScore,
        };
    } finally {
        URL.revokeObjectURL(imageUrl);
    }
}

export async function validateImageDimensionsAndQuality(file, rules) {
    const metrics = await getImageMetrics(file);
    const issues = [];

    const { minWidth, minHeight, minAspectRatio, maxAspectRatio } = rules;
    const { brightness, contrast, blurScore, width, height } = metrics;

    if (minWidth && width < minWidth) {
        issues.push('Image width is smaller than recommended for passport photos.');
    }

    if (minHeight && height < minHeight) {
        issues.push('Image height is smaller than recommended for passport photos.');
    }

    if (minAspectRatio && maxAspectRatio) {
        const aspectRatio = width / height;
        if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
            issues.push('Image aspect ratio is unusual for a passport photo.');
        }
    }

    const { MIN_BLUR_SCORE, MIN_BRIGHTNESS, MAX_BRIGHTNESS, MIN_CONTRAST } =
        IMAGE_QUALITY_RULES;

    if (blurScore < MIN_BLUR_SCORE) {
        issues.push('Image may be blurry. Ensure your face is in sharp focus.');
    }

    if (brightness < MIN_BRIGHTNESS) {
        issues.push('Image appears quite dark. Consider using better lighting.');
    } else if (brightness > MAX_BRIGHTNESS) {
        issues.push('Image appears very bright. Avoid overexposed backgrounds.');
    }

    if (contrast < MIN_CONTRAST) {
        issues.push('Image contrast is low. Features may not be clearly visible.');
    }

    return { metrics, issues };
}

/**
 * Face detection is explicitly not implemented here.
 * In a real system, this is where a face-detection model or an API call
 * would be integrated. For this academic project, we return an
 * informative placeholder so we do not misrepresent capabilities.
 */
export function detectFacePresenceMock() {
    return {
        status: 'unknown',
        message:
            'Face detection is not implemented in this prototype. Please confirm visually that your full face is visible and unobstructed.',
    };
}

function normalizeDobForCompare(str) {
    if (!str || str.length < 8) return null;
    const s = str.trim().slice(0, 10);
    const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m1) return `${m1[1]}-${m1[2]}-${m1[3]}`;
    const m2 = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
    if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
    return s;
}

/**
 * Compare applicant form data with mock OCR output for basic
 * consistency checks.
 */
function compareWithApplicantData(applicantData, docType, ocrData) {
    const issues = [];
    const details = {};

    if (!applicantData) {
        return { issues, details };
    }

    if (docType === 'passportPhoto' || docType === 'identityProof') {
        const formFullName = [
            applicantData.firstName,
            applicantData.lastName,
        ]
            .filter(Boolean)
            .join(' ');

        if (ocrData.fullNameText) {
            const nameScore = stringSimilarity(
                formFullName,
                ocrData.fullNameText
            );
            details.nameSimilarity = nameScore;
            if (nameScore < NAME_MATCH_THRESHOLD) {
                issues.push(
                    'Name on document may not closely match the name entered in the form.'
                );
            }
        }

        if (ocrData.dateOfBirthText && applicantData.dob) {
            const formDobNorm = normalizeDobForCompare(String(applicantData.dob));
            const ocrDobNorm = normalizeDobForCompare(String(ocrData.dateOfBirthText));
            if (formDobNorm && ocrDobNorm && formDobNorm !== ocrDobNorm) {
                issues.push(
                    'Date of birth on document appears different from the date entered in the form.'
                );
            }
        }
    }

    if (
        docType === 'addressProof' &&
        ocrData.addressText &&
        applicantData.address
    ) {
        const combinedFormAddress = [
            applicantData.address,
            applicantData.city,
            applicantData.state,
            applicantData.pincode,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        const addressText = String(ocrData.addressText).toLowerCase();
        const score = stringSimilarity(combinedFormAddress, addressText);
        details.addressSimilarity = score;
        if (score < ADDRESS_MATCH_THRESHOLD) {
            issues.push(
                'Address on document may not closely match the address entered in the form.'
            );
        }
    }

    return { issues, details };
}

/**
 * Compute a risk score from accumulated issues. Each issue type adds a
 * weighted penalty. Per-document contribution is capped to avoid one
 * document dominating the score.
 */
const PER_DOC_CAP = 50; // max points from any single document

export function computeRejectionRiskScore(perDocResults) {
    let score = 0;
    const reasons = [];

    Object.entries(perDocResults).forEach(([key, result]) => {
        if (!result) return;
        if (result.status === 'optional-missing') return; // optional docs don't penalise

        let docScore = 0;

        if (result.status === 'missing') {
            docScore += 35;
            reasons.push(`${result.label || key} is missing but expected by the application.`);
        }

        if (result.basicIssues?.length) {
            docScore += 20;
            reasons.push(`${result.label || key} has file-level issues (format/size).`);
        }

        if (result.qualityIssues?.length) {
            docScore += 15;
            reasons.push(`${result.label || key} has potential image quality concerns.`);
        }

        if (result.consistencyIssues?.length) {
            docScore += 20;
            reasons.push(`${result.label || key} appears inconsistent with the form details.`);
        }

        score += Math.min(docScore, PER_DOC_CAP);
    });

    score = Math.max(0, Math.min(100, score));

    let level = 'low';
    if (score > MEDIUM_RISK_MAX) {
        level = 'high';
    } else if (score > LOW_RISK_MAX) {
        level = 'medium';
    }

    return { score, level, reasons };
}

/**
 * High-level orchestration function that runs all the checks for a
 * single document and returns a serialisable summary.
 */
export async function validateSingleDocument({ key, file, applicantData }) {
    if (!file) {
        return {
            status: 'missing',
            basicIssues: ['Document is missing.'],
            qualityIssues: [],
            consistencyIssues: [],
        };
    }

    // 1. Client-side basic validation (Size/Type)
    const rule = DOCUMENT_RULES[key];
    const basicIssues = [];

    if (rule) {
        if (file.size > rule.maxSizeMB * 1024 * 1024) {
            basicIssues.push(`File exceeds maximum size of ${rule.maxSizeMB}MB.`);
        }
        if (!rule.acceptedTypes.includes(file.type)) {
            basicIssues.push(`Invalid file format. Accepted: ${rule.acceptedTypes.join(', ')}`);
        }
    }

    if (basicIssues.length > 0) {
        return {
            status: 'rejected',
            basicIssues,
            qualityIssues: [],
            consistencyIssues: []
        };
    }

    // 2. Call the Backend API for OCR and deeper verification
    try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', key);
        formData.append('applicantData', JSON.stringify(applicantData));

        const response = await fetch('http://localhost:5000/api/verify-document', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }

        const result = await response.json();

        // Map backend result to frontend structure
        const allIssues = result.issues || [];
        return {
            status: result.status.toLowerCase(), // 'valid', 'warning', 'high risk' -> 'rejected'
            basicIssues: result.score < 50 ? ['High risk score detected by backend.'] : [],
            qualityIssues: [],
            consistencyIssues: allIssues, // Put backend issues in consistency for now to display them
            backendScore: result.score,
            extractedTextSnippet: result.extractedTextSnippet
        };

    } catch (error) {
        console.error("Backend verification failed:", error);
        // Fallback if backend is down
        return {
            status: 'warning',
            basicIssues: [],
            qualityIssues: [],
            consistencyIssues: ['Backend verification unavailable. Proceeding with caution.']
        };
    }
}

