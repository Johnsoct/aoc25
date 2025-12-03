import puzzleData from "./2.json" with { type: "json" };

const idRangesToCheck = puzzleData
    .idRanges
    .split(",");
const invalidIds: number[] = [];

idRangesToCheck.forEach((idRange) => {
    // Convert to numbers; reduces need to check for leading 0s;
    // makes easier to reduce
    const range = idRange
        .split("-")
        .map((id) => {
            return Number(id);
        });

    for (let id = range[0]; id <= range[1]; id++) {
        const divisors = [];

        // Find the whole divisors of half the id length (pattern can't be greater than half)
        for (let patternLength = 1; patternLength <= id.toString().length / 2; patternLength++) {
            if (id.toString().length % patternLength === 0) {
                divisors.push(patternLength);
            }
        }
        
        // Check the rest of the id for the pattern repeated, with no outlying indices
        divisors.forEach((divisor) => {
            const pattern = id
                .toString()
                .slice(0, divisor);
            // Positive lookahead in a non-capturing group
            const potentialMatches = id
                .toString()
                .split(new RegExp(`(?=${pattern})`));
            const potentialMatchesAllMatch = potentialMatches.every((match) => {
                return match === pattern;
            });

            if (potentialMatchesAllMatch) {
                invalidIds.push(id);
            }
        });
    }
});

const sumOfInvalidIds = invalidIds.reduce((sum: number, cur: number) => {
    // eslint-disable-next-line no-param-reassign
    sum += cur;

    return sum;
}, 0);

console.log(invalidIds);
console.log(sumOfInvalidIds);
