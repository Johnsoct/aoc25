import puzzleData from "./6.json" with { type: "json" };

type ColumnValues = number[];

const regexWhitespaceMatch = new RegExp("\\s+");
const operators = puzzleData
    .problems
    .slice(-1)
    .join()
    .split(regexWhitespaceMatch);
const problems: ColumnValues[] = [];
const problemRows = puzzleData.problems.slice(0, -1);

problemRows.forEach((row, rowIndex) => {
    const columnValues = row.split(regexWhitespaceMatch);

    columnValues.forEach((columnValue, columnIndex) => {
        // First row of problems need to instantiate the problems array
        // with an array of just the first row's column value
        if (rowIndex === 0) {
            problems.push([ Number(columnValue) ]);
        }
        // Now that each column has an array representation in problems,
        // push to that specific array
        else {
            problems[columnIndex].push(Number(columnValue));
        }
    });
});

const total = problems.reduce((acc, problem, problemIndex) => {
    return acc + problem.reduce((acc, value) => {
        switch (operators[problemIndex]) {
            case "*":
                return acc * value;
            case "+":
                return acc + value;
            default: 
                return acc;
        }
    });
}, 0);

console.log(total);

