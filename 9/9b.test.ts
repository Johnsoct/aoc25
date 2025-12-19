/* eslint-disable perfectionist/sort-maps */
import {
    describe,
    expect,
    test,
} from "vitest";

import {
    castRay,
    findEdges,
    findVertices,
    getEdgesInPathOfRay,
    isCoordinateWithinPolygon,
} from "./9b";

import type {
    EdgesMap,
} from "./9b.ts";

interface Test {
    coordinate: number[];
    edges: EdgesMap;
    expectation?: any;
};

describe("castRay", () => {
    const evenTests: Test[] = [];

    const truthyCases: Test[] = [
        {
            coordinate: [ -3, 0 ],
            edges: new Map([
                // Crosses once at [-1,0]
                [ -1, [ [ 1,-1 ] ] ],
            ]),
        },
        {
            coordinate: [ 3, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
                // Crosses once at [4,0]
                [ 4, [ [ 7,-14 ] ] ],
            ]),
        },
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                // Crosses once at [1,0]
                [ 1, [ [ 1,-1 ], [ 20,14 ] ] ],
                // Crosses once at [3,0]
                [ 3, [ [ 1,-1 ] ] ],
                // Crosses once at [333,0]
                [ 333, [ [ 1000,-1000 ] ] ],
            ]),
        },
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
                // Crosses at [1,0]
                [ 1, [ [ 1,-1 ] ] ],
            ]),
        },
        // Left edge
        {
            coordinate: [ -1, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
                [ 1, [ [ 1,-1 ] ] ],
            ]),
        },
        // Top edge
        {
            coordinate: [ 0, 1 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
                [ 1, [ [ 1,-1 ] ] ],
            ]),
        },
        // Right edge
        {
            coordinate: [ 1, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
                [ 1, [ [ 1,-1 ] ] ],
            ]),
        },
        // Bottom edge
        {
            coordinate: [ 0, -1 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
                [ 1, [ [ 1,-1 ] ] ],
            ]),
        },
    ];

    truthyCases.forEach(({ coordinate, edges }) => {
        test(`castRay returns true for ${coordinate}`, () => {
            expect(castRay(getEdgesInPathOfRay(edges, coordinate))).toEqual(true);
        });
    });
});

describe("findEdges", () => {
    /*
     * (-1,1) . | . (1,1)
     * ---------|---------
     * (-1,-1). | . (1,-1)
     */
    const verticesOfASquare = [
        // top left 
        [ -1, 1 ],
        // top right
        [ 1, 1 ],
        // bottom right
        [ 1, -1 ],
        // bottom left
        [ -1, -1 ],
    ];

    test("Continuous vertices along the same X coordinate are recorded as a single edge", () => {
        const edges = findEdges(verticesOfASquare);
        const expectedMap = new Map([
            [ -1, [ [ 1,-1 ] ] ],
            [ 1, [ [ 1,-1 ] ] ],
        ]);

        Array.from(expectedMap.keys()).forEach((key) => {
            expect(edges.has(key)).toEqual(true);
            expect(edges.get(key)).toStrictEqual(expectedMap.get(key));
        });
    });

    test("If the first and last X coordinate are along the same edge, they're record as part of the same edge", () => {
        const edges = findEdges([
            [ -1, 1 ],
            [ 2, 2 ],
            [ 2, -2 ],
            [ -1, -1 ],
        ]);
        const expectedMap = new Map([
            [ -1, [ [ 1,-1 ] ] ],
            [ 2, [ [ 2, -2 ] ] ],
        ]);

        Array.from(expectedMap.keys()).forEach((key) => {
            expect(edges.has(key)).toEqual(true);
            expect(edges.get(key)).toStrictEqual(expectedMap.get(key));
        });
    });

    test("Support for multiple edges on the same X coordinate", () => {
        /*
         *          | . (2,2) . (10,2)
         * (-2,1) . | . (2,1) . (10,1)
         * ---------|----------
         * (-2,-1). | . (2,-1). (10,-1)
         *            . (2,-2). (10,-2)
         *
         *            ---------
         *            |       |
         *        .---.       |
         *        |           |
         *        .---.       |
         *            |       |
         *            ---------
         */
        const edges = findEdges([
            [ -2, 1 ],
            [ 2, 1 ],
            [ 2, 2 ],
            [ 10, 2 ],
            [ 10, -2 ],
            [ 2, -2 ],
            [ 2, -1 ],
            [ -2, -1 ],
        ]);
        const expectedMap = new Map([
            [ -2, [ [ 1,-1 ] ] ],
            [ 2, [ [ 2,1 ], [ -1,-2 ] ] ],
            [ 10, [ [ 2,-2 ] ] ],
        ]);

        Array.from(expectedMap.keys()).forEach((key) => {
            expect(edges.has(key)).toEqual(true);
            expect(edges.get(key)).toStrictEqual(expectedMap.get(key));
        });
    });
});

describe("findVertices", () => {
    test("Square: all four corners are vertices", () => {
        const coordinates = [
            [ -1, 1 ],
            [ 1, 1 ],
            [ 1, -1 ],
            [ -1, -1 ],
        ];

        expect(findVertices(coordinates)).toStrictEqual(coordinates);
    });

    test("Polygon: not all coordinates are vertices", () => {
        const coordinates = [
            [ -4, 1 ],
            [ -2, 1 ],
            [ -2, 4 ],
            [ 1, 4 ],
            [ 1, 3 ],
            [ 3, 3 ],
            [ 5, 3 ],
            [ 5, -1 ],
            [ 5, -5 ],
            [ 1, -5 ],
            [ -4, -5 ],
            [ -4, -2 ],
        ];
        const expectation = [
            [ -4, 1 ],
            [ -2, 1 ],
            [ -2, 4 ],
            [ 1, 4 ],
            [ 1, 3 ],
            [ 5, 3 ],
            [ 5, -5 ],
            [ -4, -5 ],
        ];

        expect(findVertices(coordinates)).toStrictEqual(expectation);
    });
});

