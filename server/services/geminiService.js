const { GoogleGenAI, Type } = require('@google/genai');
const fs = require('fs');

/**
 * Validates a document package against applicant data using Gemini.
 * @param {Array} files - Multer files array (supports buffer or file paths)
 * @param {Object} applicantData - JSON applicant object
 * @returns {Object} Structured JSON analysis
 */
async function verifyDocuments(files, applicantData) {
    if (!process.env.GEMINI_API_KEY) {
        const error = new Error('GEMINI_API_KEY is not configured in the environment.');
        error.status = 500;
        throw error;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const geminiContent = [];

    const prompt = `
You are an expert, meticulous document verification AI acting as a Passport Officer. 
You are receiving a complete package of ${files.length} supporting document(s) for a single applicant.

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

    for (const file of files) {
        const isValidMime = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
        if (!isValidMime) continue;

        let base64Data;
        if (file.buffer) {
            base64Data = file.buffer.toString("base64");
        } else if (file.path) {
            base64Data = fs.readFileSync(file.path, { encoding: 'base64' });
        }

        if (base64Data) {
            geminiContent.push({
                inlineData: {
                    data: base64Data,
                    mimeType: file.mimetype
                }
            });
        }
    }

    // Define the strict Structured Output schema guarantees perfectly valid JSON
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

    console.log(`[AI Service] Prompting Gemini Flash with ${files.length} documents...`);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: geminiContent,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.1 // Analytical and strict
        }
    });

    const jsonResponse = JSON.parse(response.text);

    // Attach original filenames back into the breakdown array for frontend presentation
    if (jsonResponse.documentBreakdown && Array.isArray(jsonResponse.documentBreakdown)) {
        jsonResponse.documentBreakdown = jsonResponse.documentBreakdown.map((doc, idx) => ({
            originalFileName: files[idx] ? files[idx].originalname : `Document ${idx + 1}`,
            ...doc
        }));
    }

    return jsonResponse;
}

/**
 * Extracts Applicant Data from provided documents using Gemini.
 * @param {Array} files - Multer files array
 * @returns {Object} Extracted JSON matching application schema
 */
async function extractDataFromDocuments(files) {
    if (!process.env.GEMINI_API_KEY) {
        const error = new Error('GEMINI_API_KEY is not configured in the environment.');
        error.status = 500;
        throw error;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const geminiContent = [];

    const prompt = `
You are an expert OCR AI data extraction engine.
You are provided with images of government IDs, documents, or forms.
Your job is to read these documents and extract the user's details to pre-fill an application form.

If the documents include an Aadhaar card, PAN card, or similarly structured ID, extract exactly what you see.
If the document is a photo, you can infer gender or skip it.

Return ONLY a perfectly structured JSON object matching the schema. If a field is not found in ANY document, leave it empty.
For dates, try to format as YYYY-MM-DD if possible.
`;
    geminiContent.push(prompt);

    for (const file of files) {
        const isValidMime = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
        if (!isValidMime) continue;

        let base64Data;
        if (file.buffer) {
            base64Data = file.buffer.toString("base64");
        } else if (file.path) {
            base64Data = fs.readFileSync(file.path, { encoding: 'base64' });
        }

        if (base64Data) {
            geminiContent.push({
                inlineData: {
                    data: base64Data,
                    mimeType: file.mimetype
                }
            });
        }
    }

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            success: {
                type: Type.BOOLEAN,
                description: "True if you successfully found at least some PII data."
            },
            data: {
                type: Type.OBJECT,
                properties: {
                    firstName: { type: Type.STRING },
                    lastName: { type: Type.STRING },
                    fatherName: { type: Type.STRING },
                    dob: { type: Type.STRING, description: "YYYY-MM-DD whenever possible" },
                    gender: { type: Type.STRING, description: "Male, Female, or Transgender" },
                    address: { type: Type.STRING },
                    city: { type: Type.STRING },
                    state: { type: Type.STRING },
                    pincode: { type: Type.STRING }
                }
            }
        },
        required: ["success", "data"]
    };

    console.log(`[AI Service] Extracting data from ${files.length} documents...`);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: geminiContent,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.1
        }
    });

    return JSON.parse(response.text);
}

module.exports = {
    verifyDocuments,
    extractDataFromDocuments
};
