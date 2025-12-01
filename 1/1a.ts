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

const answer = operations.reduce((count: number, operation: string) => {
    const change: number = getChangeAmount(operation);
    const newValue = getNewValue(currentValue, change);

    currentValue = newValue;
    
    if (currentValue === 0) {
        // eslint-disable-next-line no-param-reassign
        count++;
    }

    return count;
}, 0);

console.log(answer);
