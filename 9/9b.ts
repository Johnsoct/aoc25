import puzzleData from "./9.json" with { type: "json" };

export type EdgesMap = Map<string, Set<string>>;
export type Vertices = Set<number[]>;

/*
 * Ray casting (even-odd rule):
 *
 * Draw an imaginary line from a coordinate in any direction.
 *
 * If the line crosses the edge of the polygon only once, it's within the polygon.
 * If the line crosses the edge of the polygon more than once, it's not within the polygon.
 *
 * Our problem is unique because although the coordinates build a polygon, the problem is to
 * only find red tiles which are in diagonal opposition of another red tile, a.k.a. we are
 * only looking for rectangular shapes, so we don't have to worry about the complexity of
 * checking whether our imaginary line crosses a diagonal line.
 *
 * 1. Create a Set of all the vertices among the collinear points (the red tile coordinates)
 * 2. Create a Map of all the vertical edges of the polygon with the X coordinate as the key
 * and the top and bottom Y coordinates as the values
 * 3. Repeat the solution to part one except before calculating the area, check each point
 * in the rectangle to ensure each point is within bounds using ray casting
 *      3.1. If not, skip
 *      3.2. Calculate the area
 *      3.3. Update `maxArea`
 */

// Coordinates are the vertices of a larger polygon
const redTileCoordinates = puzzleData.redTileCoordinates;
const maxArea = 0;

const calculateArea = (corner: number[], oppositeCorner: number[]) => {
    // + 1 for inclusiveness (i.e. 7 - 2 = 5, but "width" here means the points on a graph
    // along the line, which is 6 from X7 to X2)
    const height = Math.abs(corner[1] - oppositeCorner[1]) + 1;
    const width = Math.abs(corner[0] - oppositeCorner[0]) + 1;

    return height * width;
};

/*
 * getMapSafeCoordinateValue
 *
 * Returns a Map safe key value (stringified version of an array of numbers)
 */
const getMapSafeCoordinateValue = (coordinate: number): string => {
    const mapKeySafeValue = `${coordinate}`;

    return mapKeySafeValue;
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
export const findEdges = (vertices: Vertices): EdgesMap => {
    const arrayOfVertices = Array.from(vertices);
    // Keys = X coordinate, Value = Top and bottom Y coordinate bounds
    const edges: EdgesMap = new Map();

    console.log("Vertices parameter", vertices);

    for (let verticesIndex = 0; verticesIndex < vertices.size; verticesIndex++) {
        // NOTE: wrap around to 0
        const vertexNext = verticesIndex === vertices.size - 1
            ? arrayOfVertices[0]
            : arrayOfVertices[verticesIndex + 1];
        const vertexCurrent = arrayOfVertices[verticesIndex];

        // console.log("current", vertexCurrent);
        // console.log("next", vertexNext);

        if (vertexCurrent[0] !== vertexNext[0]) {
            continue;
        }
        else {
            const bounds = JSON.stringify([
                Math.max(vertexCurrent[1], vertexNext[1]),
                Math.min(vertexCurrent[1], vertexNext[1]),
            ]);
            const safeKey = getMapSafeCoordinateValue(vertexCurrent[0]);
            const set = edges.get(safeKey);

            // console.log("new bounds", bounds);
            // console.log("unchanged, saving...", safeKey);

            if (set) {
                set.add(bounds);
            }
            else {
                edges.set(
                    safeKey,
                    new Set([ bounds ])
                );
            }

            // console.log("edges", edges);
        }
    }
    
    return edges;
};

const findVertices = (coordinates: number[][]): Set<number[]> => {
    const vertices = new Set<number[]>(); 

    for (let i = 0; i < coordinates.length; i++) {
        const currentCoordinate = coordinates[i];
        const nextCoordinate = i === coordinates.length - 1
            ? coordinates[0]
            : coordinates[i + 1];
        const previousCoordinate = i === 0
            ? coordinates[coordinates.length - 1]
            : coordinates[i - 1];

        if (isCoordinateAVertex(previousCoordinate, nextCoordinate)) {
            vertices.add(currentCoordinate);
        }
    }

    return vertices;
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

/*
 * castRay
 *
 * Implements ray casting towards the right.
 *
 * If it crosses an edge, `edgesCrossed` increases by one. If at the end, `edgesCrossed` is 
 * even, the coordinate does NOT lie within the polygon.
 *
 * In other words, anytime a line crosses an even number of edges, it MUST not be within
 * the polygon. If a line crosses an odd number of edges, it MUST be within the polygon.
 */
const castRay = (coordinate: number[], edges: EdgesMap) => {
    const rayStartPosition = coordinate;
    const edgesCrossed = 0;
};

/*
 * isCoordinateWithinPolygon
 *
 * Utilizes "ray casting" or the even-odd rule to determine if a coordinate is within a polygon,
 * which is an unpredictable, arbitrary shape.
 *
 * Must account for the coordinate being:
 * 1. (a) on the edge
 * 2. (b) in the middle
 */
export const isCoordinateWithinPolygon = (edges: EdgesMap, coordinate: number[], boundaryX: number) => {
    const edgesInThePathOfTheRay = Array.from(edges).filter(([ _, yBoundaries ]) => {
        return Array.from(yBoundaries).filter((stringCoordinate) => {
            const yCoordinate = coordinate[1];
            const yBounds = JSON.parse(stringCoordinate);
            const yBoundBottom = yBounds[1];
            const yBoundTop = yBounds[0];

            // console.log("stringCoordinate", stringCoordinate);
            // console.log("yCoordinate", yCoordinate);
            // console.log("yBoundBottom", yBoundBottom);
            // console.log("yBoundTop", yBoundTop);

            if (yBoundBottom <= yCoordinate && yCoordinate <= yBoundTop) {
                return true;
            }
        });
    });
    const rayStartPosition = coordinate;
    let edgesCrossed = 0;

    // For each edge
    edgesInThePathOfTheRay.forEach(([ x, yBoundaries ]) => {
        // 1. Does the coordinate's X exist on the left or right of the edge's X?
        if (coordinate[0] > Number(x)) {
            continue;
        }
        else {
            // 2. Does the coordinate's Y exist within the Y bounds of the edge?
            const yBoundBottom = Array.from(yBoundaries)[1];
            const yBoundTop = Array.from(yBoundaries)[0];

            if (
                yBoundaries
            ) {
                edgesCrossed++;
            }
        }
    });
};

const vertices = findVertices(redTileCoordinates);
// console.log(JSON.stringify(Array.from(vertices), null, 2));

for (let outerIndex = 0; outerIndex < redTileCoordinates.length; outerIndex++) {
    for (let innerIndex = outerIndex + 1; innerIndex < redTileCoordinates.length; innerIndex++) {
        // maxArea = Math.max(
        //     maxArea,
        //     calculateArea(redTileCoordinates[outerIndex], redTileCoordinates[innerIndex])
        // );
    }
}

