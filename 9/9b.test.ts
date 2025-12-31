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
     * (-3,3) .  |  . (3,3)
     *           |
     * (-3,1) .  |
     * ----------|-----------
     *           |
     *           |
     * (-3,-3).  |. . (3,-3)
     *            (1,-3)
     */
    const verticesOfASquare: Vertices = [
        // top left 
        [ -3, 3 ],
        // top right
        [ 3, 3 ],
        // bottom right
        [ 3, -3 ],
        // Bottom middle
        [ 1, -3 ],
        // bottom left
        [ -3, -3 ],
        // Left middle
        [ -3, 1 ],
    ];

    test.only("Continuous vertices along the same X coordinate are recorded as a single edge", () => {
        const {
            xEdges,
        } = findEdges(verticesOfASquare);
        const expectedXMap = new Map([
            [ -3, [ [ 3,-3 ] ] ],
            [ 3, [ [ 3,-3 ] ] ],
        ]);

        Array.from(expectedXMap.keys()).forEach((key) => {
            expect(xEdges.has(key)).toEqual(true);
            expect(xEdges.get(key)).toStrictEqual(expectedXMap.get(key));
        });
    });

    test("If the first and last X coordinate are along the same edge, they're record as part of the same edge", () => {
        const { xEdges } = findEdges([
            [ -1, 1 ],
            [ -1, -1 ],
        ]);
        const expectedXMap = new Map([
            [ -1, [ [ 1,-1 ] ] ],
        ]);

        Array.from(expectedXMap.keys()).forEach((key) => {
            expect(xEdges.has(key)).toEqual(true);
            expect(xEdges.get(key)).toStrictEqual(expectedXMap.get(key));
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
        const { xEdges } = findEdges([
            [ -2, 1 ],
            [ 2, 1 ],
            [ 2, 2 ],
            [ 10, 2 ],
            [ 10, -2 ],
            [ 2, -2 ],
            [ 2, -1 ],
            [ -2, -1 ],
        ]);
        const expectedXMap = new Map([
            [ -2, [ [ 1,-1 ] ] ],
            [ 2, [ [ 2,1 ], [ -1,-2 ] ] ],
            [ 10, [ [ 2,-2 ] ] ],
        ]);

        Array.from(expectedXMap.keys()).forEach((key) => {
            expect(xEdges.has(key)).toEqual(true);
            expect(xEdges.get(key)).toStrictEqual(expectedXMap.get(key));
        });
    });
});

describe("isCoordinateWithinPolygon", () => {
    interface Test {
        coordinate: number[];
        edges: EdgesMap;
    };

    const falses: Test[] = [
        {
            coordinate: [ 0, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
            ]),
        },
    ];

    falses.forEach(() => {
        test("", () => {
        });
    });

    const trues: Test[] = [
        {
            coordinate: [ -3, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
            ]),
        },
        {
            coordinate: [ 3, 0 ],
            edges: new Map([
                [ -1, [ [ 1,-1 ] ] ],
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
    ];

    trues.forEach(({ coordinate, edges }) => {
        test(`${coordinate}`, () => {
            expect(isCoordinateWithinPolygon(edges, coordinate)).toEqual(true);
        });
    });
});

