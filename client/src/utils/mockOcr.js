/**
 * Mock OCR utility. NOT real OCR – derives structured data from the file name
 * to demonstrate consistency checks without claiming production capability.
 *
 * Supports:
 *  - RAHUL_SHARMA_1995-01-01_passport.jpg
 *  - FirstName_MiddleName_LastName_DD-MM-YYYY.jpg
 *  - address_221B_Baker_Street_Delhi_110001.png
 */

function getBaseName(fileName) {
    const n = String(fileName || '').lastIndexOf('.');
    return n === -1 ? fileName : fileName.slice(0, n);
}

// Multiple date patterns: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY
const DATE_PATTERNS = [
    /\d{4}[-/]\d{2}[-/]\d{2}/,
    /\d{2}[-/]\d{2}[-/]\d{4}/,
];

function findDateToken(parts) {
    for (const p of parts) {
        for (const re of DATE_PATTERNS) {
            const m = p.match(re);
            if (m) return m[0];
        }
    }
    return null;
}

function normalizeDate(token) {
    if (!token) return null;
    const m = token.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    const m2 = token.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
    if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
    return token;
}

export function mockOcrExtractFields(file, docType) {
    const baseName = getBaseName(file.name || '');
    const parts = baseName.split(/[_\-.\s]+/).filter((p) => p.length > 0);

    // Skip generic filenames (photo, img, document, etc.)
    const generic = ['photo', 'img', 'image', 'document', 'doc', 'file', 'passport', 'proof'];
    const meaningfulParts = parts.filter((p) => !generic.includes(p.toLowerCase()));

    if (docType === 'passportPhoto' || docType === 'identityProof') {
        const nameTokens = meaningfulParts.slice(0, 3); // first, middle, last
        const fullName = nameTokens.join(' ').trim() || baseName;
        const dobToken = findDateToken(parts);
        const dateOfBirthText = dobToken ? normalizeDate(dobToken) : null;

        return {
            source: 'filename',
            fullNameText: fullName,
            dateOfBirthText,
        };
    }

    if (docType === 'addressProof' || docType === 'dobProof') {
        return {
            source: 'filename',
            addressText: baseName,
        };
    }

    return { source: 'filename', rawText: baseName };
}

