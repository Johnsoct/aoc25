import { machine } from "os";

import puzzleData from "./10.json" with { type: "json" };

interface MachineData {
    buttonDiagrams: number[][];
    joltages: number[];
    lightIndicators: number[];
}

const machines = puzzleData.machines;

const getGaussianMatrix = (machineData: MachineData) => {
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

for (const machine of machines.slice(0, 1)) {
    const machineData = getMachineData(machine);
    const matrix = getGaussianMatrix(machineData);

    console.log("MachineData", machineData);
    console.log("Matrix", matrix);
}
