import chalk from "chalk";

import puzzleData from "./10.json" with { type: "json" };

interface MachineData {
    buttonDiagrams: number[][];
    joltages: number[];
    lightIndicators: number[];
}

type ButtonDiagram = number;

type GaussianMatrix = Map<LightIndicator, ButtonDiagram[]>;

type LightIndicator = number;

type Variables = {
    freeVariables: ButtonDiagram[],
    pivotVariables: ButtonDiagram[]
};

const machines = puzzleData.machines;

const eliminate = (
    matrix: GaussianMatrix,
    currentColumnIndex: number,
    pivotRowIndex: number
): GaussianMatrix => {
    const localMatrix = new Map(matrix.entries());

    // Perform elimination on all columns after our pivot row
    for (
        let rowBelowIndex = pivotRowIndex + 1;
        rowBelowIndex < localMatrix.size;
        rowBelowIndex++
    ) {
        // Skip rows without a 1 under our new leading 1 row/column
        if (localMatrix.get(rowBelowIndex)![currentColumnIndex] !== 1) {
            continue;
        }

        const newValues = [];

        // Perform XOR addition on each column
        for (
            let columnIndex = 0;
            columnIndex < localMatrix.get(rowBelowIndex)!.length;
            columnIndex++
        ) {
            const belowRowValue = localMatrix.get(rowBelowIndex)![columnIndex];
            const pivotRowValue = localMatrix.get(pivotRowIndex)![columnIndex];

            newValues.push(belowRowValue^pivotRowValue);
        }

        localMatrix.set(rowBelowIndex, newValues);
    }

    return localMatrix;
};

const getVariables = (matrix: GaussianMatrix): Variables => {
    const freeVariables: number[] = [];
    const pivotVariables: number[] = [];
    let lastColumnWithLeadingOne = 0;

    for (const row of matrix.values()) {
        for (let columnIndex = lastColumnWithLeadingOne; columnIndex < row.length; columnIndex++) {
            if (row[columnIndex] === 1) {
                pivotVariables.push(columnIndex);
                lastColumnWithLeadingOne = columnIndex;
                break;
            }
        }
    }

    // Subtract 1 for the target column
    for (let columnIndex = 0; columnIndex < matrix.get(0)!.length  - 1; columnIndex++) {
        if (pivotVariables.includes(columnIndex)) {
            continue;
        }
        else {
            freeVariables.push(columnIndex);
        }
    }

    return {
        freeVariables,
        pivotVariables,
    };
};

/*
 * getGaussianEchelonForm
 *
 * "Echelon form" is a stair pattern:
 * 1 0
 * _ 
 * 0|1 0
 * 0 _
 * 0 0|1 0
 * 0 0 _
 *
 * 1. Find a row with a leading 1 in the leftmost column
 * 2. For each row of the gaussian matrix, iterate over each column
 *   1. For each column, swap rows with the first row which has a leading 1 in that column
 *   2. If there is not a leading 1 in the column, move on to the next column
 *   3. Once a leading 1 is found (by coincidental positioning or swapping), eliminate any row
 *      with XOR addition (^) so there only 0s under the leading 1
 *   4. After elimination, move on to the next row
 *
 * NOTE:
 * The target row gets swapped and eliminated like any other column.
 */
const getGaussianEchelonForm = (matrix: GaussianMatrix): GaussianMatrix => {
    let localMatrix = new Map(matrix.entries());
    let pivotRowIndex = 0;

    for (
        let columnIndex = 0;
        columnIndex < localMatrix.get(0)!.length;
        columnIndex++
    ) {
        for (
            let rowIndex = pivotRowIndex;
            rowIndex < localMatrix.size;
            rowIndex++
        ) {
            if (localMatrix.get(rowIndex)![columnIndex] === 1) {
                const pivotRowValue = localMatrix.get(pivotRowIndex)!;
                const rowWithLeadingOneValue = localMatrix.get(rowIndex)!;

                localMatrix.set(pivotRowIndex, rowWithLeadingOneValue);
                localMatrix.set(rowIndex, pivotRowValue);

                if (rowIndex !== matrix.size) {
                    localMatrix = eliminate(localMatrix, columnIndex, pivotRowIndex);
                }

                pivotRowIndex++;
                break;
            }
            else {
                continue;
            }
        }
    }

    return localMatrix;
};

