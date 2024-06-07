/**
 * @module test/lib/maplike
 *
 * The JUnit testing of the MapLike library.
 */

import { describe, it } from "mocha";
import { expect, AssertionError } from "chai";
import { BasicReadOnlyMapLike, SameValueZeroEquality, checkMapEntries, elementToString } from "../src/MapLike.mjs";
import { debug, error, log } from "../src/MapLike.mjs";
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
 * @template [PARAM=any[]] The test parameters.
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
  [ [-0, +0, true], [-0,-0, true], [-0, 1, false], ["a", "b", false]].forEach( 
    ([tested, testee, expected], index) => {
    const testName = `${elementToString(tested)} ${op} ${elementToString(testee)} === ${elementToString(expected)}`;
    console.log(`Testing #${index}:` + testName);
    it(`Test case #${index}: ${testName}`, function () {
      console.log(`Testing case #${index}:` + testName);
      expect(() => {opFunc(tested, testee)}).not.throw;
      const result = opFunc(tested, testee);
      expect(result, `The result was ${elementToString(result)} instead of ${elementToString(expected)}`).equal(expected);
      expect(result, `Equality did not return a boolean value`).a("boolean");
      console.log(`${elementToString(tested)} ${op} ${elementToString(testee)}} was ${elementToString(result)}`)
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
    [[1,0], [0,1]],
    [
      [1, 1],
      [2, 2],
      [3, 3]
    ]
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
 *
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
          [
            [1, 1],
            [2, 2],
            [3, 3],
          ],
        ].map((entries) => {
          return {
            name: `Initial Entries ${entries}`,
            tested:
              /** @type {import("../src/MapLike.mjs").ReadOnlyMapLike<number,number>} */ new BasicReadOnlyMapLike(entries),
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
          console.debug(`Expecting: ${elementToString(testResult)}`);
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
