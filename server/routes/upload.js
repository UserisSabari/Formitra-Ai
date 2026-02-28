const express = require('express');
const router = express.Router();
const multer = require('multer');
const tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Setup multer for memory storage initially (can change to disk if files get large)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Basic fuzzy matching function
 */
function fuzzyMatch(extractedText, targetText) {
    if (!targetText) return false;
    // Simple lowercasing and removing non-alphanumeric chars for loose matching
    const normalizedExtracted = extractedText.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedTarget = targetText.toLowerCase().replace(/[^a-z0-9]/g, '');

    return normalizedExtracted.includes(normalizedTarget);
}

/**
 * Route: POST /api/verify-document
 * Expects form-data:
 * - document: The image file (jpeg, png)
 * - applicantData: JSON string containing { firstName, lastName, dob, ... }
 * - documentType: string (e.g., 'addressProof', 'passportPhoto')
 */
router.post('/verify-document', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document file provided.' });
        }

        const documentType = req.body.documentType;
        let applicantData = {};

        try {
            if (req.body.applicantData) {
                applicantData = JSON.parse(req.body.applicantData);
            }
        } catch (e) {
            console.error("Failed to parse applicant data", e);
        }

        // 1. If it's a PDF or we can't OCR it easily, we could fallback. 
        // For this MVP, we will only attempt OCR on images (png/jpeg)
        const isImage = req.file.mimetype.startsWith('image/');

        let extractedText = '';
        let issues = [];
        let status = 'Valid';
        let score = 100;

        if (isImage) {
            console.log(`Starting OCR for ${documentType}...`);
            // Run Tesseract OCR on the buffer
            const { data: { text } } = await tesseract.recognize(
                req.file.buffer,
                'eng'
            );
            extractedText = text;
            console.log(`OCR Complete. Extracted ${text.length} characters.`);

            // 2. Perform Verification Logic based on documentType
            if (documentType === 'addressProof') {
                // Check for name
                if (applicantData.firstName && !fuzzyMatch(extractedText, applicantData.firstName)) {
                    issues.push("Warning: First name not clearly found in document text.");
                    score -= 20;
                }
                if (applicantData.lastName && !fuzzyMatch(extractedText, applicantData.lastName)) {
                    issues.push("Warning: Last name not clearly found in document text.");
                    score -= 10;
                }

                // Check for city/pincode
                if (applicantData.city && !fuzzyMatch(extractedText, applicantData.city)) {
                    issues.push("Warning: City name not found in document text.");
                    score -= 20;
                }
                if (applicantData.pincode && !fuzzyMatch(extractedText, applicantData.pincode)) {
                    issues.push("Warning: PIN Code not found in document text.");
                    score -= 20;
                }

            } else if (documentType === 'dobProof') {
                if (applicantData.dob) {
                    // DOB formats vary wildly, just doing a raw string check
                    // A better approach would be extracting all dates and comparing
                    const dobParts = applicantData.dob.split('-'); // 1990-01-25
                    const year = dobParts[0];
                    if (!extractedText.includes(year)) {
                        issues.push(`Warning: Year of birth (${year}) not detected in text.`);
                        score -= 30;
                    }
                }
            } else if (documentType === 'passportPhoto') {
                // Tesseract isn't good for classifying photos. We'd use a face detection API here.
                // For now, just basic file validation.
            }
        } else {
            issues.push("OCR only supported for Image formats (JPG/PNG) currently. Skipping text verification.");
        }

        // 3. Document Quality Basics
        if (req.file.size > 4 * 1024 * 1024) {
            issues.push("File size is quite large, might cause slow uploads on portal.");
        } else if (req.file.size < 10 * 1024) {
            issues.push("File size is very small. Suspected low quality/resolution.");
            score -= 20;
            status = 'Warning';
        }

        // Finalize status
        if (score < 50) status = 'High Risk';
        else if (score < 80 || issues.length > 0) status = 'Warning';

        // Return the results
        return res.json({
            status,
            score,
            issues,
            extractedTextSnippet: extractedText.substring(0, 100) + (extractedText.length > 100 ? '...' : ''),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error during document verification:', error);
        res.status(500).json({ error: 'Failed to process document verification.' });
    }
});

module.exports = router;
