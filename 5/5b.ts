import puzzleData from "./5.json" with { type: "json" };

const freshIngredientIDRangesSorted = puzzleData
    .freshIngredientIDRanges
    .map((range) => {
        return range
            .split("-")
            .map(Number);
    })
    .sort((a, b) => {
        const aMin = a[0];
        const bMin = b[0];

        return aMin - bMin;
    });
const freshIngredientIDRangesMerged: number[][] = [];

let [ currentMin, currentMax ] = freshIngredientIDRangesSorted[0];

// The sorted ranges are sorted from smallest to largest min values
for (let nextIndex = 1; nextIndex < freshIngredientIDRangesSorted.length; nextIndex++) {
    const nextMin = freshIngredientIDRangesSorted[nextIndex][0];
    const nextMax = freshIngredientIDRangesSorted[nextIndex][1];

    // NOTE: because the sorted ranges are sorted by min value, we don't have to check for that
    // NOTE: by adding + 1 we are checking if the next min is immediately adjacent to the end of the current range
    // Sorted min is within current range! Extend current...
    if (nextMin <= currentMax + 1) {
        // nextMax may not be larger than currentMax
        currentMax = Math.max(currentMax, nextMax);
    }
    // Gap found! Add current to merges and update current...
    else {
        freshIngredientIDRangesMerged.push([ currentMin, currentMax ]);
        [ currentMin, currentMax ] = [ nextMin, nextMax ];
    }
}

// Last current does not get inserted because it gets updated AFTER a gap is found and the merged
// IDs are updated and the loop ends
freshIngredientIDRangesMerged.push([ currentMin, currentMax ]);

const numberOfIngredientIDsAreFresh = freshIngredientIDRangesMerged.reduce((acc, [ rangeMin, rangeMax ]) => {
    // Ranges are inclusive, so we have to add one to the subtraction
    return acc + (rangeMax - rangeMin + 1);
}, 0);

console.log(numberOfIngredientIDsAreFresh);
