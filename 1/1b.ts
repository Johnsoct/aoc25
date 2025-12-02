import puzzleData from "./1a.json" with { type: "json" };

const operations = puzzleData.operations;
let currentValue: number = 50;

export const getChangeAmount = (operation: string): number => {
    // Convert operation to positive or negative
    if (operation.charAt(0) === "L") {
        return -Number(operation.slice(1));
    }
    else {
        return Number(operation.slice(1));
    }
};

export const getNewValue = (currentValue: number, change: number) => {
    return ((currentValue + change) % 100 + 100) % 100;
};

export const getPartialLoopAcrossZero = (currentValue: number, change: number) => {
    const newValue = currentValue + change;

    // Starting at 0 does not count as "across zero"
    // 99 + 1 (to avoid duplicate counting at 0
    if (currentValue !== 0 && (newValue < 0 || newValue > 100)) {
        return true;
    }
    else {
        return false;
    }
};

const answer = operations.reduce((count: number, operation: string) => {
    const change = getChangeAmount(operation);
    const newValue = getNewValue(currentValue, change);
    const partialLoopAcrossZero = getPartialLoopAcrossZero(currentValue, change % 100);
    const wholeLoopsAcrossZero = Math.floor(Math.abs(change) / 100);
    let countIncrement = 0;

    if (newValue === 0) {
        countIncrement++;
    }

    if (partialLoopAcrossZero) {
        countIncrement++;
    }

    if (wholeLoopsAcrossZero > 0) {
        countIncrement += wholeLoopsAcrossZero;
    }

    // console.log({
    //     change,
    //     countIncrement,
    //     currentValue,
    //     newValue,
    //     operation,
    //     partialCrossing: partialLoopAcrossZero,
    //     wholeLoops: wholeLoopsAcrossZero,
    // });

    currentValue = newValue;
    // eslint-disable-next-line no-param-reassign
    count += countIncrement;

    return count;
}, 0);

console.log(answer);
