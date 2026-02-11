/**
 * Very small, dependency-free string similarity helper based on
 * normalised Levenshtein distance.
 *
 * This is deliberately implemented in plain JavaScript instead of
 * pulling in a heavy NLP library, so that the matching behaviour
 * is easy to reason about during academic review.
 */
export function stringSimilarity(a, b) {
    if (!a && !b) return 1;
    if (!a || !b) return 0;

    const s1 = a.trim().toLowerCase();
    const s2 = b.trim().toLowerCase();

    if (s1 === s2) return 1;

    const len1 = s1.length;
    const len2 = s2.length;

    // Classic dynamic-programming Levenshtein distance.
    const dp = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1, // deletion
                dp[i][j - 1] + 1, // insertion
                dp[i - 1][j - 1] + cost // substitution
            );
        }
    }

    const distance = dp[len1][len2];
    const maxLength = Math.max(len1, len2);
    // Convert distance into similarity in the range [0, 1]
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

