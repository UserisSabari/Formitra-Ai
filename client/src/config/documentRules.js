// Centralised configuration for document-related rules.
// Keeping these as named constants avoids hidden magic numbers
// and makes it easier to explain design decisions in a viva.

export const MAX_PASSPORT_PHOTO_SIZE_MB = 5;
export const MAX_PROOF_DOCUMENT_SIZE_MB = 10;

export const PASSPORT_PHOTO_MIN_WIDTH = 350; // pixels
export const PASSPORT_PHOTO_MIN_HEIGHT = 450; // pixels

// Approximate aspect ratio range for standard passport photos (e.g. 3.5cm x 4.5cm)
export const PASSPORT_PHOTO_MIN_ASPECT_RATIO = 0.7; // width / height
export const PASSPORT_PHOTO_MAX_ASPECT_RATIO = 0.9;

export const PASSPORT_PHOTO_ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export const ADDRESS_PROOF_ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
];

export const OPTIONAL_PROOF_ALLOWED_TYPES = ADDRESS_PROOF_ALLOWED_TYPES;

// Thresholds used by the simple image analysis logic.
// These values are intentionally conservative and can be tuned.
export const IMAGE_QUALITY_RULES = {
    MIN_BLUR_SCORE: 8, // higher value = sharper
    MIN_BRIGHTNESS: 60, // 0-255
    MAX_BRIGHTNESS: 200,
    MIN_CONTRAST: 25, // standard deviation of luminance
};

// Fuzzy matching thresholds for comparing form data vs. mock OCR output.
export const NAME_MATCH_THRESHOLD = 0.7; // 0..1
export const ADDRESS_MATCH_THRESHOLD = 0.6;

// Risk scoring thresholds
export const LOW_RISK_MAX = 30;
export const MEDIUM_RISK_MAX = 70;

// Size helpers
export const mbToBytes = (mb) => mb * 1024 * 1024;

export const DOCUMENT_RULES = {
    passportPhoto: {
        label: 'Passport Photograph',
        required: true,
        allowedMimeTypes: PASSPORT_PHOTO_ALLOWED_TYPES,
        maxSizeBytes: mbToBytes(MAX_PASSPORT_PHOTO_SIZE_MB),
        minWidth: PASSPORT_PHOTO_MIN_WIDTH,
        minHeight: PASSPORT_PHOTO_MIN_HEIGHT,
        minAspectRatio: PASSPORT_PHOTO_MIN_ASPECT_RATIO,
        maxAspectRatio: PASSPORT_PHOTO_MAX_ASPECT_RATIO,
        imageQuality: IMAGE_QUALITY_RULES,
    },
    addressProof: {
        label: 'Address Proof',
        required: true,
        allowedMimeTypes: ADDRESS_PROOF_ALLOWED_TYPES,
        maxSizeBytes: mbToBytes(MAX_PROOF_DOCUMENT_SIZE_MB),
    },
    dobProof: {
        label: 'Date of Birth Proof',
        required: false,
        allowedMimeTypes: OPTIONAL_PROOF_ALLOWED_TYPES,
        maxSizeBytes: mbToBytes(MAX_PROOF_DOCUMENT_SIZE_MB),
    },
    identityProof: {
        label: 'Identity Proof',
        required: false,
        allowedMimeTypes: OPTIONAL_PROOF_ALLOWED_TYPES,
        maxSizeBytes: mbToBytes(MAX_PROOF_DOCUMENT_SIZE_MB),
    },
};

