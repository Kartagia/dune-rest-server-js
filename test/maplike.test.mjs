/**
 * @module test/lib/maplike
 *
 * The JUnit testing of the MapLike library.
 */

import { describe, it, before, after } from "mocha";
import { expect, AssertionError } from "chai";
import {
  BasicMutableMapLike,
  BasicReadOnlyMapLike,
  SameValueZeroEquality,
  checkMapEntries,
  elementToString,
} from "../src/MapLike.mjs";
import {
  debug,
  error,
  log,
  setLogLevel,
  registerLogger,
} from "../src/MapLike.mjs";
/**
 * Test function testing a construction.
 * @template {TESTED extends Function} TESTED The tested object constructor function.
 * @template [PARAM=any[]] The tested construction parameters.
 * @template [EXCEPTION=any] The exception type the test may throw.
 * @callback ConstructorTestFunction
 * @param {PARAM} [param] The parameters passed to the constructor.
 * @returns {TESTED} The created instance of tested.
 * @throws {EXCEPTION} The cosntruction failed.
 */

/**
 * A constructor test case.
 * @template {TESTED extends Function} TESTED The tested value.
 * @template [PARAM=any[]] The test parameters.
 * @template [EXCEPTION=any] The exception type the test may throw.
 * @typedef {Object} ConstructorTestCase
 * @property {string} name The test case name.
 * @property {ConstructorTestFunction<TESTED,PARAM,EXCEPTION>} test The test function.
 * @property {EXCEPTION|undefined} [expectedException] The expected excpetion.
 */

/**
 * Test function testing a soemthing on an a value.
 * @template TESTED The tested value.
 * @template [PARAM] The test parameters.
 * @template [RESULT=undefined] THe result type of the test function.
 * @template [EXCEPTION=any] The exception type the test may throw.
 * @callback TestFunction
 * @param {TESTED} tested The tested value.
 * @param {PARAM=any[]} [param] The parameters of the test.
 * @returns {RESULT} The retulr value of the test.
 * @throws {EXCEPTION} The exception type of the test.
 */

/**
 * A test case.
 * @template TESTED The tested value.
 * @template [PARAM=any[]] The test parameters.
 * @template [RESULT=undefined] THe result type of the test function.
 * @template [EXCEPTION=any] The exception type the test may throw.
 * @typedef {Object} TestCase
 * @property {string} name The test case name.
 * @property {TESTED} tested The tested value.
 * @property {PARAM} param The parameters of the test case.
 * @property {TestFunction<TESTED,PARAM,RESULT,EXCEPTION>} test The test function.
 * @property {RESULT|undefined} [expectedResult] The expected result.
 * @property {EXCEPTION|undefined} [expectedException] The expected excpetion.
 */

/**
 * @template TESTED The tested value.
 * @template [PARAM=any[]] The test parameters.
 * @template [RESULT=undefined] THe result type of the test function.
 * @template [EXCEPTION=any] The exception type the test may throw.
 * @typedef {Object} TestCaseTemplate
 * @property {string} name The name of the template.
 * @property {TESTED} tested The tested value used by default.
 * @property {Partial<TestCase<TESTED, PARAM, RESULT,EXCEPTION>>[]} [testCases=[]] The test cases.
 */

describe("Testing SameValueZeroEquality", function () {
  const op = "SameValueZero";
  const opFunc = SameValueZeroEquality;
  [
    [-0, +0, true],
    [-0, -0, true],
    [-0, 1, false],
    ["a", "b", false],
  ].forEach(([tested, testee, expected], index) => {
    const testName = `${elementToString(tested)} ${op} ${elementToString(
      testee
    )} === ${elementToString(expected)}`;
    log(`Testing #${index}:` + testName);
    it(`Test case #${index}: ${testName}`, function () {
      log(`Testing case #${index}:` + testName);
      expect(() => {
        opFunc(tested, testee);
      }).not.throw;
      const result = opFunc(tested, testee);
      expect(
        result,
        `The result was ${elementToString(result)} instead of ${elementToString(
          expected
        )}`
      ).equal(expected);
      expect(result, `Equality did not return a boolean value`).a("boolean");
      log(
        `${elementToString(tested)} ${op} ${elementToString(
          testee
        )}} was ${elementToString(result)}`
      );
    });
  });
});

