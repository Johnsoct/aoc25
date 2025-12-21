import {
    parentPort,
    workerData,
} from "worker_threads";

import puzzleData from "./9.json" with { type: "json" };

type coordinate = number[];

type edges = number[];

type keySafeCoordinate = string;

type y = number;

export type EdgesMap = Map<y, edges[]>;
export type Vertices = coordinate[];

/*
 * Optimization ideas
 *
 * 1. ~Check all coordinates on the edges before coordinates inside~
 *      1.1 Neither set, map, arrays... can handle billions of coordinates...
 *      was failling at 16.7M values in a  set
 * 2. ... Run on multiple CPU cores, rofl
 */

// Helper functions
// Helper functions
// Helper functions

const getSafeMapKey = ([ x, y ]: coordinate): keySafeCoordinate => {
    return `${x},${y}`;
};

const visualizePolygon = (coordinates: number[][]) => {
    // Find bounds
    const minX = Math.min(...coordinates.map((c) => {
        return c[0]; 
    }));
    const maxX = Math.max(...coordinates.map((c) => {
        return c[0]; 
    }));
    const minY = Math.min(...coordinates.map((c) => {
        return c[1]; 
    }));
    const maxY = Math.max(...coordinates.map((c) => {
        return c[1]; 
    }));
    
    // Scale down if needed (your coords are huge)
    const scale = Math.max(
        Math.ceil((maxX - minX) / 100),
        Math.ceil((maxY - minY) / 100)
    );
    
    const coordSet = new Set(coordinates.map((c) => {
        return `${Math.floor((c[0] - minX) / scale)},${Math.floor((c[1] - minY) / scale)}`; 
    }
    ));
    
    const width = Math.ceil((maxX - minX) / scale);
    const height = Math.ceil((maxY - minY) / scale);
    
    for (let y = height; y >= 0; y--) {
        let row = '';

        for (let x = 0; x <= width; x++) {
            row += coordSet.has(`${x},${y}`)
                ? '#'
                : '.';
        }

        console.log(row);
    }
};

// LOGIC
// LOGIC
// LOGIC

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

    for (let verticesIndex = 0; verticesIndex < vertices.length; verticesIndex++) {
        // NOTE: wrap around to 0 to handle index 0 and -1 making up the same edge
        const vertexNext = verticesIndex === vertices.length - 1
            ? vertices[0]
            : vertices[verticesIndex + 1];
        const vertexCurrent = vertices[verticesIndex];

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

            if (set) {
                set.push(yBounds);
            }
            else {
                edges.set(
                    vertexCurrent[0],
                    [ yBounds ]
                );
            }
        }
    }
    
    return edges;
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

/*
 * getEdgesInPathOfRay
 *
 * When checking if a coordinate is within the polygon, we "cast" a ray from the coordinate
 * towards X direction and count the number of edges the ray crosses. To cast the ray, we
 * need to know the edges in the path of the ray, so this returns the vertical edges which
 * will be in the way of the right moving cast ray.
 *
 * NOTE: Exclusive of edges the coordinate exists on
 */
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

export const isCoordinateOnAVerticalEdge = (edges: EdgesMap, coordinate: number[]) => {
    const edgesWithSameXCoordinate = edges.get(coordinate[0]);

    if (edgesWithSameXCoordinate) {
        return edgesWithSameXCoordinate.some((edge) => {
            const isCoordinateYGteEdgeBottomBound = edge[1] <= coordinate[1];
            const isCoordinateYLteEdgeTopBound = edge[0] >= coordinate[1];

            if (isCoordinateYGteEdgeBottomBound && isCoordinateYLteEdgeTopBound) {
                return true;
            }
        });
    }
    else {
        return false;
    }
};

/*
 * isCoordinateWithinPolygon
 *
 * First, checks to see if the coordinate is on an edge, and if so, returns immediately; however,
 * if it does not, it utilizes "ray casting" or the even-odd rule to determine if a coordinate
 * is within a polygon, which is an unpredictable, arbitrary shape.
 *
 * Must account for the coordinate being:
 * 1. (a) on the edge
 * 2. (b) in the middle
 */
export const isCoordinateWithinPolygon = (edges: EdgesMap, coordinate: number[]): boolean => {
    if (isCoordinateOnAVerticalEdge(edges, coordinate)) {
        return true;
    }
    else {
        // if (trueRayCastedCoordinates.has(getSafeMapKey(coordinate))) {
        //     return true;
        // }

        const edgesInThePathOfTheRay = getEdgesInPathOfRay(edges, coordinate);
        const edgesCrossed = castRay(edgesInThePathOfTheRay);

        // If even, the coordinate is not within the polygon
        if (edgesCrossed % 2 === 0) {
            return false;
        }
        else {
            // trueRayCastedCoordinates.add(getSafeMapKey(coordinate));

            return true;
        }
    }
};

