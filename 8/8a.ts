import puzzleData from "./8.json" with { type: "json" };

/*
 * Union-find / Disjoint Set Union problem:
 *
 * Union-find: A map of keys with values pointing to their "parent" key in a tree structure. Keys that point to themselves are called, "roots," which represent a set or group of values. Values are not suppose to be an array of all the values in a parent, but a single value, which builds a tree like structure.
 *
 * Circuit 1:        Circuit 2:        Circuit 3:
 *    A (root)          E (root)          I (root)
 *   / \                / \
 *  B   C              F   G
 *  |
 *  D
 *
 * Three separate trees = three separate circuits
 *
 * After Union(A, E):
 *    A (root)
 *   /|\  \
 *  B C E  
 *  |  /|
 *  D F G
 * 
 * In terms of the challenge:
 * 1. Each junction box points to a "parent," which is initially itself (not necessarily set to itself initially)
 * 2. To find what circuit a junction box is in, follow the parent pointers to the "root"
 * 3. To merge circuits, make one root point to the other
 *
 * Challenge steps:
 * 1. Calculate the distances between all pair combinations
 * 2. Store the pairs according to the shortest to longest distance
 * 3. Iterate over the first 1000 stored pairs
 * 3.1 Connect circuits via merging in a "union-find" data structure
     * 3.1.1 For each junction box, find what circuit it is in
         * 3.1.1.1 If both junction boxes are already in a circuit, skip
         * 3.1.1.2 If first junction box is in a circuit, set the second junction's map value to the coordinates of the first
         * 3.1.1.3 If the first function box is not in a circuit, set the first junction's map value to itself and the second junctions' map value to the first's
 * 4. Search over union-find map and find all the roots (keys with identical values)
 * 5. Search for all the junction boxes in each of the three largest circuts
 * 6. What is the size of the three largest circuits junctions boxes multiplied together?
 *
 * Process 1000 shortest pairs (but let's trace the first few):
 * Pair 1: A-B (distance 5) → Connect [A,B] (B points to A)
 * Pair 2: C-D (distance 7) → Connect [C,D] (D points to C) 
 * Pair 3: E-F (distance 8) → Connect [E,F] (F points to E)
 * Pair 4: A-C (distance 9) → Connect [A,B,C,D] (D points to C, which now points to A)
 * Pair 5: B-D (distance 10) → Skip! Already in same circuit
 * Pair 6: G-H (distance 11) → Connect [G,H] (H points to G)
 * Pair 7: E-G (distance 12) → Connect [E,F,G,H] (H points to G, which now points to E)
 * ...
 * After these connections, you have:

 * Circuit 1: [A,B,C,D]
 * Circuit 2: [E,F,G,H]
 * Circuit 3: [I]
 * Circuit 4: [J]
 * 
 * Early connections might create separate clusters:
 * 
 * Pairs 1-10: Create circuit [A,B,C,D]
 * Pairs 11-20: Create circuit [E,F,G,H]
 * ...these circuits are separate...
 * 
 * Then later:
 * 
 * Pair 487: A-E (distance 156) → Merge! Now [A,B,C,D,E,F,G,H]
 */

// 3D coordinates: [ X, Y, Z ]
const junctionBoxCoordinates: number[][] = puzzleData.junctionBoxCoordinates;
const unions = new Map<string, string>();

// Foonctions
const euclideanDistanceFormulate = (
    coordinateA: number[],
    coordinateB: number[]
): number => {
    const p1 = Math.pow((coordinateA[0] - coordinateB[0]), 2);
    const p2 = Math.pow((coordinateA[1] - coordinateB[1]), 2);
    const p3 = Math.pow((coordinateA[2] - coordinateB[2]), 2);

    return Math.sqrt(p1 + p2 + p3);
};

/*
 * findRoot
 *
 * Starts at a coordinate, and keeps following the tree ("union-find") upwards
 * until it finds a coordinate whose value is itself.
 *
 * If any coordinate doesn't exist in the union-find, pannnnnic!
 */
const findRoot = (
    coordinate: number[],
    map: typeof unions
) => {
    let mapKey = getMapSafeCoordinateValue(coordinate);

    // Keep following the pointers to the root parent
    while (map.get(mapKey) !== mapKey) {
        if (!map.has(mapKey)) {
            throw new Error(`Map does not have ${coordinate} key`);
        }

        mapKey = map.get(mapKey)!;
    }

    return mapKey;
};

/*
 * getMapSafeCoordinateValue
 *
 * Returns a Map safe key value (stringified version of an array of numbers)
 */
const getMapSafeCoordinateValue = (coordinate: number[]): string => {
    const mapKeySafeValue = `${coordinate[0]}-${coordinate[1]}-${coordinate[2]}`;

    return mapKeySafeValue;
};

