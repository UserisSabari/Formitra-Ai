const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI, Type, Schema } = require('@google/genai');

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
 * Route: POST /api/verify-document
 * Expects form-data:
 * - documents: Array of image/pdf files
 * - applicantData: JSON string containing { firstName, lastName, dob, ... }
 */
router.post('/verify-document', upload.array('documents', 10), async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing in server/.env");
            return res.status(500).json({ error: 'GEMINI_API_KEY is not set in the backend environment.' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No documents provided.' });
        }

        let applicantData = {};
        try {
            if (req.body.applicantData) {
                applicantData = JSON.parse(req.body.applicantData);
            }
        } catch (e) {
            console.error("Failed to parse applicant data", e);
        }

        // Prepare the multimodal content array for Gemini
        const geminiContent = [];

        const prompt = `
You are an expert, meticulous document verification AI acting as a Passport Officer. 
You are receiving a complete package of ${req.files.length} supporting document(s) for a single applicant.

Compare the details visibly written across ALL these documents against the following user application data expected: 
${JSON.stringify(applicantData, null, 2)}

Your job is to review the package COLLECTIVELY. 
1. Check if the name matches the application data.
2. Check if the address matches.
3. Check for any cross-document discrepancies (e.g., the name on document A is different from the name on document B).
4. CRITICAL PHOTO RULE: If any document appears to be a photograph of a person, you MUST strictly evaluate it against passport photo standards. It must be a professional headshot with a clear face, looking straight ahead, and it MUST have a solid white or light-colored background. If it is a casual selfie, group photo, has a cluttered background, or is not a professional headshot, you MUST flag it as an 'Error' and explicitly state that it does not meet standard passport photo requirements.

Be intelligent and forgiving of minor layout or formatting differences (like "123 Main Street" vs "123 Main St"), but flag genuine mismatches (e.g. name or birth year is completely different, or wrong document type uploaded).
`;
        geminiContent.push(prompt);

        for (const file of req.files) {
            const isValidMime = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
            if (!isValidMime) {
                console.warn(`Skipping unsupported file type: ${file.mimetype}`);
                continue;
            }
            geminiContent.push({
                inlineData: {
                    data: file.buffer.toString("base64"),
                    mimeType: file.mimetype
                }
            });
        }

        console.log(`Sending ${req.files.length} documents to Gemini API for collective intelligent analysis...`);

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Define the strict Structured Output schema
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                packageStatus: {
                    type: Type.STRING,
                    description: "The overall status of the entire application package. Must be 'Valid', 'Warning', or 'High Risk'",
                },
                overallScore: {
                    type: Type.INTEGER,
                    description: "A confidence/accuracy score for the entire package between 0 and 100",
                },
                collectiveInsights: {
                    type: Type.STRING,
                    description: "A 2-3 sentence summary of your analysis of the entire package (e.g., 'The passport photo is clear. The address on the Aadhaar card perfectly matches the application data.')",
                },
                documentBreakdown: {
                    type: Type.ARRAY,
                    description: "A specific breakdown for each document submitted representing your analysis",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            inferredDocumentType: {
                                type: Type.STRING,
                                description: "What kind of document did you identify this as? (e.g., 'Aadhaar Card', 'Passport Photo', 'Unknown')",
                            },
                            status: {
                                type: Type.STRING,
                                description: "Must be 'Valid', 'Warning', or 'Error'",
                            },
                            issues: {
                                type: Type.ARRAY,
                                description: "An array of specific discrepancy strings, or empty array if perfect",
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["inferredDocumentType", "status", "issues"]
                    }
                }
            },
            required: ["packageStatus", "overallScore", "collectiveInsights", "documentBreakdown"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: geminiContent,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1 // Keep it analytical and strict
            }
        });

        // Because we used responseSchema, Gemini guarantees this string is perfectly valid JSON!
        const responseText = response.text;
        console.log("Gemini API completed collective analysis.");

        const jsonResponse = JSON.parse(responseText);

        // Attach the original filenames back into the breakdown array for the frontend tracking
        if (jsonResponse.documentBreakdown && Array.isArray(jsonResponse.documentBreakdown)) {
            jsonResponse.documentBreakdown = jsonResponse.documentBreakdown.map((doc, idx) => ({
                originalFileName: req.files[idx] ? req.files[idx].originalname : `Document ${idx + 1}`,
                ...doc
            }));
        }

        return res.json({
            ...jsonResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error during Gemini document verification:', error?.message || error);
        res.status(500).json({ error: 'Failed to process document verification with AI.' });
    }
});

module.exports = router;
