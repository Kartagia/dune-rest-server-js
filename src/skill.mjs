/**
 * The module handling skills of the Dune.
 * @module skill
 */

import { checkObject } from "./validator.mjs";
import { getPropertyChecker, getPropertyDef, getPropertyTester } from "./validator.mjs";

/**
 * @template [TYPE=any]
 * @template [ERROR=any]
 * @typedef {import("./validator.mjs").PropertyDef<TYPE, ERROR>} TypeDef
 */

/**
 * Test validity of a name.
 * @template [TYPE=any]
 * @template [ERROR=any]
 * @param {*} value The tested value.
 * @param {(TypeDef<TYPE, ERROR>)[]} [requiredPropertyDefs=[]] The required property definitions.
 * @param {(TypeDef<TYPE|undefined, ERROR>)[]} [optionalPropertyDefs=[]] The optional property definitions.
 * @returns {boolean} True, if and only if the value is a valid name.
 */
export function validName(
  value,
  requiredPropertyDefs = [],
  optionalPropertyDefs = []
) {
  const nameProperty = "name";
  /**
   * The required property definition.
   * @type {TypeDef<TYPE, ERROR>|undefined}
   */
  const requiredDef = getPropertyDef(nameProperty, requiredPropertyDefs);
  if (requiredDef === undefined) {
    /**
     * The required property definition.
     * @type {TypeDef<TYPE|undefined, ERROR>|undefined}
     */
    const optionalDef = getPropertyDef(nameProperty, optionalPropertyDefs);
    return optionalDef !== null && getPropertyTester(optionalDef)(value);
  } else {
    return getPropertyTester(requiredDef)(value);
  }
}

/**
 * Check the validity of a name.
 * @param {*} value The tested valeu.
 * @property {TypeDef<string>} [requiredPropertyDefs=[]] The required property definitions.
 * @property {TypeDef<string|undefined>} [optionalPropertyDefs=[]] The optional property definitions.
 * @returns {string|undefined} The valid name. The return value may be undefined, if and only if the name
 * is an optional property.
 * @throws {TypeError} The value was not a string.
 * @throws {SyntaxError} The value was not a valid name.
 */
export function checkName(
  value,
  requiredPropertyDefs = [],
  optionalPropertyDefs = []
) {
  const nameProperty = "name";
  /**
   * The required property definition.
   * @type {TypeDef<TYPE, ERROR>|undefined}
   */
  const requiredDef = getPropertyDef(nameProperty, requiredPropertyDefs);
  if (requiredDef === undefined) {
    /**
     * The required property definition.
     * @type {TypeDef<TYPE|undefined, ERROR>|undefined}
     */
    const optionalDef = getPropertyDef(nameProperty, optionalPropertyDefs);
    return optionalDef !== null && getPropertyChecker(optionalDef)(value);
  } else {
    return getPropertyChecker(requiredDef)(value);
  }
}
/**
 * The value properties.
 * @typedef {Object} ValueProps
 * @property {number} [minValue=4] The smallest allowed value.
 * @property {number} [maxValue=8] The largest allwoed value.
 * @property {number} current The current value.
 */

/**
 * The properties of the skills.
 * @typedef {Object} SkillProps
 * @property {string} name The name of the skill.
 * @property {string} [id] The unique identifier of the skill.
 * @property {string} [description] The description of the skill.
 */

/**
 * @typedef {SkillProps} SkillSource The source for constructing a skill.
 */

/**
 * A skill with value. The identifier of the skill refers to the
 * skills.
 * @typedef {SkillProps & ValueProps} SkillValueProps
 */

/**
 * @typedef {SkillValueProps|({skill: Skill} & ValueProps)} SkillValueSource The source for constructing a skill.
 */

/**
 * A class representing a skill.
 * @extends {SkillProps}
 */
export class Skill {
  /**
   * The name of the skill.
   * @type {string}
   */
  #name;

  /**
   * The dscription of the skill.
   * @type {string|undefined}
   */
  #description;

  /**
   * The identifier of the skill.
   * @type {string|undefined}
   */
  #id;

  /**
   * The name of the skill.
   * @type {string}
   */
  get name() {
    return this.#name;
  }

  /**
   * The dscription of the skill.
   * @type {string|undefined}
   */
  get description() {
    return this.#description;
  }

  /**
   * The identifier of the skill.
   * @type {string|undefined}
   */
  get id() {
    return this.#id;
  }

  /**
   * Creates a new skill.
   * @param {SkillSource} source The source defining the created skill.
   */
  constructor(source) {
    if (!this.validSkill(source)) {
      throw new TypeError("Invalid new skill");
    }
    this.#name = this.checkName(source.name);
    this.#description = this.checkDescription(source.description);
    this.#id = this.checkId(source.id);
  }

  /**
   * The definitions of the required properties.
   * @returns {Readonly<PropertyDef[]>}
   */
  get requiredPropertyDefs() {
    return [
      ["name", (value) => typeof value === "string" && value.trim === value],
    ];
  }

  /**
   * The definitions of the optional properties.
   * @returns {Readonly<PropertyDef[]>}
   */
  get optionalPropertyDefs() {
    return [
      ["id", (value) => typeof value === "string" && value.trim === value],
      [
        "description",
        (value) => typeof value === "string" && value.trim === value.name,
      ],
    ];
  }

  /**
   * Test validity of a skill.
   * @param {SkillProps} source The tested ksill.
   * @returns {boolean} True, if and only if the given source is a valid skill.
   */
  validSkill(source) {
    checkObject(source, this.requiredPropertyDefs, this.optionalPropertyDefs);
  }
}

