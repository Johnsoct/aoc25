import puzzleData from "./3.json" with { type: "json" };

const batteryBanks = puzzleData.batteryBanks;
const batteryBanksMaxOutputs: number[] = [];
const sequenceLength = 12;

batteryBanks.forEach((bank) => {
    /*
     * Greedy, forward search
     *
     * BANK = Sequence of joltages representing batteries of varying strength
     * JOLTAGE = The power of a battery
     * SEQUENCE LENGTH = The length of joltages which much be selected from each battery bank
     * AVAILABLE JOLTAGES = Range of joltages available for the value of the left pointer
     * FIRST INDEX = the leftward bound of the available joltages
     * LAST INDEX = the rightward bound of the available joltages; determined by
     *      subtracting the joltages left to be selected from the end of the the bank,
     *
     * Each left pointer is the FIRST INDEX
     * The right pointer iterates over the AVAILABLE JOLTAGES starting from FIRST INDEX + 1
     *      and ends on the LAST INDEX
     *
     * For each joltage which must be turned on, find the highest joltage within the AVAILABLE
     * JOLTAGES. If multiple joltages compete for the highest spot, select the first index
     * from the AVAILABLE JOLTAGES. 
     *
     * i.e. "123456789" are the AVAILABLE JOLTAGES (batteries) and we need to turn on 3 batteries.
     *
     * For the first battery, the AVAILABLE JOLTAGES is "1234567" and the highest would by "7".
     * For the second battery, the AVAILABLE JOLTAGES is "8" and is automatically the highest.
     * etc...
     */

    let highestSequence = "";
    let firstIndex = 0;

    // Two pointers
    while (highestSequence.length < sequenceLength) {
        const lastIndex = (bank.length - 1) - (sequenceLength - highestSequence.length - 1);
        const range = bank.slice(firstIndex, lastIndex + 1);
        // The left pointer is ALWAYS 0 because the range uses firstIndex to create an array of
        // values to index from
        let left = 0;
        
        for (let right = left + 1; right < range.length; right++) {
            if (range[right] > range[left]) {
                // Update the index of the left pointer IF the right pointer's respective
                // value is GREATER THAN the left pointer's respective value, which
                // preserves the first index of the highest option
                left = right;
            }
        }

        // console.log({
        //     bankLength: bank.length,
        //     firstIndex,
        //     lastIndex,
        //     left,
        //     leftValue: range[left],
        //     range,
        // });

        // Add the respective left pointer's value to the sequence
        highestSequence += range[left];

        // Update the new starting point to the index after left
        firstIndex = firstIndex + left + 1;
    }

    batteryBanksMaxOutputs.push(Number(highestSequence));
});

const maxOutput = batteryBanksMaxOutputs.reduce((acc: number, cur: number) => {
    return acc + cur; 
}, 0);

console.log(maxOutput);