const getGaussianMatrix = (machineData: MachineData): GaussianMatrix => {
    const matrix = new Map<number, number[]>(
        // Initializes the matrix with the exact number of light indicators set to []
        Array.from({ length: machineData.lightIndicators.length }, (_, index) => {
            return [ index, [] ];
        })
    );
    const target = machineData.lightIndicators;

    for (const key of matrix.keys()) {
        // Parses each button diagram to set the row's columns accordingly
        machineData.buttonDiagrams.forEach((buttons) => {
            // If a button diagram toggles a light, set it to 1
            if (buttons.includes(key)) {
                matrix.set(key, [ ...matrix.get(key)!, 1 ]);
            }
            // If the button diagram doesn't toggle a light, set it to 0
            else {
                matrix.set(key, [ ...matrix.get(key)!, 0 ]);
            }
        });

        // Set the target as the last index of the row
        matrix.set(key, [ ...matrix.get(key)!, target[key] ]);
    }

    return matrix;
};

const getMachineData = (rawMachineData: string): MachineData => {
    const buttonDiagrams = rawMachineData
        .slice(
            rawMachineData.indexOf("]") + 1,
            rawMachineData.indexOf("{")
        )
        .trim()
        .split(" ")
        .map((diagram) => {
            return diagram
                .slice(
                    diagram.indexOf("(") + 1,
                    diagram.indexOf(")")
                )
                .split(",")
                .map(Number);
        });
    const lightIndicators = rawMachineData
        .slice(
            rawMachineData.indexOf("[") + 1,
            rawMachineData.indexOf("]")
        )
        .trim()
        .split("")
        .map((indicator) => {
            if (indicator === ".") {
                return 0;
            }
            else {
                return 1;
            }
        });
    const joltages = rawMachineData
        .slice(
            rawMachineData.indexOf("{") + 1,
            rawMachineData.indexOf("}")
        )
        .trim()
        .split(",")
        .map(Number);

    return {
        buttonDiagrams,
        joltages,
        lightIndicators,
    };
};

// TODO:
/*
 * readAllPossibleSolutions
 *
 * To read all possible solutions of a gaussian matrix in echelon form
 * means to iteratively change one of the free variables values from 0
 * to 1, equivalent to `freeVariables.length^2`
 *
 * Example:
 *
 * const freeVariables = [ A, B ];
 * const variations = [
 *     [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 0, 1 ]
 * ];
 *
 * NOTE: `freeVariables` could be of any length
 *
 * ... solve for each variation.
 */
const readAllPossibleSolutions = (
    matrixEchelonForm: GaussianMatrix,
    freeVariables: ButtonDiagram[],
    pivotVariables: ButtonDiagram[]
): ButtonDiagram[][] => {
    const numCombinations = 1 << freeVariables.length;
    const solutions: ButtonDiagram[][] = [];

    // TODO: iterate freeVariables.length^2; currently testing with all FVs === 0
    freeVariables.forEach((columnIndex) => {
        // For each variable, it's column value can be 0 and 1
        // For each variable, the other variables can either be 0 or 1
        const buttonPresses = new Map<number, number>();
    
        freeVariables.forEach((columnIndex) => {
            return buttonPresses.set(columnIndex, 0); 
        });

        // Solve from the bottom up
        for (let rowIndex = matrixEchelonForm.size - 1; rowIndex >= 0; rowIndex--) {
            const row = matrixEchelonForm.get(rowIndex)!;
            const target = row[row.length - 1];
            const pivotColumn = row.indexOf(1);
        
            // Skips all rows with all 0s
            if (pivotColumn === -1) {
                continue;
            }
        
            // console.log("pivotColumn:", pivotColumn);
            buttonPresses.set(pivotColumn, target ^ row.slice(0, -1).reduce((sum, cur, colIndex) => {
                if (colIndex < pivotColumn) {
                    return sum;
                }

                if (cur === 0) {
                    return sum;
                }


                if (buttonPresses.has(colIndex)) {
                // console.log(sum, "XOR", columnValue, "=", sum ^ columnValue);

                    return sum ^ buttonPresses.get(colIndex)!;
                }
                else {
                // console.log(sum, "XOR", row[colIndex], "=", sum ^ row[colIndex]);

                    return sum ^ row[colIndex]!;
                }
            }, 0));
        // console.log("pivotColumn in columnValues:", columnValues.get(pivotColumn));
        }

        console.log("column values:", buttonPresses);
        solutions.push(Array.from(buttonPresses.values()).filter(Boolean));
    });

    return solutions;
};

for (const machine of machines.slice(0, 1)) {
    const machineData = getMachineData(machine);
    
    // console.log("MachineData", machineData);
    
    const matrix = getGaussianMatrix(machineData);

    // console.log("Matrix", matrix);

    const matrixEchelonForm = getGaussianEchelonForm(matrix);

    console.log("Matrix Echelon Form (last column is the target row)", matrixEchelonForm);

    const {
        freeVariables,
        pivotVariables,
    } = getVariables(matrixEchelonForm);

    console.log("Pivot variables:", pivotVariables);
    console.log("Free variables", freeVariables);

    const solutions = readAllPossibleSolutions(matrixEchelonForm, freeVariables, pivotVariables);

    console.log("Solutions", solutions);
}
