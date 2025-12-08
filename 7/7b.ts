import puzzleData from "./7.json" with { type: "json" };

/*
 * Tachyon particles start at the position of "S" and only move
 * straight down.
 *
 * Unlike part one, we need to count all the possible paths a particle
 * can take getting to the bottom depending on whether it goes left or
 * right at each splitter.
 *
 * 1. Start at position "S"
 * 2. At each position, check if it's a splitter
 * 3. If a splitter, count the sum of the paths from going left AND right
 * 4. If empty, go straight down one row
 * 5. If you reach the bottom, return 1 (one complete path)
 *
 * Use cases to look for:
 * 1. Out of left and right bounds
 * 2. At the bottom
 *
 * Recursion:
 * Instead of loops, use recursion once if the position is empty and twice
 * for the left and right paths if the position is a splitter.
 *
 * Count:
 * Each recursive call should store it's count; and at the end, the
 * sum of the counts should be returned.
 *
 * Memoization:
 * Since we'll be evaluating the path count at most coordinates many times,
 * with earlier coordinates evaluated exponentially more frequently, we should
 * first look for a cached result, and if non-existent, evaluate the paths
 * and cache the result for future look up.
 */

const memoizedCoordinateResults = new Map();
const manifold = puzzleData.manifold;
const manifoldBottomBound = manifold.length - 1;
const manifoldLeftBound = 0;
const manifoldRightBound = manifold[0].length - 1;
const startingPosition = manifold[0].indexOf("S");

const getMapFriendlyKeyValue = ([ x, y ]: number[]) => {
    return `${x}-${y}`;
};

const countPaths = ([ x, y ]: number[]): number => {
    if (memoizedCoordinateResults.has(getMapFriendlyKeyValue([ x, y ]))) {
        return memoizedCoordinateResults.get(getMapFriendlyKeyValue([ x, y ]));
    }

    if (
        x < manifoldLeftBound
        || x > manifoldRightBound
    ) {
        return 0;
    }

    if (y > manifoldBottomBound) {
        return 1;
    }

    if (manifold[y][x] === "^") {
        const leftCount = countPaths([ x - 1, y + 1 ]);
        const rightCount = countPaths([ x + 1, y + 1 ]);
        const sum = leftCount + rightCount;

        memoizedCoordinateResults.set(getMapFriendlyKeyValue([ x, y ]), sum);

        return sum;
    }
    else {
        const straightDownCount = countPaths([ x, y + 1 ]);

        memoizedCoordinateResults.set(getMapFriendlyKeyValue([ x, y ]), straightDownCount);

        return straightDownCount;
    }
};

const numberOfPaths = countPaths([ startingPosition, 0 ]);

console.log(numberOfPaths);
