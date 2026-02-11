/**
 * Mock OCR utility.
 *
 * This module intentionally does NOT perform any real OCR. Instead, it
 * derives a tiny amount of structured information from the file name so
 * that we can demonstrate data-consistency checks without claiming
 * production-grade computer vision.
 *
 * Example file names that work reasonably well with this mock:
 *  - RAHUL_SHARMA_1995-01-01_passport.jpg
 *  - address_221B_Baker_Street_Delhi_110001.png
 */

function getBaseName(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return fileName;
    return fileName.slice(0, lastDotIndex);
}

export function mockOcrExtractFields(file, docType) {
    const baseName = getBaseName(file.name || '');
    const parts = baseName.split(/[_\-]+/).filter(Boolean);

    // Passport-style document: try to interpret first two tokens as name
    if (docType === 'passportPhoto' || docType === 'identityProof') {
        const nameTokens = parts.slice(0, 2);
        const fullName = nameTokens.join(' ');

        // Look for something that resembles a date token
        const dobToken = parts.find((p) => /\d{4}[-/]\d{2}[-/]\d{2}/.test(p)) || null;

        return {
            source: 'filename',
            fullNameText: fullName || baseName,
            dateOfBirthText: dobToken,
        };
    }

    // Address-style document: treat the whole base name as one long line of text
    if (docType === 'addressProof' || docType === 'dobProof') {
        return {
            source: 'filename',
            addressText: baseName,
        };
    }

    // Fallback for unknown types
    return {
        source: 'filename',
        rawText: baseName,
    };
}

