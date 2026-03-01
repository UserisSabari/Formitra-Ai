const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function testGemini() {
    try {
        console.log("Testing Gemini API connection...");
        const ai = new GoogleGenAI({});
        // uses process.env.GEMINI_API_KEY natively if set

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Say "Hello, world!" if you can hear me.'
        });

        console.log("SUCCESS. Response from Gemini:");
        console.log(response.text);
    } catch (e) {
        console.error("GEMINI API ERROR:", e.message);
        console.error("Full error object:", e);
    }
}

testGemini();
