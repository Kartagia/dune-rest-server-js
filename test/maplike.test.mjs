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
  setLogLevel,
  getLogLevel,
  registerLogger,
} from "../src/MapLike.mjs";
import { testTestCase, testTestCaseTemplate } from "../src/testlib/testlib.mjs";

/**
 * The test case.
 * @template TESTED
 * @template PARAM
 * @template RETURN
 * @template EXCEPTION
 * @typedef {import("../src/testlib/testlib.mjs").TestCase<TESTED,PARAM,RETURN,EXCEPTION>} TestCase
 */

/**
 * The test case.
 * @template TESTED
 * @template PARAM
 * @template RETURN
 * @template EXCEPTION
 * @typedef {import("../src/testlib/testlib.mjs").TestCaseTemplate<TESTED,PARAM,RETURN,EXCEPTION>} TestCaseTemplate
 */

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

/**
 * The excepitons of the check map entries.
 * @typedef {RangeError|SyntaxError|TypeError} CheckMapEntriesExceptions
 */

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
  ].forEach((source, index) => {
    it(`Entries ${elementToString(source)}`, function () {
      let result;
      expect(() => {
        result = checkMapEntries(source);
        debug(`Got result ${elementToString(result)}`);
      }).not.throw();
    });
    /**
     * @type {import("../src/MapLike.mjs").MapLikeOptions<number,number>[]}
     */
    const testedOptions = [
      [
        { refuseDuplicates: true },
        function (_, index) {
          return index === 3;
        },
      ],
      [
        { validKey: (key) => key % 2 != 0 },
        undefined,
        function (_, index) {
          return index !== 0;
        },
      ],
      [
        {
          validEntry: (entry) => Array.isArray(entry) && entry.length === 2,
          validKey: (key) => key % 2 != 0,
        },
        undefined,
        undefined,
        function (_, index) {
          return index !== 0;
        },
      ], 
      [
        ({
          validEntry: (entry) => Array.isArray(entry) && entry.length === 2,
          validValue: (key) => key % 2 != 0,
        },
        undefined,
        undefined,
        undefined,
        function (_, index) {
          return index !== 0;
        })
      ],
    ];
    testedOptions.forEach(
      ([
        options,
        hasDuplicates = undefined,
        hasInvalidEntry = undefined,
        hasInvalidKey = undefined,
        hasInvalidValue = undefined,
      ]) => {
        it(`Entries ${elementToString(
          source
        )} with options ${mapLikeOptionsToString(options)}`, function () {
          const equalKey = options.equalKey ?? SameValueZeroEquality;
          let result;
          if (hasDuplicates && hasDuplicates(options, index)) {
            expect(() => {
              result = checkMapEntries(source, options);
            }).to.throw(RangeError);
          } else if (hasInvalidEntry && hasInvalidEntry(options, index)) {
            expect(() => {
              result = checkMapEntries(source, options);
            }).to.throw(SyntaxError);
          } else if (hasInvalidKey && hasInvalidKey(options, index)) {
            expect(() => {
              result = checkMapEntries(source, options);
            }).to.throw(RangeError);
          } else if (hasInvalidValue && hasInvalidValue(options, index)) {
            expect(() => {
              result = checkMapEntries(source, options);
            }).to.throw(TypeError);
          } else {
            expect(() => {
              result = checkMapEntries(source, options);
            }).not.throw();
            source.forEach(([key, value]) => {
              const entry = result.find(([entryKey]) =>
                equalKey(entryKey, key)
              );
              expect(entry).length(2);
              expect(entry[0]).equal(key);
              expect(entry[1]).equal(value);
            });
          }
        });
      }
    );
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

describe("checkMapElements with altering options", function () {
  const testFn = (
    /** @type {Iterable<[KEY,VALUE]>} */ iterable,
    /** @type {MapLikeOptions<KEY,VALUE>} */ options
  ) => {
    return checkMapEntries(iterable, options);
  };

  /**
   * The test cases.
   * @template [KEY=number]
   * @template [VALUE=number]
   * @type {TestCase<Iterable<KEY,VALUE>, [import("../src/MapLike.mjs").MapLikeOptions<KEY,VALUE>], [KEY,VALUE][], CheckMapEntriesExceptions>[]}
   */
  (
    [
      { nameSuffix: "Empty" },
      {
        nameSuffix: `${elementToString([
          [1, 1],
          [2, 2],
          [3, 3],
        ])}`,
        tested: [
          [1, 1],
          [2, 2],
          [3, 3],
        ],
      },
      {
        nameSuffix: `${elementToString([
          [1, 1],
          [2, 2],
          [3, 3],
        ])}`,
        tested: [
          [1, 1],
          [2, 2],
          [3, 3],
        ],
        params: {
          createNewResult: true,
        },
      },
    ].map(
      (
        {
          /** @type {Iterable<[KEY,VALUE]>} */ entries,
          /** @type {import("../src/MapLike.mjs").MapLikeOptions<KEY,VALUE>} */ params,
          /** @type {CheckMapEntriesExceptions|undefined} */ expectedException = undefined,
          /** @type {[KEY,VALUE][]|undefined} */ expectedResult = undefined,
          /** @type {string|undefined} */ nameSuffix = undefined,
        },
        /** @type {number} */ index
      ) => {
        const testName = `${
          params === undefined
            ? "Without options"
            : `With options ${mapLikeOptionsToString(params)}`
        }: ${nameSuffix ?? ""}`;
        /**
         * @type {TestCase<Iterable<[KEY,VALUE]>,[import("../src/MapLike.mjs").MapLikeOptions<KEY,VALUE>],[KEY,VALUE][],CheckMapEntriesExceptions>}
         */
        const result = {
          name: testName,
          tested: entries,
          param: params == null ? [params] : undefined,
          test: testFn,
          expectedException,
          expectedResult,
        };
        return result;
      }
    )
  ).forEach(testTestCase);
});

/**
 * @template KEY  The type of the maplike key.
 * @tempalte VALUE The value of the maplike value.
 * @param {import("../src/MapLike.mjs").MapLikeOptions<KEY,VALUE>} options
 * @returns {string} The string containing the human readable representation
 * of the options.
 */
export function mapLikeOptionsToString(options) {
  return [
    "refuseDuplicates",
    "createNewResult",
    "replaceToEnd",
    "validKey",
    "validValue",
    "validEntry",
    "entries",
  ].reduce(
    (result, option) => {
      if (options[option]) {
        return {
          result: result.result + (result.result ? "," : "") + `${option}`,
        };
      } else {
        return result;
      }
    },
    { result: "" }
  ).result;
}

describe("class MutableMapLike", function () {
  const originalLogLevel = getLogLevel();
  setLogLevel("debug");
  /**
   * The function generating test cases.
   * @param {import("../src/MapLike.mjs").MapLikeOptions<number,number>} options
   * @returns {Partial<TestCase<number,number>>[]} The array of test the  test cases for
   * template.
   */
  function generateTestCases(options = {}) {
    const funcName = "generateTestCases";
    const initialEntries = checkMapEntries([], {
      ...options,
      createNewResult: true,
    });
    console.debug(
      `${funcName}: Initial entries: ${elementToString(initialEntries)}`
    );
    const equalKey = options.equalKey ?? SameValueZeroEquality;
    // The current entries.
    const setOptions = mapLikeOptionsToString(options);

    let currentEntries = initialEntries;
    return /** @type {Partial<TestCase<number,number>>[]} */ [
      ...[
        [0, 0],
        [1, 1],
        [2, 2],
        [0, 3, true],
      ].map(([key, value, replacement = false]) => {
        // Creating the initial entries of the options as copy (the rep used is never altered)
        const testName = `set(${elementToString(key)}, ${elementToString(
          value
        )})${setOptions}`;
        const testParam = [key, value];
        const test = (tested, [key, value]) => {
          tested.set(key, value);
        };
        const expectedException =
          options.refuseDuplicates && replacement ? RangeError : undefined;
        try {
          const result = checkMapEntries([[key, value]], {
            ...options,
            entries: currentEntries,
          });
          currentEntries = result;
          return {
            name: testName,
            param: testParam,
            test,
            expectedResult: result,
            expectedException,
          };
        } catch (exception) {
          // The operation fails.
          return {
            name: testName,
            param: testParam,
            test,
            expectedException: exception,
          };
        }
      }),
      ...[4, 0, 0, 2].map((key) => {
        if (currentEntries.find(([entryKey]) => equalKey(key, entryKey))) {
          currentEntries = currentEntries.filter(
            ([entryKey]) => !equalKey(key, entryKey)
          );
          return {
            name: `existing delete(${elementToString(key)})`,
            param: [key],
            test: (tested, [key]) => tested.delete(key),
            expectedResult: true,
          };
        } else {
          return {
            name: `absent delete(${elementToString(key)})`,
            param: [key],
            test: (tested, [key]) => tested.delete(key),
            expectedResult: false,
          };
        }
      }),
    ];
  }

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
            expect(() => {
              result = tested.delete(1);
            }).not.throw;
            expect(tested.has(1)).false;
            expect(tested.get(1)).undefined;
          },
        },
        {
          name: "Clear()",
          test(tested) {
            let result;
            expect(() => {
              result = tested.clear();
            }).not.throw;
            expect(tested.has(1)).false;
            expect(tested.entries()).empty;
          },
        },

        ...generateTestCases({
          createNewResult: true,
          validKey: (value) => Number.isSafeInteger(value) && value >= 0,
        }),
        ...generateTestCases({
          createNewResult: true,
          refuseDuplicates: true,
          validKey: (value) => Number.isSafeInteger(value) && value >= 0,
        }),
      ],
    },
  ].forEach(testTestCaseTemplate);
  setLogLevel(originalLogLevel);
});