it("Testing Array[Symbol.iterable]", function () {
  const source = [
    [1, 1],
    [2, 2],
    [3, 3],
  ];
  const tested = source[Symbol.iterator]();
  let index = 0;
  let cursor = tested.next();
  while (!cursor.done) {
    expect(cursor.value).deep.equal(source[index]);
    index++;
    cursor = tested.next();
  }
  expect(
    index,
    `The iteration returned ${index} istead of ${source.length}`
  ).equal(source.length);
});

describe("method checkMapEnries", function () {
  it("Entries []", function () {
    let result;
    expect(() => {
      result = checkMapEntries([]);
    }).not.throw();
    expect(result).empty;
  });

  [
    [[1, 1]],
    [
      [1, 0],
      [0, 1],
    ],
    [
      [1, 2],
      [2, 1],
    ],
    [
      [2, 1],
      [2, 1],
      [3, 3],
    ],
    [
      [1, 1],
      [2, 2],
      [3, 3],
    ],
  ].forEach((source) => {
    it(`Entries ${elementToString(source)}`, function () {
      let result;
      expect(() => {
        result = checkMapEntries(source);
        debug(`Got result ${elementToString(result)}`);
      }).not.throw();
    });
  });
});

/**
 * Test testing readonly maplike.
 */
describe("class ReadOnlyMapLike", function () {
  /** @type {TestCaseTemplate<BasicReadOnlyMapLike<number,number>, undefined|Array<[number,number]>, undefined|Array<[number,number]>>*/ [
    {
      name: "ReadOnlyMapLike<number,number>",
      tested:
        /** @type {ReadOnlyMapLike<number,number>} */ new BasicReadOnlyMapLike(),
      test: (
        /** @type {import("../src/MapLike.mjs").ReadOnlyMapLike<number,number>} */ tested
      ) => {
        ["size", "has", "get", "values", "entries", Symbol.iterator].forEach(
          (prop) => {
            expect(tested).property(prop);
          }
        );
      },
      testCases: [
        {},
        {
          name: "Lacking has",
          tested: { ...this.tested, has: undefined },
          expectedException: AssertionError,
        },
        ...[
          [],
          [
            [1, 1],
            [2, 2],
            [3, 3],
          ],
          [
            [2, 1],
            [1, 2],
            [3, 3],
          ],
        ].map((entries) => {
          return {
            name: `Initial Entries ${elementToString(entries)}`,
            tested:
              /** @type {import("../src/MapLike.mjs").ReadOnlyMapLike<number,number>} */ new BasicReadOnlyMapLike(
                entries
              ),
            params: entries,
            test: (
              /** @type {import("../src/MapLike.mjs").ReadOnlyMapLike<number,number>} */ tested
            ) => {
              return [...tested.entries()];
            },
            expectedResult: entries,
          };
        }),
      ],
    },
  ].forEach((test, index) => {
    describe(`Test #${index}${test.name ? `: ${test.name}` : ""}`, function () {
      (test.testCases ?? []).forEach((testCase, caseIndex) => {
        it(`Case #${index}.${caseIndex}: ${testCase.name ?? ""}`, function () {
          const tested = testCase.tested ?? test.tested;
          const testTest = "test" in testCase ? testCase.test : test.test;
          const testParam = "param" in testCase ? testCase.param : test.param;
          const testResult =
            "expectedResult" in testCase
              ? testCase.expectedResult
              : test.expectedResult;
          debug(`Expecting: ${elementToString(testResult)}`);
          const testException =
            "expectedException" in testCase
              ? testCase.expectedException
              : test.expectedException;
          if (testException === undefined) {
            let result;
            expect(() => {
              result = testTest(tested, testParam);
            }).not.throw();
            if (testResult) {
              expect(result).eql(testResult);
            }
          } else {
            let result;
            expect(() => {
              result = testTest(tested, testParam);
            }).throw(testException);
          }
        });
      });
    });
  });
});

