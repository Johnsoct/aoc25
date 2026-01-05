import puzzleData from "./10.json" with { type: "json" };

interface MachineData {
    buttonDiagrams: number[][];
    joltages: number[];
    lightIndicators: number[];
}

type ButtonDiagram = number;

type FreeVariables = Map<number, number>;

type GaussianMatrix = Map<LightIndicator, ButtonDiagram[]>;

type LightIndicator = number;

type PivotVariables = Map<number, number>;

const machines = puzzleData.machines;

const getFreeVariables = (matrix: GaussianMatrix): FreeVariables => {
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
    const localMatrix = new Map(matrix.entries());

    for (const row of localMatrix.values()) {
    }
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

const getPivotVariables = (matrix: GaussianMatrix, freeVariables: FreeVariables) => {
};

const readAllPossibleSolutions = (
    matrix: GaussianMatrix,
    freeVariables: FreeVariables,
    pivotVariables: PivotVariables
): number[][] => {
};

for (const machine of machines.slice(0, 1)) {
    const machineData = getMachineData(machine);
    const matrix = getGaussianMatrix(machineData);

    console.log("MachineData", machineData);
    console.log("Matrix", matrix);
}
