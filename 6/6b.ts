import puzzleData from "./6.json" with { type: "json" };

/*
 * How this works, because fuck this stupid problem.
 * 
 * 123 328  51 64 
 *  45 64  387 23 
 *   6 98  215 314
 *   +   *   +
 *
 *   charPos=0: Row chars = ['1', ' ', ' '] → digits=['1'] → number=1 → currentProblem=[1]
 *   charPos=1: Row chars = ['2', '4', ' '] → digits=['2','4'] → number=24 → currentProblem=[1,24]
 *   charPos=2: Row chars = ['3', '5', '6'] → digits=['3','5','6'] → number=356 → currentProblem=[1,24,356]
 *   charPos=3: Row chars = [' ', ' ', ' '] → digits=[] → ALL SPACES! 
 *              → Save [1,24,356] to allProblems, reset currentProblem=[]
 *   charPos=4: Row chars = ['3', '6', '9'] → digits=['3','6','9'] → number=369 → currentProblem=[369]
 *   charPos=5: Row chars = ['2', '4', '8'] → digits=['2','4','8'] → number=248 → currentProblem=[369,248]
 *
 */

const allProblems: number[][] = [];
const regexWhitespaceMatch = new RegExp("\\s+");
const operators = puzzleData
    .problems
    .slice(-1)
    .join()
    .split(regexWhitespaceMatch);
const problemRows = puzzleData.problems.slice(0, -1);
const problemRowsMaxWidth = Math.max(...problemRows.map((row) => {
    return row.length;
}));
let currentProblem: number[] = [];

for (let characterPosition = 0; characterPosition < problemRowsMaxWidth; characterPosition++) {
    const digitsAtCharacterPosition: string[] = [];

    // Track all the row values for the current position (vertical digits)
    problemRows.forEach((row) => {
        const comparisonCharacter = row[characterPosition];

        if (comparisonCharacter !== " ") {
            digitsAtCharacterPosition.push(comparisonCharacter);
        }
    });

    // Add digits combined as a number to the current column's problem
    if (digitsAtCharacterPosition.length) {
        currentProblem.push(Number(digitsAtCharacterPosition.join("")));
    }
    // All the row values for the position were empty, so treat it as a column split
    else {
        allProblems.push(currentProblem);
        currentProblem = [];
    }
}

// Add potential last current problem
if (currentProblem.length) {
    allProblems.push(currentProblem);
}

const total = allProblems.reduce((acc, problem, problemIndex) => {
    const operationTotal = problem.reduce((acc, number) => {
        switch (operators[problemIndex]) {
            case "*":
                return acc * number;
            case "+":
                return acc + number;
            default: 
                return acc;
        }
    });

    return acc + operationTotal;
}, 0);

console.log(total);