/*
 * areRectangleCornersWithinPolygon
 *
 * When comparing two red tile coordinates, while also treating them as opposing corners, it would be
 * more efficient to first check the other two corners of the rectangle to ensure those are within the
 * polygon, because jumping straight into checking each coordinate one at a time is pointless if we
 * can guarantee they won't all be with only two coordinates...
 */
export const areRectangleCornersWithinPolygon = (edges: EdgesMap, coordinates: number[][]): boolean => {
    return coordinates.every((coordinate) => {
        return isCoordinateWithinPolygon(edges, coordinate); 
    });
};

export const isRectangleAStraightLine = (coordinates: number[][]): boolean => {
    const [ x1, y1 ] = coordinates[0];
    const [ x2, y2 ] = coordinates[1];

    return y1 === y2 || x1 === x2; 
};

const execution = () => {
    console.time("Execution time");

    const {
        endIndex,
        startIndex,
    } = workerData;
    const redTileCoordinates = puzzleData.redTileCoordinates;
    const vertices = findVertices(redTileCoordinates);
    const edges = findEdges(vertices);
    let maxArea = 0;


    for (let outerIndex = startIndex; outerIndex < endIndex; outerIndex++) {
    // To avoid "RangeError: Set maximum size exceeded", clear the memoized ray casted coordinates on each outer loop
    // trueRayCastedCoordinates.clear();

        for (let innerIndex = outerIndex + 1; innerIndex < redTileCoordinates.length; innerIndex++) {
            if (innerIndex % 10 === 0) {
                console.log(`Progress: ${outerIndex}/${redTileCoordinates.length - 1} - ${innerIndex}/${redTileCoordinates.length - 1}`);
            }

            // For each pair, get the rectangle bounds
            const bottomRightBound = [
                Math.max(redTileCoordinates[innerIndex][0], redTileCoordinates[outerIndex][0]),
                Math.min(redTileCoordinates[innerIndex][1], redTileCoordinates[outerIndex][1]),
            ];
            const topLeftBound = [
                Math.min(redTileCoordinates[innerIndex][0], redTileCoordinates[outerIndex][0]),
                Math.max(redTileCoordinates[innerIndex][1], redTileCoordinates[outerIndex][1]),
            ];
            const bottomLeftBound = [
                topLeftBound[0],
                bottomRightBound[1],
            ];
            const topRightBound = [
                bottomRightBound[0],
                topLeftBound[1],
            ];

            // No point processing internal coordinates if the four corners aren't all within the polygon
            // and we know the bottomRightBound and topLeftBound are because they come from the redTileCoordinates
            if (!areRectangleCornersWithinPolygon(edges, [ bottomLeftBound, topRightBound ])) {
                continue;
            }

            // NOTE: comment out to process all polygons regardless of whether it is effectively a straight line
            if (isRectangleAStraightLine([ bottomRightBound, topLeftBound ])) {
                continue;
            }

            let allCoordinatesAreWithinBounds = true;

            // Check every point in that rectangle - if ANY point is outside the polygon, skip this pair
            for (let x = topLeftBound[0]; x <= bottomRightBound[0]; x++) {
                if (!allCoordinatesAreWithinBounds) {
                // Don't calculate more than necessary
                    break;
                }

                for (let y = bottomRightBound[1]; y <= topLeftBound[1]; y++) {
                    if (!isCoordinateWithinPolygon(edges, [ x, y ])) {
                        allCoordinatesAreWithinBounds = false;
                        // Don't calculate more than necessary
                        break;
                    }
                }
            }

            // If all points are inside, calculate area and track max
            if (allCoordinatesAreWithinBounds) {
                console.log(`Found valid rectangle! Area: ${calculateArea(topLeftBound, bottomRightBound)}`);

                maxArea = Math.max(
                    maxArea,
                    calculateArea(topLeftBound, bottomRightBound)
                );
            }
        }
    }

    console.timeEnd("Execution time");
    // 2:37, 2:11, 1:43, 1:37:00
    
    parentPort?.postMessage({ maxArea });
};

if (import.meta.url === `file://${process.argv[1]}`) {
    execution();
}
