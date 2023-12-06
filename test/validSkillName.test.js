import { validSkillName, validName } from "../index.js";
import { describe, it } from "mocha";
import { expect } from "chai";

/**
 * Test the valid names.
 */
describe("Valid names", () => {
  ["Battle", "Scar", "Numblar", "Butler Shuttler"].forEach((tested) => {
    it(`Testing "${tested}"`, () => {
      const result = validName(tested);
      expect(result).to.true;
    });
  });
});

/**
 * Test invalid names.
 */
describe("Invalid names", () => {
  [null, undefined, 9.5, Number.POSITIVE_INFINITY, {}, []].forEach((tested) => {
    it(`Tested value ${
      typeof tested === "string" ? `"${tested}"` : tested
    }`, () => {

      const result = validName(tested);
      expect(result).to.false;
    });
  });
});


/**
 * Test the valid names.
 */
describe("Valid skill names", () => {
  ["Battle", "Scar", "Numblar", "Butler Shuttler"].forEach((tested) => {
    it(`Testing "${tested}"`, () => {
      const result = validSkillName(tested);
      expect(result).to.true;
    });
  });
});

/**
 * Test invalid names.
 */
describe("Invalid skill names", () => {
  [null, undefined, 9.5, Number.POSITIVE_INFINITY, {}, []].forEach((tested) => {
    it(`Tested value ${
      typeof tested === "string" ? `"${tested}"` : tested
    }`, () => {

      const result = validSkillName(tested);
      expect(result).to.false;
    });
  });
});
