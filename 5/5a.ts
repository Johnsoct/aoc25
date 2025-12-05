import puzzleData from "./5.json" with { type: "json" };

const availableFreshIngredientIDs: number[] = [];
const availableIngredientIDs = puzzleData.availableIngredientIDs;
const freshIngredientIDRanges = puzzleData.freshIngredientIDRanges;
const freshIngredientIDMinMaxs: number[][] = [];

freshIngredientIDRanges.forEach((range) => {
    const leftBound = Number(range.split("-")[0]);
    const rightBound = Number(range.split("-")[1]);

    freshIngredientIDMinMaxs.push([ leftBound, rightBound ]);
});

availableIngredientIDs.forEach((id) => {
    for (const [ min, max ] of freshIngredientIDMinMaxs) {
        if (min <= id && id <= max) {
            availableFreshIngredientIDs.push(id);
            break;
        }
    };
});

console.log(availableFreshIngredientIDs.length);
