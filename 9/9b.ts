import puzzleData from "./9.json" with { type: "json" };

export type Coordinate = number[];

export type Directions = "down" | "left" | "right" | "up";

export type Edges = number[];

export type KeySafeCoordinate = string;

export type Y = number;

export type EdgesMap = Map<Y, Set<Edges>>;
export type Vertices = Coordinate[];

const coordinatesOutsideOfPolygon = new Set<string>();

const calculateArea = (corner: number[], oppositeCorner: number[]) => {
    // Corner: [ 97634, 50187 ], Opposite corner: [ 97839, 50187 ]
    // height: 1 = 50187 - 50187
    // width: 205 = 97839 - 97634
    const height = Math.abs(corner[1] - oppositeCorner[1]) + 1;
    const width = Math.abs(corner[0] - oppositeCorner[0]) + 1;
    // const height = Math.max(Math.abs(corner[1] - oppositeCorner[1]), 1);
    // const width = Math.max(Math.abs(corner[0] - oppositeCorner[0]), 1);

    return height * width;
};

/*
 * castRay
 *
 * Implements ray casting towards the right.
 *
 * Counts the number of times a "ray" crosses, which in this case is the number of
 * edges in the path of the ray.
 *
 * When checking if a coordinate is within the polygon, we "cast" a ray from the coordinate
 * towards X direction and count the number of edges the ray crosses. To cast the ray, we
 * need to know the edges in the path of the ray, so this returns the vertical edges which
 * will be in the way of the right moving cast ray.
 *
 * A canonical vertical-edge check: "a ray from (px, py) crosses a vertical segment
 * at x=xEdge if `xEdge > px` **and** `py` is between `[bottom, top)`.
 *
 * There is a term, "half-open," which means you leave on boundaries "half-open" to
 * avoid double-counting edges when have the same Y value but different X values.
 *
 * Example of a finding an edge for a coordinateStart of (-4, 3):
 *     (1,10) .
 *            |
 *     (1, 3) .__. (5, 3)
 *
 * Here we have a coordinate which will technically intersect two edges; however,
 * only one edge should count since the first edge is a vertex which connects
 * to a horizontal edge ((1,3) is the bottom bound of a vertical edge but it
 * connects with the line segment between (1, 3) and (5, 3); therefore only
 * the edge at (5, 3) should count for the casted ray). "half-open" intervals
 * prevents the vertical edge at x=5 from counting.
 *
 * Exceptions:
 * 1. Edges at the coordinateStart's X coordinate do not count (sitting on an edge does not count)
 */
export const castRay = (
    edgesHorizontal: EdgesMap,
    edgesVertical: EdgesMap,
    coordinateStart: Coordinate
): number => {
    if (isOnBoundary(edgesHorizontal, edgesVertical, coordinateStart)) {
        return 1;
    }
    else {
        const [ px, py ] = coordinateStart;
        const edges: Set<Edges> = new Set();

        for (const [ xEdge, lineSegments ] of edgesVertical.entries()) {
            // Skip edges not to the right of the ray
            if (xEdge <= px) {
                continue;
            }

            for (const [ bottom, top ] of lineSegments.values()) {
                // Defensive coding
                const yMax = Math.max(bottom, top);
                const yMin = Math.min(bottom, top);

                if (
                    py >= yMin &&
                    py < yMax // "half-open" interval prevents double-counting vertices
                ) {
                    edges.add([ yMin, yMax ]);
                }
            }
        };

        return edges.size;
    }
};

/*
 *doesSegmentCrossBoundary 
 *
 * Uses open intervals in the direction of a line segment so intersections exactly at
 * the endpoints are not treated as crossing, which allows corners to lie on the boundary.
 *
 * Collinear edges (rectangle edge lying exactly on a polygon edge) as safe.
 */
