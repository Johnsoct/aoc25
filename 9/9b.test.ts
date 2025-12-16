/* eslint-disable perfectionist/sort-maps */
import {
    describe,
    expect,
    test,
} from "vitest";

import {
    castRay,
    findEdges,
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

    const oddTests: Test[] = [
        {
            coordinate: [ -3, 0 ],
            edges: new Map([
                // Crosses once at [-1,0]
                [ "-1", [ [ 1,-1 ] ] ],
            ]),
            expectation: 1,
        },
        {
            coordinate: [ 3, 0 ],
            edges: new Map([
                [ "-1", [ [ 1,-1 ] ] ],
                // Crosses once at [4,0]
                [ "4", [ [ 7,-14 ] ] ],
            ]),
            expectation: 1,
        },
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                // Crosses once at [1,0]
                [ "1", [ [ 1,-1 ], [ 20,14 ] ] ],
                // Crosses once at [3,0]
                [ "3", [ [ 1,-1 ] ] ],
                // Crosses once at [333,0]
                [ "333", [ [ 1000,-1000 ] ] ],
            ]),
            expectation: 3,
        },
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                [ "-1", [ [ 1,-1 ] ] ],
                // Crosses at [1,0]
                [ "1", [ [ 1,-1 ] ] ],
            ]),
            expectation: 1,
        },
    ];

    oddTests.forEach(({ coordinate, edges, expectation }) => {
        test(`castRay crosses ${expectation} edges from ${coordinate}`, () => {
            expect(castRay(getEdgesInPathOfRay(edges, coordinate), coordinate)).toEqual(expectation);
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
            [ "-1", [ [ 1,-1 ] ] ],
            [ "1", [ [ 1,-1 ] ] ],
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
            [ "-1", [ [ 1,-1 ] ] ],
            [ "2", [ [ 2, -2 ] ] ],
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
            [ "-2", [ [ 1,-1 ] ] ],
            [ "2", [ [ 2,1 ], [ -1,-2 ] ] ],
            [ "10", [ [ 2,-2 ] ] ],
        ]);

        Array.from(expectedMap.keys()).forEach((key) => {
            expect(edges.has(key)).toEqual(true);
            expect(edges.get(key)).toStrictEqual(expectedMap.get(key));
        });
    });
});

describe("isCoordinateWithinPolygon", () => {
    const falses: Test[] = [
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                [ "-1", [ [ 1,-1 ] ] ],
            ]),
        },
        {
            coordinate: [ 5, 5 ],
            edges: new Map([
                [ "-1", [ [ 1,-1 ] ] ],
                [ "1", [ [ 1,-1 ] ] ],
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
                [ "-1", [ [ 1,-1 ] ] ],
            ]),
        },
        {
            coordinate: [ 3, 0 ],
            edges: new Map([
                [ "-1", [ [ 1,-1 ] ] ],
                // Crosses once at [4,0]
                [ "4", [ [ 7,-14 ] ] ],
            ]),
        },
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                // Crosses once at [1,0]
                [ "1", [ [ 1,-1 ], [ 20,14 ] ] ],
                // Crosses once at [3,0]
                [ "3", [ [ 1,-1 ] ] ],
                // Crosses once at [333,0]
                [ "333", [ [ 1000,-1000 ] ] ],
            ]),
        },
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                [ "-1", [ [ 1,-1 ] ] ],
                // Crosses at [1,0]
                [ "1", [ [ 1,-1 ] ] ],
            ]),
        },
    ];

    trues.forEach(({ coordinate, edges }) => {
        test(`${coordinate}`, () => {
            expect(isCoordinateWithinPolygon(edges, coordinate)).toEqual(true);
        });
    });
});