/*
 * initializeUnions
 *
 * Adds each coordinate to the union with identical key and value.
 *
 * We could technically lazily evaluate whether a coordinate should be added to the union as itself,
 * but by doing it upfront, it simplifies functions, such as `findRoot`, by avoiding having to check
 * if a coordinate exists in the union. Technically, though, lazily would be more memory efficient
 * since we're only checking X number of pairs; however, if we were checking every pair, this is the
 * best approach as it's far more simple.
 */
const initializeUnions = (
    junctionBoxCoordinates: number[][]
): void => {
    junctionBoxCoordinates.forEach((coordinate: number[]) => {
        const mapSafeValue = getMapSafeCoordinateValue(coordinate);

        unions.set(mapSafeValue, mapSafeValue);
    });
};

/*
 * sortJunctionBoxCoordinatePairsByAscDistance
 *
 * Iterate over each junctionBoxCoordinates, calculate the distance between the current coordinate
 * and all other coordinates, store that value in `unsortedPairs` with the distance.
 *
 * Sort the unsortedPairs by their distances.
 */
const sortJunctionBoxCoordinatePairsByAscDistance = (
    junctionBoxCoordinates: number[][]
): number[][][] => {
    // [[ [...pairA], [...pairB], distance ], ...]
    const unsortedPairs: { distance: number; pairA: number[], pairB: number[], }[] = [];

    for (
        let currentCoordinateIndex = 0;
        currentCoordinateIndex < junctionBoxCoordinates.length;
        currentCoordinateIndex++
    ) {
        for (
            let nextCoordinateIndex = currentCoordinateIndex + 1;
            nextCoordinateIndex < junctionBoxCoordinates.length;
            nextCoordinateIndex++
        ) {
            const pairA = junctionBoxCoordinates[currentCoordinateIndex];
            const pairB = junctionBoxCoordinates[nextCoordinateIndex];

            unsortedPairs.push({
                distance: euclideanDistanceFormulate(pairA, pairB),
                pairA: pairA,
                pairB: pairB,
            });
        }
    }

    unsortedPairs.sort(({ distance: distanceA }, { distance: distanceB }) => {
        return distanceA - distanceB;
    });

    return unsortedPairs.map((pair) => {
        return [
            [ ...pair.pairA ],
            [ ...pair.pairB ],
        ];
    });
};

/*
 * union
 *
 * Since all coordinates are pre-initialized into a circuit of themselves, we don't need to
 * check if they're in circuits. We skip directly to saying, if they're in the same circuit
 * don't do anything and if not, combine them assuming coordinateA is the parent since it
 * was first in the union call (first to be addressed).
 */
const union = (
    coordinateA: number[],
    coordinateB: number[]
): boolean => {
    const rootA = findRoot(coordinateA, unions);
    const rootB = findRoot(coordinateB, unions);

    // Already in the same circuit; do nothing
    if (rootA === rootB) {
        return false;
    }
    // Point rootB to rootA
    else {
        unions.set(rootB, rootA);

        return true;
    }
};

/*
 * createCircuits
 *
 * Gets the sorted pairs of the junctionBoxCoordinates and unions them together to create
 * circuits based on proximity
 */
const createCircuits = (pairLimit = 1000) => {
    const sortedPairs = sortJunctionBoxCoordinatePairsByAscDistance(junctionBoxCoordinates);

    // NOTE: .slice(x, y) - y is exclusive
    sortedPairs.slice(0, pairLimit).forEach((pair) => {
        union(pair[0], pair[1]);
    });
};

/*
 * findRootCircuitSizes
 *
 * Iterates over each coordinate in the junctionBoxCoordinates and finds the root, which is
 * either added or updated in a map.
 */
const findRootCircuitSizes = () => {
    const rootCircuitSizes = new Map<string, number>();

    junctionBoxCoordinates.forEach((coordinates) => {
        const root = findRoot(coordinates, unions);

        rootCircuitSizes.set(root, (rootCircuitSizes.get(root) || 0) + 1);
    });

    return rootCircuitSizes;
};

/*
 * findTopLargestCircuits
 *
 * Sorts an map of string/number pairs by the values and returns the first
 * three results.
 */
const findTopLargestCircuits = (rootCircuitSizes: Map<string, number>) => {
    const sizes = Array.from(rootCircuitSizes.values());

    sizes.sort((a, b) => {
        return b - a;
    });

    return sizes.slice(0, 3);
};

initializeUnions(junctionBoxCoordinates);
createCircuits(1000);

const rootCircuitSizes = findRootCircuitSizes();
const threeLargestCircuits = findTopLargestCircuits(rootCircuitSizes);

console.log(threeLargestCircuits);
console.log(threeLargestCircuits[0] * threeLargestCircuits[1] * threeLargestCircuits[2]);
