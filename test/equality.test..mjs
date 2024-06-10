import { describe, it } from "mocha";
import { expect } from "chai";
import { SameValueZeroEquality, elementToString } from "../src/MapLike.mjs";
import { log } from "../src/MapLike.mjs";

/**
 * Test desting same value zero equality.
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
