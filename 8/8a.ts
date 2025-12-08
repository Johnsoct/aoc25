import puzzleData from "./8.json" with { type: "json" };

/*
 * Union-find / Disjoint Set Union problem:
 *
 * 1. Calculate the distances between all pair combinations
 * 2. Store the pairs according to the shortest to longest distance
 * 3. Iterate over each stored pair for the first 1000 pairs
 * 3.1 Connect circuits via merging
     * 3.1.1 For each junction box, find what circuit it is in
         * 3.1.1.1 If both junction boxes are already in a circuit, skip
         * 3.1.1.2 If first junction box is in a circuit, set the second junction's map value to the coordinates of the first
         * 3.1.1.3 If the first function box is not in a circuit, set the first junction's map value to itself and the second junctions' map value to the first's
 * 4. Search over union-find map and find all the roots (keys with identical values)
 * 5. Search for all the junction boxes in each of the three largest circuts
 * 6. What is the size of the three largest circuits junctions boxes multiplied together?
 *
 * Union-find:
 * Each junction box points to a "parent," which is initially istelf
 * To find what circuit a junction box is in, follow the parent pointers to the "root"
 * To merge circuits, make one root point to the other
 *
 * Process 1000 shortest pairs (but let's trace the first few):
 * Pair 1: A-B (distance 5) → Connect [A,B]
 * Pair 2: C-D (distance 7) → Connect [C,D]  
 * Pair 3: E-F (distance 8) → Connect [E,F]
 * Pair 4: A-C (distance 9) → Connect [A,B,C,D]
 * Pair 5: B-D (distance 10) → Skip! Already in same circuit
 * Pair 6: G-H (distance 11) → Connect [G,H]
 * Pair 7: E-G (distance 12) → Connect [E,F,G,H]
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
const unions = new Map<string, number[]>();


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

const findRoot = (
    coordinate: number[],
    map: typeof unions
) => {
    let mapKey = coordinate;

    // Keep following the pointers to the root parent
    while (map.get(getMapKeyOrValue(mapKey)) !== mapKey) {
        if (!map.has(getMapKeyOrValue(coordinate))) {
            throw new Error(`Map does not have ${coordinate} key`);
        }

        mapKey = map.get(getMapKeyOrValue(mapKey))!;
    }

    return mapKey;
};

const getMapKeyOrValue = (coordinate: number[]): string => {
    const mapKeySafeValue = `${coordinate[0]}-${coordinate[1]}-${coordinate[2]}`;

    return mapKeySafeValue;
};

const initializeUnions = (
    junctionBoxCoordinates: number[][]
): void => {
    junctionBoxCoordinates.forEach((coordinate: number[]) => {
        unions.set(getMapKeyOrValue(coordinate), coordinate);
    });
};

const sortJunctionBoxCoordinatePairsByAscDistance = (
    junctionBoxCoordinates: number[][]
): number[][] => {
    const sortedPairs = [];
    const unsortedPairs = [];

    junctionBoxCoordinates.forEach((coordinate: number[]) => {
        unsortedPairs.push(
    });

    return sortedPairs;
};

const union = (
    coordinateA: number[],
    coordinateB: number[]
): boolean => {
    const rootA = findRoot(coordinateA, unions);
    const rootB = findRoot(coordinateB, unions);

    // Already in the same circuit
    if (rootA === rootB) {
        return false;
    }
    // Point rootB to rootA
    else {
        unions.set(getMapKeyOrValue(coordinateB), coordinateA);

        return true;
    }
};

initializeUnions(junctionBoxCoordinates);

const sortedPairs = sortJunctionBoxCoordinatePairsByAscDistance(junctionBoxCoordinates);