export const doesSegmentCrossBoundary = (
    edgesHorizontal: EdgesMap,
    edgesVertical: EdgesMap,
    vertexA: Coordinate,
    vertexB: Coordinate
): boolean => {
    const [ x1, y1 ] = vertexA;
    const [ x2, y2 ] = vertexB;

    // Vertical line
    if (x1 === x2) {
        const yMax = Math.max(y1, y2);
        const yMin = Math.min(y1, y2);

        for (const [ yEdge, lineSegments ] of edgesHorizontal.entries()) {
            if (yEdge <= yMin || yEdge >= yMax) {
                continue;
            }

            for (const [ left, right ] of lineSegments.values()) {
                const xMax = Math.max(left, right);
                const xMin = Math.min(left, right);

                if (xMin < x1 && xMax > x1) {
                    coordinatesOutsideOfPolygon.add(getNonReferentialSetValue([ x1, yEdge ]));

                    return true;
                }
            }
        }

        return false;
    }
    // horizontal line
    else {
        const xMax = Math.max(x1, x2);
        const xMin = Math.min(x1, x2);

        for (const [ xEdge, lineSegments ] of edgesVertical.entries()) {
            if (xEdge <= xMin || xEdge >= xMax) {
                continue;
            }

            for (const [ bottom, top ] of lineSegments.values()) {
                const yMax = Math.max(bottom, top);
                const yMin = Math.min(bottom, top);

                if (yMin <= y1 && yMax >= y1) {
                    coordinatesOutsideOfPolygon.add(getNonReferentialSetValue([ xEdge, y1 ]));

                    return true;
                }
            }
        }

        return false;
    }
};

/*
 * findEdges
 *
 * Finds the vertical edges among all the vertices by keeping track of
 * all the vertices which share continuous X coordinate values.
 *
 * `vertices` are only the vertices which mark a change in direction and are assumed to be in sequential order.
 *
 * Special edge case - what if the first and last vertices are apart of the same edge?
 */
export const findEdges = (vertices: Vertices): { horizontalEdges: EdgesMap; verticalEdges: EdgesMap, } => {
    // Keys = X coordinate, Value = Top and bottom Y coordinate bounds
    const verticalEdges: EdgesMap = new Map();
    const horizontalEdges: EdgesMap = new Map();

    for (let verticesIndex = 0; verticesIndex < vertices.length; verticesIndex++) {
        // NOTE: wrap around to 0 to handle index 0 and -1 making up the same edge
        const vertexNext = verticesIndex === vertices.length - 1
            ? vertices[0]
            : vertices[verticesIndex + 1];
        const vertexCurrent = vertices[verticesIndex];

        // X values are not equal
        if (vertexCurrent[0] === vertexNext[0]) {
            const yBounds = [
                Math.min(vertexCurrent[1], vertexNext[1]),
                Math.max(vertexCurrent[1], vertexNext[1]),
            ];
            const set = verticalEdges.get(vertexCurrent[0]);

            if (set) {
                set.add(yBounds);
            }
            else {
                verticalEdges.set(
                    vertexCurrent[0],
                    new Set([ yBounds ])
                );
            }
        }

        // Y values are not equal
        if (vertexCurrent[1] === vertexNext[1]) {
            const xBounds = [
                Math.min(vertexCurrent[0], vertexNext[0]),
                Math.max(vertexCurrent[0], vertexNext[0]),
            ];
            const set = horizontalEdges.get(vertexCurrent[1]);

            if (set) {
                set.add(xBounds);
            }
            else {
                horizontalEdges.set(
                    vertexCurrent[1],
                    new Set([ xBounds ])
                );
            }
        }
    }
    
    return {
        horizontalEdges,
        verticalEdges,
    };
};

/*
 * findVertices
 *
 * Finds all the coordinates which represent a change in direction from the
 * other "collinear" points in the coordinates.
 */
export const findVertices = (coordinates: number[][]): Vertices => {
    const vertices: Vertices = []; 

    for (let i = 0; i < coordinates.length; i++) {
        const currentCoordinate = coordinates[i];
        const nextCoordinate = i === coordinates.length - 1
            ? coordinates[0]
            : coordinates[i + 1];
        const previousCoordinate = i === 0
            ? coordinates[coordinates.length - 1]
            : coordinates[i - 1];

        if (isCoordinateAVertex(previousCoordinate, nextCoordinate)) {
            vertices.push(currentCoordinate);
        }
    }

    return vertices;
};

export const getNonReferentialSetValue = (coordinate: Coordinate): string => {
    return `${coordinate[0]},${coordinate[1]}`;
};

const isCoordinateAVertex = (
    previousCoordinate: number[],
    nextCoordinate: number[]
): boolean => {
    // If the X and Y of the previous and next coordinates are both different, the current
    // coordinate changed the direction, a.k.a. it is a vertex
    return previousCoordinate[0] !== nextCoordinate[0]
        && previousCoordinate[1] !== nextCoordinate[1];
};

