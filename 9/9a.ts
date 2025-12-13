import puzzleData from "./9.json" with { type: "json" };

const redTileCoordinates = puzzleData.redTileCoordinates;

const calculateArea = (corner: number[], oppositeCorner: number[]) => {
    // + 1 for inclusiveness (i.e. 7 - 2 = 5, but "width" here means the points on a graph
    // along the line, which is 6 from X7 to X2)
    const height = Math.abs(corner[1] - oppositeCorner[1]) + 1;
    const width = Math.abs(corner[0] - oppositeCorner[0]) + 1;

    return height * width;
};
let maxArea = 0;

for (let outerIndex = 0; outerIndex < redTileCoordinates.length; outerIndex++) {
    for (let innerIndex = outerIndex + 1; innerIndex < redTileCoordinates.length; innerIndex++) {
        maxArea = Math.max(
            maxArea,
            calculateArea(redTileCoordinates[outerIndex], redTileCoordinates[innerIndex])
        );
    }
}

console.log(maxArea);
