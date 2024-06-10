
/**
 * @module test/testlib
 * 
 * The library containing test datatypes and tools for creating tests.
 */

import { expect } from "chai";
import { it, describe } from "mocha";


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
  it(`Test Case ${index === undefined ? "" : `#${index}`}: ${testCase.name ?? ""}`, function () {
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
    describe(`Test ${index === undefined ? "" : `#${index}`}:${test.name ?? ""}`, function () {
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
