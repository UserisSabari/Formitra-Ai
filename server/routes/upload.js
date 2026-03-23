const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { verifyDocuments } = require('../services/geminiService');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Disk storage prevents memory exhaustion and handles massive file buffers robustly
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit per file
});

/**
 * Route: POST /api/verify-document
 * Expects form-data:
 * - documents: Array of image/pdf files
 * - applicantData: JSON string containing { firstName, lastName, dob, ... }
 */
router.post('/verify-document', upload.array('documents', 10), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            const err = new Error('No documents provided for verification.');
            err.status = 400;
            throw err;
        }

        let applicantData = {};
        try {
            if (req.body.applicantData) {
                applicantData = JSON.parse(req.body.applicantData);
            }
        } catch (e) {
            console.warn('[Validation Warning] Invalid applicantData JSON format');
        }

        // Delegate business logic to dedicated AI service
        const verificationResult = await verifyDocuments(req.files, applicantData);

        // Professional Cleanup: Ensure temporary disk files are removed dynamically
        for (const file of req.files) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }

        return res.json({
            ...verificationResult,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Fallback Cleanup: Prevent disk bloat on 500 errors
        if (req.files) {
            for (const file of req.files) {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            }
        }
        next(error); // Route errors to unified Express error handler
    }
});

module.exports = router;
