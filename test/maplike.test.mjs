/**
 * @module test/lib/maplike
 *
 * The JUnit testing of the MapLike library.
 */

import { expect, AssertionError } from "chai";
import { BasicReadOnlyMapLike } from "../src/MapLike.mjs";

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

/**
 * 
 */
describe("class ReadOnlyMapLike", function () {
  ( /** @type {TestCaseTemplate<BasicReadOnlyMapLike<number,number>>*/ [{name: "ReadOnlyMapLike<number,number>",
  tested: /** @type {ReadOnlyMapLike<number,number>} */new BasicReadOnlyMapLike(),
  test: (/** @type {import("../src/MapLike.mjs").ReadOnlyMapLike<number,number>} */ tested) => {
    ["size", "has", "get", "values", "entries", Symbol.iterator].forEach( (prop) => {expect(tested).property(prop)})
  },
  testCases: [{}, {name: "Lacking has", tested: {...this.tested, has:undefined} ,expectedException: AssertionError}]
}]).forEach((test, index) => {
    describe(
      `Test #${index}${test.name ? `: ${test.name}` : ""}`,
      function () {
        (test.testCases ?? []).forEach((testCase, caseIndex) => {
            it(`Case #${index}.${caseIndex}: ${testCase.name ?? ""}`, function() {
                const tested = testCase.tested ?? test.tested;
                const testTest = ("test" in testCase ? testCase.test : test.test);
                const testParam = ("param" in testCase ? testCase.param : test.param);
                const testResult = ("expectedResult" in testCase ? testCase.expectedResult : test.expectedResult);
                const testException = ("expectedException" in testCase ? testCase.expectedException : test.expectedException);
                if (testException === undefined) {
                    let result;
                    expect( () => { result = testTest(tested, testParam)}).not.throw();
                    if (testResult) {
                        expect(result).eql(testResult);
                    }
                } else {
                    let result;
                    expect( () => {result = testTest(tested, testParam)}).throw(testException);
                }
            });
        });
      }
    );
  });
});
