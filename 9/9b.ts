import puzzleData from "./9.json" with { type: "json" };

export type EdgesMap = Map<number, number[][]>;
export type Vertices = number[][];

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
 * castRay
 *
 * Implements ray casting towards the right.
 *
 * Counts the number of times a "ray" crosses, which in this case is the number of
 * edges in the path of the ray.
 */
export const castRay = (edgesInThePathOfTheRay: EdgesMap): number => {
    return Array.from(edgesInThePathOfTheRay).reduce((acc, [ _, edgesAtX ]) => {
        return acc += edgesAtX.length;
    }, 0);
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
    // Keys = X coordinate, Value = Top and bottom Y coordinate bounds
    const edges: EdgesMap = new Map();

    // console.log("Vertices parameter", vertices);

    for (let verticesIndex = 0; verticesIndex < vertices.length; verticesIndex++) {
        // NOTE: wrap around to 0 to handle index 0 and -1 making up the same edge
        const vertexNext = verticesIndex === vertices.length - 1
            ? vertices[0]
            : vertices[verticesIndex + 1];
        const vertexCurrent = vertices[verticesIndex];

        // console.log("current", vertexCurrent);
        // console.log("next", vertexNext);

        // X values are not equal
        if (vertexCurrent[0] !== vertexNext[0]) {
            continue;
        }
        else {
            const yBounds = [
                Math.max(vertexCurrent[1], vertexNext[1]),
                Math.min(vertexCurrent[1], vertexNext[1]),
            ];
            const set = edges.get(vertexCurrent[0]);

            // console.log("new bounds", bounds);
            // console.log("unchanged, saving...", safeKey);

            if (set) {
                set.push(yBounds);
            }
            else {
                edges.set(
                    vertexCurrent[0],
                    [ yBounds ]
                );
            }

            // console.log("edges", edges);
        }
    }
    
    return edges;
};

const findVertices = (coordinates: number[][]): Vertices => {
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

/*
 * getEdgesInPathOfRay
 *
 * Returns the vertical edges which will be in the way of the right moving cast ray.
 */
// BUG: not even close to working correctly
export const getEdgesInPathOfRay = (edges: EdgesMap, coordinate: number[]): EdgesMap => {
    const edgesInPath: EdgesMap = new Map();

    Array.from(edges).forEach(([ x, edgesAtX ]) => {
        // We don't care about the value of x as long as x is to the right of our coordinate
        // as we'll later look for Y bounds which lie in the pay of our "ray"
        if (x > coordinate[0]) {
            edgesAtX.forEach((yBounds: number[]) => {
                const yCoordinate = coordinate[1];
                const yBoundBottom = yBounds[1];
                const yBoundTop = yBounds[0];

                // console.log("stringCoordinate", stringCoordinate);
                // console.log("yCoordinate", yCoordinate);
                // console.log("yBoundBottom", yBoundBottom);
                // console.log("yBoundTop", yBoundTop);

                // Check to ensure the Y bounds are in the path of our ray
                if (yBoundBottom <= yCoordinate && yCoordinate <= yBoundTop) {
                    const bounds = [
                        yBoundTop,
                        yBoundBottom,
                    ];

                    const set = edgesInPath.get(x);

                    if (set) {
                        set.push(bounds);
                    }
                    else {
                        edgesInPath.set(
                            x,
                            [ bounds ]
                        );
                    }
                }
            });
        }
    });

    return edgesInPath;
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
 * isCoordinateWithinPolygon
 *
 * Utilizes "ray casting" or the even-odd rule to determine if a coordinate is within a polygon,
 * which is an unpredictable, arbitrary shape.
 *
 * Must account for the coordinate being:
 * 1. (a) on the edge
 * 2. (b) in the middle
 */
export const isCoordinateWithinPolygon = (edges: EdgesMap, coordinate: number[]) => {
    const edgesInThePathOfTheRay = getEdgesInPathOfRay(edges, coordinate);
    const edgesCrossed = castRay(edgesInThePathOfTheRay);

    console.log("edgesInThePathOfTheRay", edgesInThePathOfTheRay);
    console.log("edgesCrossed", edgesCrossed);

    // If even, the coordinate is not within the polygon
    if (edgesCrossed % 2) {
        return true;
    }
    else {
        return false;
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    console.time("Execution time");

    const vertices = findVertices(redTileCoordinates);
    const edges = findEdges(vertices);

    // for (let outerIndex = 0; outerIndex < redTileCoordinates.length; outerIndex++) {
    //     for (let innerIndex = outerIndex + 1; innerIndex < redTileCoordinates.length; innerIndex++) {
    for (let outerIndex = 0; outerIndex < 5; outerIndex++) {
        for (let innerIndex = outerIndex + 1; innerIndex < 5; innerIndex++) {
            // For each pair, get the rectangle bounds
            const bottomRightBound = [
                Math.max(redTileCoordinates[innerIndex][0], redTileCoordinates[outerIndex][0]),
                Math.min(redTileCoordinates[innerIndex][1], redTileCoordinates[outerIndex][1]),
            ];
            const topLeftBound = [
                Math.min(redTileCoordinates[innerIndex][0], redTileCoordinates[outerIndex][0]),
                Math.max(redTileCoordinates[innerIndex][1], redTileCoordinates[outerIndex][1]),
            ];
            const allCoordinatesAreWithinBounds = true;

            // NOTE: comment out to process all polygons regardless of whether it is effectively a straight line
            if (bottomRightBound[1] === topLeftBound[1] || bottomRightBound[0] === topLeftBound[0]) {
                continue;
            }

            console.log("topLeftBound", topLeftBound);
            console.log("bottomRightBound", bottomRightBound);
            // console.log(`Inner loop progress: ${innerIndex}/${redTileCoordinates.length - 1}`);
            // console.log(`Outer loop progress: ${outerIndex}/${redTileCoordinates.length - 1}`);
            
            console.log("is topLeftBound in the polygon", isCoordinateWithinPolygon(edges, topLeftBound));
            console.log("is bottomRightBound in the polygon", isCoordinateWithinPolygon(edges, bottomRightBound));


            // Check every point in that rectangle - if ANY point is outside the polygon, skip this pair
            // for (let x = topLeftBound[0]; x <= bottomRightBound[0]; x++) {
            //     for (let y = bottomRightBound[1]; y <= topLeftBound[1]; y++) {
            //         console.log("Coordinate within rectangle", x, y);
            //
            //         if (!isCoordinateWithinPolygon(edges, [ x, y ])) {
            //             allCoordinatesAreWithinBounds = false;
            //             // Don't calculate more than necessary
            //             break;
            //         }
            //     }
            //
            //     if (!allCoordinatesAreWithinBounds) {
            //         // Don't calculate more than necessary
            //         break;
            //     }
            // }
            //
            // // If all points are inside, calculate area and track max
            // if (allCoordinatesAreWithinBounds) {
            //     console.log("Calculating the area of", topLeftBound, bottomRightBound);
            //
            //     maxArea = Math.max(
            //         maxArea,
            //         calculateArea(topLeftBound, bottomRightBound)
            //     );
            // }
        }
    }

    console.log(maxArea);
    console.timeEnd("Execution time");
    // 2:37, 2:11, 1:43
}
