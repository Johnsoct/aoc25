import puzzleData from "./3.json" with { type: "json" };

const batteryBanks = puzzleData.batteryBanks;
const batteryBanksMaxOutputs: number[] = [];

batteryBanks.forEach((joltages) => {
    let highCombination: number = 0;

    // Two pointers - brute forcing
    for (let left = 0; left < joltages.length; left++) {
        for (let right = left + 1; right < joltages.length; right++) {
            const joltage = Number(joltages[left] + joltages[right]);

            highCombination = Math.max(highCombination, joltage);
        };
    }

    batteryBanksMaxOutputs.push(highCombination);
});

const maxOutput = batteryBanksMaxOutputs.reduce((acc: number, cur: number) => {
    // eslint-disable-next-line no-param-reassign
    acc += cur;

    return acc;
}, 0);

console.log(maxOutput);
