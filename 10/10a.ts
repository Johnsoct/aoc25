import puzzleData from "./10.json" with { type: "json" };

interface MachineData {
    buttonDiagrams: number[][];
    joltages: number[];
    lightIndicators: number[];
}

const machines = puzzleData.machines;

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

for (const machine of machines.slice(0, 5)) {
    const machineData = getMachineData(machine);

    console.dir("MachineData", machineData);
}
