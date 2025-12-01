import {
    describe,
    expect,
    it,
} from "vitest";

import { 
    getChangeAmount,
    getNewValue,
} from "./1a";

describe("getChangeAmount", () => {
    it("Left rotation results in a negative change", () => {
        const expectations = [ -1, -0, -45, -99, -1234 ];
        const tests = [ "L1", "L0", "L45", "L99", "L1234" ];

        tests.forEach((test, index) => {
            expect(getChangeAmount(test)).toBe(expectations[index]);
        });
    });

    it("Right rotation results in a positive change", () => {
        const expectations = [ 1, 0, 45, 99, 1234 ];
        const tests = [ "R1", "R0", "R45", "R99", "R1234" ];

        tests.forEach((test, index) => {
            expect(getChangeAmount(test)).toBe(expectations[index]);
        });
    });
});

describe("getNewValue", () => {
    const expectation = [ 75, 99, 98, 90, 25 ];
    //[ [ currentValue, change ] ]
    const tests = [ [ 50, 25 ], [ 0, 99 ], [ 99, 99 ], [ 0, -10 ], [ 50, -125 ] ];

    tests.forEach((test, index) => {
        it(`Current value: ${test[0]}; Change: ${test[1]}`, () => {
            expect(getNewValue(test[0], test[1])).toBe(expectation[index]);
        });
    });
});