/**
 * A class representing a skill value.
 */
export class SkillValue {
  /**
   * The default maximum value.
   * @type {number}
   */
  static get defaultMaxValue() {
    return 8;
  }

  /**
   * The default minimum value.
   * @type {number}
   */
  static get defaultMinValue() {
    return 8;
  }

  /**
   * The skill whose value is acquired.
   */
  #skill = undefined;

  /**
   * The maximum value.
   * @type {number}
   */
  #maxValue;

  /**
   * The minimum value.
   * @type {number}
   */
  #minValue;

  /**
   * The current value.
   * @type {number}
   */
  #current;

  /**
   * The required proeprty definitions.
   * @type {Readonly<TypeDef<string, number|Skill>[]>}
   */
  get requiredPropertyDefs() {
    return [
      ["name", validName, checkName],
      ["current", this.validValue.bind(this), this.checkValue.bind(this)],
    ];
  }

  /**
   * The required proeprty definitions.
   * @type {Readonly<TypeDef<string, number|Skill>[]>}
   */
  get optionalPropertyDefs() {
    return [
      ["name", validName, checkName],
      ["current", this.validValue.bind(this), this.checkValue.bind(this)],
    ];
  }

  get requiredPropertyDefs() {
    return [
      ...(this.#skill?.requiredPropertyDefs ?? []),
      ["current", this.validValue.bind(this), this.checkValue.bind.this],
    ];
  }

  get optionalPropertyDefs() {
    return [
      ...(this.#skill?.optionalPropertyDefs ?? []),
      [
        "minValue",
        this.validMinValue.bind(this),
        this.checkMinValue.bind(this),
      ],
      [
        "minValue",
        this.validMaxValue.bind(this),
        this.checkMaxValue.bind(this),
      ],
    ];
  }

  /**
   * The default minimum value.
   * @type {number}
   */
  get defaultMinValue() {
    return SkillValue.defaultMinValue;
  }

  /**
   * The default maximum value.
   * @type {number}
   */
  get defaultMaxValue() {
    return SkillValue.defaultMaxValue;
  }

  /**
   *
   */
  validMinValue(value) {}

  /**
   * Test the validity of the largest allwoed value.
   * @param {*} value The checked value.
   * @returns {number} The valid new value.
   * @throws {TypeError} The value is not a safe integer.
   * @throws {RangeError} The value is too small or too large.
   */
  checkMaxValue(value = 8) {
    const def = getPropertyDef(
      "maxValue",
      this.requiredPropertyDefs(),
      this.optionalPropertyDefs()
    );
    if (def === undefined) {
      // The property has no definition - using hte default value.
      if (value === this.defaultMaxValue) {
        return this.defaultMaxValue;
      } else {
        throw new Error(`Invalid maximum value`);
      }
    } else {
      return def[2](value);
    }
  }

  /**
   * Check the validity of the smallest allwoed value.
   * @param {*} value The checked value.
   * @returns {number} The valid new value.
   * @throws {TypeError} The value is not a safe integer.
   * @throws {RangeError} The value is too small or too large.
   */
  checkMinValue(value = 4) {
    const def = getPropertyDef(
      "minValue",
      this.requiredPropertyDefs(),
      this.optionalPropertyDefs()
    );
    if (def === undefined) {
      // The property has no definition - using hte default value.
      if (value === this.defaultMinValue) {
        return this.defaultMinValue;
      } else {
        throw new Error(`Invalid minimum value`);
      }
    } else {
      return def[2](value);
    }
  }

  /**
   * The smallest allowed value.
   * @type {number}
   */
  get minValue() {
    return this.#minValue;
  }

  /**
   * The largest allowed value.
   * @type {number}
   */
  get maxValue() {
    return this.#maxValue;
  }

  /**
   * Check the validity of a value.
   * @param {*} value The checked value.
   * @returns {number} The valid new value.
   * @throws {TypeError} The value is not a safe itneger.
   * @throws {RangeError} The value is too small or too large.
   */
  checkValue(value) {
    if (!Number.isSafeInteger(value)) {
      throw new TypeError("The value must be a number");
    }
    if (value < this.minValue) {
      throw new RangeError("Too small value");
    }
    if (value > this.maxValue) {
      throw new RangeError("Too large value");
    }
    return value;
  }

  get current() {
    return this.#current;
  }

  /**
   * Set the current valeu.
   * @param {*} value the assgined value.
   * @throws {TypeError} The value was not a safe integer.
   * @throws {RangeError} The valeu was too large or too small.
   */
  set current(value) {
    this.#current = this.checkValue(value);
  }

  /**
   * Check validity of a ksill.
   * @param {SkillProps} source The tested ksill.
   * @returns {boolean} True, if and only if the given source is a valid skill.
   */
  validSkill(source) {
    return Skill.validSkill(source);
  }

  /**
   * Creates a new skill value.
   * @param {SkillValueSource} source The source deifning the created skill value.
   */
  constructor(source) {
    if ("skill" in source) {
      if (this.validSkill(source.skill)) {
        this.#skill = source.skill;
      } else {
        // Invalid skill.
        throw new TypeError("Invalid skill");
      }
    } else if (this.validSkill(source)) {
      // It is skill value.
      this.#skill = new Skill(source);
    } else {
      throw new TypeError("Invalid skill value");
    }
    // Setting the value.
    this.#minValue = this.checkMinValue(
      source.minValue ?? this.defaultMinValue
    );
    this.#maxValue = this.checkMaxValue(
      source.maxValue ?? this.defaultMaxValue
    );
    this.current = source.current ?? this.minValue;
  }
}
