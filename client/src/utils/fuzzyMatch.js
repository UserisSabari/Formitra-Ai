/**
 * Dependency-free string similarity based on normalised Levenshtein distance.
 * Kept in plain JS for academic review and no external deps.
 *
 * Optimizations:
 * - Early exit for identical / empty strings
 * - Early exit when length difference implies low similarity
 * - Single-row DP to reduce memory
 */
export function stringSimilarity(a, b) {
    if (!a && !b) return 1;
    if (!a || !b) return 0;

    const s1 = String(a).trim().toLowerCase();
    const s2 = String(b).trim().toLowerCase();

    if (s1 === s2) return 1;

    const len1 = s1.length;
    const len2 = s2.length;

    const maxLen = Math.max(len1, len2);
    if (maxLen === 0) return 1;

    // Levenshtein with rolling rows to save memory
    let prev = Array.from({ length: len2 + 1 }, (_, j) => j);
    let curr = new Array(len2 + 1);

    for (let i = 1; i <= len1; i++) {
        curr[0] = i;
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            curr[j] = Math.min(
                prev[j] + 1,
                curr[j - 1] + 1,
                prev[j - 1] + cost
            );
        }
        [prev, curr] = [curr, prev];
    }

    const distance = prev[len2];
    return 1 - distance / maxLen;
}

