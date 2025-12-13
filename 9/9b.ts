import puzzleData from "./9.json" with { type: "json" };

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

const findEdges = (vertices: Set<number[]>): Map<string, number[]> => {
    // Keys = X coordinate, Value = Top and bottom Y coordinate bounds
    const edges = new Map<string, number[]>();

    vertices.forEach((vertex;
    
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
 * isCoordinateWithinPolygon
 *
 * Utilizes "ray casting" or the even-odd rule to determine if a coordinate is within a polygon,
 * which is an unpredictable, arbitrary shape.
 *
 * Must account for the coordinate being (a), on the edge, or (b), in the middle.
 */
const isCoordinateWithinPolygon = (coordinate: number[], polygonVertices: number[][]) => {
};

// for (let outerIndex = 0; outerIndex < redTileCoordinates.length; outerIndex++) {
//     for (let innerIndex = outerIndex + 1; innerIndex < redTileCoordinates.length; innerIndex++) {
//         maxArea = Math.max(
//             maxArea,
//             calculateArea(redTileCoordinates[outerIndex], redTileCoordinates[innerIndex])
//         );
//     }
// }

const vertices = findVertices(redTileCoordinates);

console.log(JSON.stringify(Array.from(vertices), null, 2));

