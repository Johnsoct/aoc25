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

    console.log(range);

    for (let id = range[0]; id <= range[1]; id++) {
        // Skip any odd length'd range - cannot be a repeated sequence of pairs
        if (id.toString().length % 2 !== 0) {
            continue;
        }

        const firstHalf = id.toString().slice(0, id.toString().length / 2);
        const secondHalf = id.toString().slice(id.toString().length / 2);

        if (firstHalf === secondHalf) {
            invalidIds.push(id);
        }
    }
});

const sumOfInvalidIds = invalidIds.reduce((sum: number, cur: number) => {
    // eslint-disable-next-line no-param-reassign
    sum += cur;

    return sum;
}, 0);

console.log(invalidIds);
console.log(sumOfInvalidIds);
