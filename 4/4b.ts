import puzzleData from "./4.json" with { type: "json" };

const diagram = puzzleData.diagram;

const adjacentRollsLimit = 4;
const directions = [
    [ -1, -1 ], [ 0, -1 ], [ 1, -1 ],
    [ -1, 0 ], [ 1, 0 ],
    [ -1, 1 ], [ 0, 1 ], [ 1, 1 ],
];
let rollsRemoved = 0;
let rollsRemovedThisRound = true;

while (rollsRemovedThisRound) {
    rollsRemovedThisRound = false;

    const rollIndicesToBeRemoved: number[][] = [];

    diagram.forEach((row, rowIndex) => {
        row
            .split("")
            .forEach((point, pointIndex) => {
                // Only count the point if the point is a roll of paper
                if (point === "@") {
                    let adjacentRolls = 0;

                    for (const [ adjacentColumnOffset, adjacentRowOffset ] of directions) {
                        const adjacentColumnIndex = rowIndex + adjacentRowOffset;
                        const adjacentRowIndex = pointIndex + adjacentColumnOffset;
                        const leftBound = adjacentRowIndex >= 0;
                        const rightBound = adjacentRowIndex <= row.length - 1;
                        const downwardBound = adjacentColumnIndex <= diagram.length - 1;
                        const upwardBound = adjacentColumnIndex >= 0;

                        // Check if within bounds first or accessing the adjacent point value
                        // will crash for trying to access a value outside of the array
                        if (
                            leftBound
                            && rightBound
                            && downwardBound
                            && upwardBound
                        ) {
                            const adjacentPointValue = diagram[adjacentColumnIndex][adjacentRowIndex];

                            if (adjacentPointValue === "@") {
                                adjacentRolls++;
                            }
                        }
                    }

                    if (adjacentRolls < adjacentRollsLimit) {
                        rollIndicesToBeRemoved.push([ pointIndex, rowIndex ]);
                    }
                }
            });
    });

    rollIndicesToBeRemoved.forEach(([ columnIndex, rowIndex ]) => {
        const row = diagram[rowIndex];

        diagram[rowIndex] = row.slice(0, columnIndex) + "x" + row.slice(columnIndex + 1);
        rollsRemoved++;
        rollsRemovedThisRound = true;
    });
}

console.log(rollsRemoved);