describe("getEdgesInPathOfRay", () => {
    const tests: Test[] = [
        // Simple with single X value
        {
            coordinate: [ -3, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
            ]),
            expectation: new Map([
                [ -1, [ [ 1,-1 ] ] ],
            ]),

        },
        // Simple with multiple X values
        {
            coordinate: [ 3, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
                [ 4, [ [ 7,-14 ] ] ],
            ]),
            expectation: new Map([
                [ 4, [ [ 7,-14 ] ] ],
            ]),

        },
        // Complex with multiple edges at multiple X values
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                [ 1, [ [ 1,-1 ], [ 20,14 ] ] ],
                [ 3, [ [ 1,-1 ] ] ],
                [ 333, [ [ 1000,-1000 ] ] ],
            ]),
            expectation: new Map([
                [ 1, [ [ 1,-1 ] ] ],
                [ 3, [ [ 1,-1 ] ] ],
                [ 333, [ [ 1000,-1000 ] ] ],
            ]),

        },
        // Coordinate intersects with top or bottom bounds of X edges
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                [ 1, [ [ 1,-1 ], [ 20,14 ] ] ],
                [ 3, [ [ 1,-1 ] ] ],
                [ 97, [ [ 0,-12 ] ] ],
                [ 197, [ [ 12,0 ] ] ],
                [ 333, [ [ 1000,-1000 ] ] ],
            ]),
            expectation: new Map([
                [ 1, [ [ 1,-1 ] ] ],
                [ 3, [ [ 1,-1 ] ] ],
                [ 97, [ [ 0,-12 ] ] ],
                [ 197, [ [ 12,0 ] ] ],
                [ 333, [ [ 1000,-1000 ] ] ],
            ]),

        },
    ];

    tests.forEach(({ coordinate, edges, expectation }) => {
        test(`Coordinate, ${coordinate}, makes boom boom with these edges, ${Array.from(expectation)}`, () => {
            expect(getEdgesInPathOfRay(edges, coordinate)).toStrictEqual(expectation);
        });
    });

    test("The coordinate's X value is smaller than all the X values of all the edges", () => {
        tests.forEach(({ coordinate, edges }) => {
            const edgesInPathOfRay = getEdgesInPathOfRay(edges, coordinate);

            for (const key of edgesInPathOfRay.keys()) {
                expect(coordinate[0]).toBeLessThan(key);
            }
        });
    });

    test("The coordinate's Y value is within the Y bounds of all the edges", () => {
        tests.forEach(({ coordinate, edges }) => {
            const edgesInPathOfRay = getEdgesInPathOfRay(edges, coordinate);

            for (const value of edgesInPathOfRay.values()) {
                value.forEach(([ yTop, yBottom ]) => {
                    expect(coordinate[1]).toBeLessThanOrEqual(yTop);
                    expect(coordinate[1]).toBeGreaterThanOrEqual(yBottom);
                });
            }
        });
    });

    test("Each edge at the given X value should be evaluated independently", () => {
        const coordinate = [ 0, 0 ];
        const edges = new Map([
            [ 1, [ [ 1,-1 ], [ 20,14 ] ] ],
            [ 3, [ [ 1,-1 ] ] ],
            [ 97, [ [ 0,-12 ] ] ],
            [ 197, [ [ 12,0 ] ] ],
            [ 333, [ [ 1000,-1000 ] ] ],
        ]);
        const expectation = new Map([
            // [ 20,14 ] should not be returned
            [ 1, [ [ 1,-1 ] ] ],
            [ 3, [ [ 1,-1 ] ] ],
            [ 97, [ [ 0,-12 ] ] ],
            [ 197, [ [ 12,0 ] ] ],
            [ 333, [ [ 1000,-1000 ] ] ],
        ]);

        expect(getEdgesInPathOfRay(edges, coordinate)).toStrictEqual(expectation);
    });
});

describe("isCoordinateWithinPolygon", () => {
    const falses: Test[] = [
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
            ]),
        },
        {
            coordinate: [ 5, 5 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
                [ 1, [ [ 1,-1 ] ] ],
            ]),
        },
    ];

    falses.forEach(({ coordinate, edges }) => {
        test(`${coordinate}`, () => {
            expect(isCoordinateWithinPolygon(edges, coordinate)).toEqual(false);
        });
    });

    const trues: Test[] = [
        {
            coordinate: [ -3, 0 ],
            edges: new Map([
                // Crosses once at [-1,0]
                [ -1, [ [ 1,-1 ] ] ],
            ]),
        },
        {
            coordinate: [ 3, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
                // Crosses once at [4,0]
                [ 4, [ [ 7,-14 ] ] ],
            ]),
        },
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                // Crosses once at [1,0]
                [ 1, [ [ 1,-1 ], [ 20,14 ] ] ],
                // Crosses once at [3,0]
                [ 3, [ [ 1,-1 ] ] ],
                // Crosses once at [333,0]
                [ 333, [ [ 1000,-1000 ] ] ],
            ]),
        },
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
                // Crosses at [1,0]
                [ 1, [ [ 1,-1 ] ] ],
            ]),
        },
    ];

    trues.forEach(({ coordinate, edges }) => {
        test(`${coordinate}`, () => {
            expect(isCoordinateWithinPolygon(edges, coordinate)).toEqual(true);
        });
    });
});