/**
 * Test the test case.
 * @template TESTED The tested object.
 * @template PARAM The paramter type of the test fucntion opbject.
 * @template RESULT THe result type of the test function.
 * @template EXCEPTION The error type of the test fucntion.
 * @param {TestCase<TESTED,PARAM,RESULT,EXCEPTION>} testCase The tested test case.
 * @param {number} index The index of the test case.
 * @throws {AssertionError} The test failed.
 */
export function testTestCase(testCase, index) {
  it(`Test Case ${index === undefined ? "" : `#${index}`}: ${
    testCase.name ?? ""
  }`, function () {
    if (testCase.exception === undefined) {
      // The test case does not throw excpetion.
      let result;
      expect(() => {
        result = testCase.test(testCase.tested, testCase.params);
      }).not.throw;
      expect(result).equal(testCase.expectedResult);
    } else {
      // Test case throws exception.
      expect(() => {
        testCase.test(testCase.tested, testCase.params);
      }).throws(testCase.expectedException);
    }
  });
}

/**
 * Test the test case template.
 * @template TESTED The tested object.
 * @template PARAM The paramter type of the test fucntion opbject.
 * @template RESULT THe result type of the test function.
 * @template EXCEPTION The error type of the test fucntion.
 * @param {TestCaseTemplate<TESTED,PARAM,RESULT,EXCEPTION>} test
 * @param {number} [index] The index of the test, if it is part of other tests.
 */
export function testTestCaseTemplate(test, index = undefined) {
  if ("testCases" in test && test.testCases.length > 0) {
    describe(`Test ${index === undefined ? "" : `#${index}`}:${
      test.name ?? ""
    }`, function () {
      test.testCases.forEach((testCase, caseIndex) => {
        const caseName = testCase.name ?? test.name ?? "";
        const caseTested = testCase.tested ?? test.tested;
        const caseParam = testCase.param ?? test.param;
        const caseExpected = testCase.result ?? test.result;
        const caseTester = testCase.test ?? test.test;
        const caseException = testCase.exception ?? test.exception;
        testTestCase(
          {
            name: caseName,
            tested: caseTested,
            param: caseParam,
            expectedResult: caseExpected,
            exceptionExcpetion: caseException,
          },
          caseIndex
        );
      });
    });
  } else {
    testTestCase(test, index);
  }
}

describe("class MutableMapLike", function () {
  [
    {
      name: "Empty MutableMapLike<number,number>",
      tested: new BasicMutableMapLike(),
      testCases: [
        {
          test(tested) {
            expect(tested).not.null;
            expect(tested.instanceof(BasicMutableMapLike));
            expect(tested.entries).empty;
          },
        },
        {
          name: "Set(1.0)",
          test(tested) {
            expect(tested.set(1, 0)).not.throw;
            expect(tested.entries()).not.empty;
            expect(tested.has(1)).true;
            expect(tested.get(1)).equal(0);
          },
        },
        {
          name: "Set(1.5)",
          test(tested) {
            expect(tested.set(1, 5)).not.throw;
            expect(tested.entries()).not.empty;
            expect(tested.has(1)).true;
            expect(tested.get(1)).equal(5);
          },
        },
        {
          name: "Set(2.0)",
          test(tested) {
            expect(tested.set(2, 0)).not.throw;
            expect(tested.entries()).not.empty;
            expect(tested.has(2)).true;
            expect(tested.get(2)).equal(0);
          },
        },
        {
          name: "Delete(1)",
          test(tested) {
            let result; 
            expect(() => {result = tested.delete(1)}).not.throw;
            expect(tested.has(1)).false;
            expect(tested.get(1)).undefined;
          },
        },
        {
          name: "Clear()",
          test(tested) {
            let result; 
            expect(() => {result = tested.clear()}).not.throw;
            expect(tested.has(1)).false;
            expect(tested.entries()).empty;
          },
        },
      ],
    },
  ].forEach(testTestCaseTemplate);
});
