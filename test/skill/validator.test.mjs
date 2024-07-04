import PropertyDefinition, {
  getPropertyDef,
  getPropertyChecker,
} from "../../src/validator.mjs";
import { AssertionError, expect } from "chai";
/**
 *
 * The test suite validating
 * @module test/skill/Validator
 */

/**
 * @inheritdoc
 * 
 * @template TYPE
 * @template ERROR
 * @typedef {import("../../src/validator.mjs").Predicate<TYPE,ERRRO>} Predicate
 */

/**
 * @inheritdoc
 * 
 * @template TYPE
 * @template ERROR
 * @typedef {import("../../src/validator.mjs").Checker<TYPE,ERRRO>} Checker
 */

function testChecker() {}

/**
 * A test case.
 * @typedef {Object} TestCase
 * @template TESTED The tested type.
 * @template [RESULT] The type of the result.
 * @template [ERROR=AssertionError] The type of the test failure exception.
 * @property {string} [title] The tttle of the test case.
 * @property {number} [index] The index of the test case.
 * @property {TESTED} tested The tested value.
 * @property {(value: TESTED)=>RESULT} test The test function.
 * @property {RESULT} [result] The expected result. An undefined value indicates
 * no return value is expected.
 * @property {ERROR} [exception] The exception thrown by the test.
 * @property {(a: TYPE, b: TYPE) => boolean} [equality] The equality function for
 * testing equality of the results. Defaults to the strict equality.
 */

/**
 * Create a test case.
 * @template TESTED The tested type.
 * @template [RESULT] The type of the result.
 * @template [ERROR=AssertionError] The type of the test failure exception.
 * @param {TestCase<TESTED, RESULT, EXCEPTION>} param0
 */
function createTestCase({
  title,
  index,
  tested,
  test,
  equality = undefined,
  result = undefined,
  exception = undefined,
}) {
  if (result !== undefined && exception !== undefined) {
    // Impossible case - the function cannot throw and return
    throw new Error("Test Case cannot expect both result and exception");
  }

  return {
    title,
    index,
    testName,
    tested,
    test,
    equality,
    result,
    exception,
  };
}
function testTestCase(testCase) {
  const {
    title,
    index,
    tested,
    test,
    equality = undefined,
    result = undefined,
    exception = undefined,
  } = testCase;
  it(`Test${index === undefined ? "" : ` #${index}`}: ${
    title ?? ""
  }`, function () {
    if (exception === undefined) {
      // There is no exception.
      let testResult;
      expect(() => {
        testResult = test(tested);
      }).to.not.throw();
      if (testResult !== undefined) {
        if (equality) {
          expect(
            equality(testResult, result),
            `Expected ${result}, but got ${testResult}`
          ).true;
        } else {
          expect(testResult).equal(result);
        }
      } else {
        expect(result, `Unexpected return value`).undefined;
      }
    } else {
      // The exception is expected.
      expect(() => {
        test(tested);
      }).to.throw(exception);
    }
  });
}

describe(`Class PropertyDefinition`, () => {
  /**
   * The etst argumetns.
   * @type {Partial<import("../../src/validator.mjs").PropertyArrayDef>[]}
   */
  const testArgs = [
    {
      testName: "Name with automatic checker",
      /**
       * @type {[testName: string, validValue: import("../../src/validator.mjs").Predicate<string>, (value) => (TypeError|SyntaxError|undefined), import("../../src/validator.mjs").Checker<string, TypeError|SytnaxError>]}
       */
      args: [
        "name",
        /** @type {Predicate<string>} */
        (value) => typeof value === "string" && value && value.trim() === value,
        function (value) {
          if (typeof value !== "string") {
            return new TypeError("The name property must be a string.");
          } else if (value && value.trim() !== value) {
            return new SyntaxError(
              "The name property cannot contain trailing or leading white spaces"
            );
          } else if (!value) {
            return new SyntaxError("The name property cannot be empty");
          }
        },
      ],
    },
    {
      testName: "Name with checker",
      args: [
        "name",
        /** @type {Predicate<string>} */
        (value) => typeof value === "string" && value && value.trim() === value,
        function (value) {
          if (typeof value !== "string") {
            return new TypeError("The name property must be a string.");
          } else if (value && value.trim() !== value) {
            return new SyntaxError(
              "The name property cannot contain trailing or leading white spaces"
            );
          } else if (!value) {
            return new SyntaxError("The name property cannot be empty");
          }
        },
        /**
         * Check validity of the name.
         * @type {Checker<string, TypeError|SyntaxError>}
         */
        function (value) {
          if (typeof value !== "string") {
            throw new TypeError("The name property must be a string.");
          } else if (value && value.trim() !== value) {
            throw new SyntaxError(
              "The name property cannot contain trailing or leading white spaces"
            );
          } else if (!value) {
            throw new SyntaxError("The name property cannot be empty");
          } else {
            return /** @type {string} */ value;
          }
        },
      ],
    },
  ];
  const testCases = testArgs.map(([name, args], index) => {
    return {
      name,
      index,
      tested: args,
      test(args) {
        let target;
        expect(() => {
          target = this.create(...args);
        }).not.throw();
      },
    };
  });
  testCases.forEach((testCase) => {
    describe(`optional`, function () {
      testTestCase({
        ...testCase,
        create(args) {
          return PropertyDefinition.optional(...args);
        },
      });
    });

    describe(`required`, function () {
      testTestCase({
        ...testCase,
        create(args) {
          return PropertyDefinition.required(...args);
        },
      });
    });
  });
  describe(`constructor`, function () {});
});

describe(`Validator`, () => {});
