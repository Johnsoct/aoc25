import puzzleData from "./7.json" with { type: "json" };

/*
 * Starting at "S" in the first row, each beam goes downward
 * unless it hits a "^," which splits the beam to the left and right
 * (while maintaining a vertical trajectory). 
 *
 * How many times does the beam split (i.e. how many times does
 * the beam intersect with a "^")?
 */

const beamSplitsCoordinates = new Set();
const manifold = puzzleData.manifold;
const beamStartingCoordinate: number[] = [ manifold[0].indexOf("S"), 0 ];

// There will be multiple beams after the first split
let beamsCurrentCoordinates: number[][] = [ beamStartingCoordinate ];

const findSplitterIndicesInString = (string: string): number[] => {
    const indices = [];

    let splitterIndex = string.indexOf("^");

    while (splitterIndex !== -1) {
        indices.push(splitterIndex);

        splitterIndex = string.indexOf("^", splitterIndex + 1);
    }

    return indices;
};

const doesAnyBeamCoordinateIntersectSplitter = (
    beamCoordinates: number[][],
    splitterIndex: number
): boolean => {
    return beamCoordinates.some(([ coordinateX, _ ]) => {
        return coordinateX === splitterIndex;
    });
};

const getDedupedNewBeamCoordinatesAfterSplit = (
    beamsCurrentCoordinates: number[][],
    splitterIndex: number
) => {
    // Find the respective current beam coordinates
    const respectiveBeamCoordinateIndex = beamsCurrentCoordinates.findIndex(([ beamCoordinateX, _ ]) => {
        return beamCoordinateX === splitterIndex;
    });

    // Get the coordinates at said index
    const [ respectiveBeamCoordinateX, respectiveBeamCoordinateY ] = beamsCurrentCoordinates[respectiveBeamCoordinateIndex];

    // Create new coordinates for new beams (Y values are updated after the for loop for all beam coordinates)
    const newRespectiveBeamCoordinates: number[][] = [
        [ respectiveBeamCoordinateX - 1, respectiveBeamCoordinateY ],
        [ respectiveBeamCoordinateX + 1, respectiveBeamCoordinateY ],
    ];

    // Overlapping beams from splits with only one space between them create duplicate coordinates
    const nonDedupedNewBeamsCurrentCoordinates = [
        // Any coordinates until our match with the splitter index
        ...beamsCurrentCoordinates.slice(0, respectiveBeamCoordinateIndex),
        // Replace with our newly calculate beams (replacing a single coordinate with two)
        ...newRespectiveBeamCoordinates,
        // Tack on the unprocessed coordinates
        ...beamsCurrentCoordinates.slice(respectiveBeamCoordinateIndex + 1),
    ];

    const uniqueCoordinates = new Set<string>();

    nonDedupedNewBeamsCurrentCoordinates.forEach(([ x, y ]) => {
        // [x, y] in a set is a reference value, so we need to save them
        // as strings
        const key = `${x}, ${y}`;

        if (!uniqueCoordinates.has(key)) {
            uniqueCoordinates.add(key);
        }
    });

    return Array.from(uniqueCoordinates).map((key) => {
        const coordinate = key.split(", ").map(Number);

        return coordinate;
    });
};

const visualizer = (
    row: string,
    beamCoordinates: number[][]
): void => {
    let unmodifiedRow = row;

    beamCoordinates.forEach(([ coordinateX, _ ]) => {
        unmodifiedRow = unmodifiedRow.slice(0, coordinateX)
            + "|"
            + unmodifiedRow.slice(coordinateX + 1);
    });

    return console.log(unmodifiedRow);
};

manifold.forEach((row, rowIndex) => {
    // Find all occurences of "^"
    const indicesOfSplitter = findSplitterIndicesInString(row);

    indicesOfSplitter.forEach((splitterIndex) => {
        if (doesAnyBeamCoordinateIntersectSplitter(beamsCurrentCoordinates, splitterIndex)) {
            const splitCoordinate = [ splitterIndex, rowIndex ];

            // Save the split coordinate
            beamSplitsCoordinates.add(splitCoordinate);
            
            // Get new beam coordinates after splits
            beamsCurrentCoordinates = getDedupedNewBeamCoordinatesAfterSplit(
                beamsCurrentCoordinates,
                splitterIndex
            );
        }
    });

    // Increase the Y of each current beamCoordinates
    beamsCurrentCoordinates = beamsCurrentCoordinates.map(([ beamCoordinateX, beamCoordinateY ]) => {
        return [ beamCoordinateX, beamCoordinateY + 1 ];
    });

    visualizer(row, beamsCurrentCoordinates);
});

console.log(beamSplitsCoordinates.size);
