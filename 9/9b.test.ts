/* eslint-disable perfectionist/sort-sets */
/* eslint-disable perfectionist/sort-maps */
import {
    describe,
    expect,
    test,
} from "vitest";

import {
    findEdges,
    isCoordinateWithinPolygon,
} from "./9b";

import type {
    EdgesMap,
    Vertices,
} from "./9b.ts";


describe("findEdges", () => {
    /*
     * (-1,1) . | . (1,1)
     * ---------|---------
     * (-1,-1). | . (1,-1)
     */
    const verticesOfASquare = new Set([
        // top left 
        [ -1, 1 ],
        // top right
        [ 1, 1 ],
        // bottom right
        [ 1, -1 ],
        // bottom left
        [ -1, -1 ],
    ]);

    test("Continuous vertices along the same X coordinate are recorded as a single edge", () => {
        const edges = findEdges(verticesOfASquare);
        const expectedMap = new Map([
            [ "-1", new Set([ "[1,-1]" ]) ],
            [ "1", new Set([ "[1,-1]" ]) ],
        ]);

        Array.from(expectedMap.keys()).forEach((key) => {
            expect(edges.has(key)).toEqual(true);
            expect(edges.get(key)).toStrictEqual(expectedMap.get(key));
        });
    });

    test("If the first and last X coordinate are along the same edge, they're record as part of the same edge", () => {
        const edges = findEdges(new Set([
            [ -1, 1 ],
            [ -1, -1 ],
        ]));
        const expectedMap = new Map([
            [ "-1", new Set([ "[1,-1]" ]) ],
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
        const edges = findEdges(new Set([
            [ -2, 1 ],
            [ 2, 1 ],
            [ 2, 2 ],
            [ 10, 2 ],
            [ 10, -2 ],
            [ 2, -2 ],
            [ 2, -1 ],
            [ -2, -1 ],
        ]));
        const expectedMap = new Map([
            [ "-2", new Set([ "[1,-1]" ]) ],
            [ "2", new Set([ "[2,1]", "[-1,-2]" ]) ],
            [ "10", new Set([ "[2,-2]" ]) ],
        ]);

        Array.from(expectedMap.keys()).forEach((key) => {
            expect(edges.has(key)).toEqual(true);
            expect(edges.get(key)).toStrictEqual(expectedMap.get(key));
        });
    });
});

describe("isCoordinateWithinPolygon", () => {
    interface Test {
        boundaryX: number;
        coordinate: number[];
        edges: EdgesMap;
    };

    const falses: Test[] = [
        {
            boundaryX: 10,
            coordinate: [ 0, 0 ],
            edges: new Map([
                [ "-1", new Set([ "[1,-1]" ]) ],
            ]),
        },
    ];

    falses.forEach(({ boundaryX, coordinate, edges }) => {
        test(`${coordinate}`, () => {
            expect(isCoordinateWithinPolygon(edges, coordinate, boundaryX)).toEqual(false);
        });
    });

    const trues: Test[] = [
        {
            boundaryX: 10,
            coordinate: [ -3, 0 ],
            edges: new Map([
                [ "-1", new Set([ "[1,-1]" ]) ],
            ]),
        },
        {
            boundaryX: 10,
            coordinate: [ 3, 0 ],
            edges: new Map([
                [ "-1", new Set([ "[1,-1]" ]) ],
                [ "4", new Set([ "[7,-14]" ]) ],
            ]),
        },
        {
            boundaryX: 1000,
            coordinate: [ 0, 0 ],
            edges: new Map([
                // Crosses once at [1,0]
                [ "1", new Set([ "[1,-1]", "[20,14]" ]) ],
                // Crosses once at [3,0]
                [ "3", new Set([ "[1,-1]" ]) ],
                // Crosses once at [333,0]
                [ "333", new Set([ "[1000,-1000]" ]) ],
            ]),
        },
    ];

    trues.forEach(({ boundaryX, coordinate, edges }) => {
        test.only(`${coordinate}`, () => {
            expect(isCoordinateWithinPolygon(edges, coordinate, boundaryX)).toEqual(true);
        });
    });
});