export const isOnBoundary = (
    edgesHorizontal: EdgesMap,
    edgesVertical: EdgesMap,
    [ x, y ]: Coordinate
) => {
    // If a coordinate exist on a vertical edge, we can skip to the end
    const horizontalSegments = edgesHorizontal.get(y);

    if (horizontalSegments) {
        for (const [ left, right ] of horizontalSegments.values()) {
            // Defensive programming
            const xMax = Math.max(left, right);
            const xMin = Math.min(left, right);

            // Do not return false
            if (x >= xMin && x <= xMax) {
                return true;
            }
        }
    };

    // If a coordinate exist on a vertical edge, we can skip to the end
    const verticalSegments = edgesVertical.get(x);

    if (verticalSegments) {
        for (const [ bottom, top ] of verticalSegments.values()) {
            // Defensive programming
            const yMax = Math.max(bottom, top);
            const yMin = Math.min(bottom, top);

            // Do not return false
            if (y >= yMin && y <= yMax) {
                return true;
            }
        }
    };

    return false;
};

export const isRectangleAStraightLine = (coordinates: number[][]): boolean => {
    const [ x1, y1 ] = coordinates[0];
    const [ x2, y2 ] = coordinates[1];

    return y1 === y2 || x1 === x2; 
};

export const execution = () => {
    console.time("Execution time");

    const redTileCoordinates = puzzleData.redTileCoordinates;
    const vertices = findVertices(redTileCoordinates);
    const {
        horizontalEdges,
        verticalEdges,
    } = findEdges(vertices);
    let maxArea = 0;

    for (let outerIndex = 0; outerIndex < redTileCoordinates.length; outerIndex++) {
    // for (let outerIndex = 0; outerIndex < 1; outerIndex++) {
        // for (let innerIndex = outerIndex + 1; innerIndex < 5; innerIndex++) {
        for (let innerIndex = outerIndex + 1; innerIndex < redTileCoordinates.length; innerIndex++) {
            // Corners may represent the vertices of a rectangle clockwise or counter-clockwise
            const cornerA = redTileCoordinates[outerIndex];
            const cornerC = redTileCoordinates[innerIndex];
            const cornerB = [ cornerA[0], cornerC[1] ];
            const cornerD = [ cornerC[0], cornerA[1] ];

            if (
                // Skip flat rectangles
                cornerA[0] === cornerC[0] ||
                cornerA[1] === cornerC[1] 
            ) {
                continue;
            }

            // Check if calculated corner coordinates are within the polygon
            const edgeCrossesCornerB = castRay(horizontalEdges, verticalEdges, cornerB);

            if (edgeCrossesCornerB % 2 === 0) {
                coordinatesOutsideOfPolygon.add(getNonReferentialSetValue(cornerB));
                continue;
            }

            // Check if calculated corner coordinates are within the polygon
            const edgeCrossesCornerD = castRay(horizontalEdges, verticalEdges, cornerD);

            if (edgeCrossesCornerD % 2 === 0) {
                coordinatesOutsideOfPolygon.add(getNonReferentialSetValue(cornerD));
                continue;
            }

            // Check if any edge intersections with an edge of the polygon
            if (
                doesSegmentCrossBoundary(horizontalEdges, verticalEdges, cornerA, cornerB) ||
                doesSegmentCrossBoundary(horizontalEdges, verticalEdges, cornerB, cornerC) ||
                doesSegmentCrossBoundary(horizontalEdges, verticalEdges, cornerC, cornerD) ||
                doesSegmentCrossBoundary(horizontalEdges, verticalEdges, cornerD, cornerA)
            ) {
                continue;
            }

            maxArea = Math.max(maxArea, calculateArea(cornerA, cornerC));
        }
    }

    console.timeEnd("Execution time");
    console.log(maxArea);
    // 2:37, 2:11, 1:43, 1:37:00
    // 8-core with pre-divided chunk sizes - 54m
    // 8-core with each sequentially red tile coordinate assigned to a different worker - 30m
    // 8-core with raycasting only from each rectangles four vertices
    // 1-core with raycasting only at each corner and along the edges: 1.025s

    
    // return { coordinatesOutsideOfPolygon };
};

if (process && import.meta.url === `file://${process.argv[1]}`) {
    execution();
}
