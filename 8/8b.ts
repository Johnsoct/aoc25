import puzzleData from "./8.json" with { type: "json" };

/*
 * Union-find / Disjoint Set Union problem:
 *
 * Continuing from part one, it's been determined that the first one thousand
 * pairs of junction boxes requires too many extension cords, so we need to continue
 * pairing junction boxes until we have one large circuit.
 *
 * The key is to keep track of how many circuits we have so we can capture the pair of
 * coordinates which first connect all the junction boxes in a single circuit.
 *
 * We must then take the X coordinate of each pair value and multiple them together.
 *
 * 0. Initialize a counter to the number of initialized unions (all junction boxes)
 * 1. Subtract 1 from the counter whenever a union is made
 * 2. If the number of unions is updated to 0, capture the pair
 * 3. Multiply the X coordinate of the pair values
 * 4. Return ^
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
 * countUniqueCircuits
 *
 * Creates a set of circuits based on the existing number of root values, and then returns
 * the size of the set.
 *
 * By utilizing a Set, we can skip checking for duplicate values.
 */
const countUniqueCircuits = () => {
    const uniqueRoots = new Set();

    junctionBoxCoordinates.forEach((coordinate) => {
        const root = findRoot(coordinate, unions);

        uniqueRoots.add(root);
    });

    return uniqueRoots.size;
};

initializeUnions(junctionBoxCoordinates);

for (const [ pairA, pairB ] of sortJunctionBoxCoordinatePairsByAscDistance(junctionBoxCoordinates)) {
    if (union(pairA, pairB)) {
        if (countUniqueCircuits() === 1) {
            console.log(pairA[0] * pairB[0]);
        }
    }
};
