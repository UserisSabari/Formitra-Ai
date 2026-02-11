import {
    DOCUMENT_RULES,
    IMAGE_QUALITY_RULES,
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
export function validateFileBasics(file, rules) {
    const issues = [];

    if (!file) {
        issues.push('No file selected.');
        return { issues, isValid: false };
    }

    if (rules.allowedMimeTypes && !rules.allowedMimeTypes.includes(file.type)) {
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
+ *  - brightness (mean luminance)
 *  - contrast (standard deviation of luminance)
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

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const { width, height } = canvas;
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

        // Approximate blur: compute gradient magnitude variance on a coarse grid
        const step = 4;
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
            const formDobNorm = String(applicantData.dob).slice(0, 10);
            const ocrDobNorm = String(ocrData.dateOfBirthText).slice(0, 10);
            if (formDobNorm !== ocrDobNorm) {
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
 * Compute a simple risk score from the accumulated issues across all
 * documents. Each issue type contributes a weighted penalty.
 */
export function computeRejectionRiskScore(perDocResults) {
    let score = 0;
    const reasons = [];

    const addPenalty = (amount, reason) => {
        score += amount;
        reasons.push(reason);
    };

    Object.entries(perDocResults).forEach(([key, result]) => {
        if (!result) return;

        if (result.status === 'missing') {
            addPenalty(
                40,
                `${result.label || key} is missing but expected by the application.`
            );
        }

        if (result.basicIssues?.length) {
            addPenalty(
                20,
                `${result.label || key} has file-level issues (format/size).`
            );
        }

        if (result.qualityIssues?.length) {
            addPenalty(
                15,
                `${result.label || key} has potential image quality concerns.`
            );
        }

        if (result.consistencyIssues?.length) {
            addPenalty(
                25,
                `${result.label || key} appears inconsistent with the form details.`
            );
        }
    });

    // Clamp score into [0, 100]
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
export async function validateSingleDocument({
    key,
    file,
    applicantData,
}) {
    const rules = DOCUMENT_RULES[key];
    if (!rules) {
        return {
            key,
            label: key,
            status: 'missing',
            basicIssues: [],
            qualityIssues: [],
            consistencyIssues: [],
        };
    }

    const label = rules.label || key;

    if (!file) {
        const isRequired = rules.required;
        return {
            key,
            label,
            status: isRequired ? 'missing' : 'optional-missing',
            basicIssues: [],
            qualityIssues: [],
            consistencyIssues: [],
        };
    }

    const basic = validateFileBasics(file, rules);
    const basicIssues = basic.issues;

    let qualityIssues = [];
    let metrics = null;
    let faceInfo = null;

    const isImage = file.type.startsWith('image/');
    if (isImage && key === 'passportPhoto') {
        const quality = await validateImageDimensionsAndQuality(file, rules);
        metrics = quality.metrics;
        qualityIssues = quality.issues;
        faceInfo = detectFacePresenceMock();
    }

    const ocrData = mockOcrExtractFields(file, key);
    const consistency = compareWithApplicantData(
        applicantData,
        key,
        ocrData
    );

    const consistencyIssues = consistency.issues;

    const hasAnyIssue =
        basicIssues.length || qualityIssues.length || consistencyIssues.length;

    return {
        key,
        label,
        status: hasAnyIssue ? 'invalid' : 'valid',
        basicIssues,
        qualityIssues,
        consistencyIssues,
        metrics,
        faceInfo,
        similarityDetails: consistency.details,
    };
}

