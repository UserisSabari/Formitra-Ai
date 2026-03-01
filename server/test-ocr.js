const fs = require('fs');
const path = require('path');

async function testOCR() {
    console.log("Starting OCR Test...");
    const filePath = path.join('C:\\Users\\sabar\\.gemini\\antigravity\\brain\\70d880b3-fd3f-4f43-a033-69f0d4dd8c0f', 'sample_id_card_1772222354688.png');

    if (!fs.existsSync(filePath)) {
        console.error("Test image not found:", filePath);
        return;
    }

    const fileStream = fs.createReadStream(filePath);

    const formData = new FormData();
    // FormData from undici (Node 18+) requires Blob/File, so we might need a workaround for Node < 18 or use a package.
    // Let's use standard 'form-data' package if needed, but fetch uses standard web fetch in Node 18+.

    // Actually, Node 18+ fetch requires Blob for file uploads if we don't have 'form-data'. 
    // Let's manually construct it or use undici/Blob
    const buffer = fs.readFileSync(filePath);
    const blob = new Blob([buffer], { type: 'image/png' });

    formData.append('document', blob, 'sample.png');
    formData.append('documentType', 'addressProof');

    const applicantData = {
        firstName: "John",
        lastName: "Doe",
        dob: "1990-05-15",
        address: "123 Main St",
        city: "Springfield",
        state: "Maharashtra",
        pincode: "123456"
    };

    formData.append('applicantData', JSON.stringify(applicantData));

    try {
        console.log("Sending request to backend...");
        const response = await fetch('http://localhost:5000/api/verify-document', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        console.log("=== BACKEND RESPONSE ===");
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testOCR();
