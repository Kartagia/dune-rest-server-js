
import { describe } from "mocha";
import { AnsiColorSupport, isRGB, isRGBA, isValidRGBComponentValue } from "../src/colors.mjs";
import { createColorScheme } from "../src/colors.mjs";
import { expect } from "chai";

/**
 * @module test/colors
 * 
 * The JUnit test of the colors library.
 */

/**
 * Test the continuous range of the color scheme.
 * @param {import("../src/colors.mjs").ColorScheme} colorScheme The tested colors definition. 
 */
function testContinuosRange(colorScheme) {
    expect(colorScheme.first).a("number", "Invalid first code of continuos range");
    expect(colorScheme.last).a("number", "Invalid last code of continuous range");
    expect(colorScheme.first <= colorScheme.last, "Color range is empty").true;
}


/**
 * Test if a value is a valid color.
 * @param {*} color THe tested color.
 * @returns {boolean} True, if and only if the value is a valid color.
 */
function isColor(color) {
    switch (typeof color) {
        case "number":
            // Color code.
            return Number.isSafeInteger(color) && 0 <= color;
        case "object":
            // Object is always RGB or RGBA value.
            return isRGB(color) || isRGBA(color);
        default:
            return false;
    }
}

/**
 * Test a color scheme.
 * @param {*} tested 
 * @param {object} param1 The colro scheme testign options.
 * @param {number} [param1.first] The first color code of the continuous parent range.
 * @param {number} [param1.last] The last color code of the continuous parent range.
 * @param {boolean} [param1.testCase=false] Do we create a test case for this.
 */
function testColorScheme(tested, { testName = "Valid color scheme", first = undefined, last = undefined, testCase = false }) {
    /**
     * The test function testing the validity of the test case. 
     */
    function testFunction() {
        expect(tested).a("object");
        [
            ["has", "function", (value) => (value.length === 1)],
            ["toAnsiCommand", "function", (value) => (value.length === 1)]
        ].every(([property, type, test]) => {
            expect(tested, `Missing ${property}`).property(property);
            expect(tested[property], "Invalid ${property} type: not a ${type}").a(type);
            expect(test(tested[property]), `Invalid ${property}`).true;
        });
        if ("first" in tested && tested.first != null || "last" in tested && tested.last != null) {
            testContinuosRange(tested);
            if (first !== undefined) {
                expect(tested.first === undefined || first <= tested.first, `Invalid first property`).true;
            }
            if (last !== undefined) {
                expect(tested.last === undefined || tested.last <= last, `Invalid last property`).true;
            }
        }
        if ("colors" in tested && tested.colors !== undefined) {
            testColors(tested.colors);
        }
        if ("members" in tested && tested.members !== undefined) {
            testMembers(tested.members, { testName: "Members of scheme", first: tested.first, last: tested.last, testCase });
        }
    };
    if (testCase) {
        it(testName, testFunction);
    } else {
        testFunction();
    }
}

/**
 * Test members of a color scheme.
 * @param {Record<string, import("../src/colors.mjs").ColorScheme>} members The tested members.
 * @param {number} [first] The first value of a continous range. If this value is defined, the 
 * member codes must be at least first. 
 * @param {number} [last] The last value of a continueous range. IF this value is defined, the
 * member codes cannot exceed this code.
 * @param {boolean} [testCase=false] Is the test a test case creating the test cases.
 */
function testMembers(members, options = {}) {
    const { testName = "Members", first = undefined, last = undefined, testCase = false } = options;
    function testFunction() {
        expect(members).a("object");
        expect(members).instanceOf(Object);
        if (members instanceof Object) {
            const memberNames = Object.getOwnPropertyNames(members);
            memberNames.forEach(memberName => {
                const member = members[memberName];
                if (testCase) {
                    describe(`Member ${memberName}`, function () {
                        testColorScheme(member, { testName: `Member ${memberName}`, first, last, testCase });
                    })
                } else {
                    testColorScheme(member, { first, last, testCase });
                }
            });
        }
    }
    if (testCase) {
        describe(testName, () => {
            testFunction()
        });
    } else {
        testFunction();
    }
}


function testColor(color, message = `Invalid color`) {
    expect(isColor(color), message).true;
}

/**
 * Test color map. 
 * @param {Record<string, Number|RGB|RGBA>} colors The tested color map.
 */
function testColors(colors) {
    expect(colors).a("object");
    for (var colorName of Object.getOwnPropertyNames(colors)) {
        testColor(colors[colorName], `Invalid color ${colorName}`);
    }
}

describe("Color definitions", function () {

    const colors = AnsiColorSupport.COLORS;

    it(`Definitions exists`, function () {
        expect(colors).not.undefined;
        expect(colors).a("object");
    })

    testMembers(colors, { testCase: true });

});


describe("function createColorScheme", function () {
    const testCases = [
        {
            name: "Black and White",
            /**@type {Partial<import("../src/colors.mjs").ColorScheme>} */
            params: {
                first: 30,
                last: 31,
                colors: ["black", "white"],
            },
            test(value) {
                testColorScheme(value, {});
                this.params.colors.forEach((colorName, index) => {
                    expect(value.colors, `Invalid color ${colorName}`).property(colorName, this.params.first + index);
                })
                expect(value.first).equal(this.params.first);
                expect(value.last).equal(this.params.last);
            }
        },
        {
            name: "Black and White with generated last",
            /**@type {Partial<import("../src/colors.mjs").ColorScheme>} */
            params: {
                first: 30,
                colors: ["black", "white"],
            },
            test(value) {
                testColorScheme(value, {});
                this.params.colors.forEach((colorName, index) => {
                    expect(value.colors, `Invalid color ${colorName}`).property(colorName, this.params.first + index);
                })
                expect(value.first).equal(this.params.first);
                expect(value.last).equal(this.params.first +1);
            }
        },
        {
            name: "Black and White with 2 step gap",
            params: {
                first: 30,
                colors: ["black", undefined, undefined, "white"],
            },
            test(value) {
                testColorScheme(value, {});
                this.params.colors.forEach((colorName, index) => {
                    if (colorName) {
                        expect(value.colors, `Invalid color ${colorName}`).property(colorName, this.params.first + index);
                    }
                });
                expect(value.first).undefined;
                expect(value.last).undefined;
            }
        },
        {
            name: "Black and White with 2 step gap and overwritten last",
            params: {
                first: 30,
                last: 39,
                colors: ["black", undefined, undefined, "white"],
            },
            test(value) {
                testColorScheme(value, {});
                this.params.colors.forEach((colorName, index) => {
                    if (colorName) {
                        expect(value.colors, `Invalid color ${colorName}`).property(colorName, this.params.first + index);
                    }
                });
                expect(value.first).undefined;
                expect(value.last).undefined;
            }
        },
        {
            name: "Values from 30 to 39 without colors",
            params: {
                first: 30,
                last: 39
            },
            test(value) {
                testColorScheme(value, {});
                expect(value.colors).undefined;
                expect(value.first).equal(30);
                expect(value.last).equal(39);
            }
        }
    ];

    testCases.forEach((testCase, index) => {
        it(`Test case #${index}: ${testCase.name}`, function () {
            const testFunc = (params) => (createColorScheme(params));
            expect(() => (testFunc(testCase.params))).not.throw();
            const result = testFunc(testCase.params);
            testCase.test(result);
        });
    });
});
