/**
 * Validators of values.
 * @module validator
 */

/**
 * Checker of a value.
 * @template TYPE The type of the returned value.
 * @template [ERROR=any] The type of the error thorwn.
 * @callback Checker
 * @param {any} value The checked value.
 * @returns {TYPE} The given value converted to teh type.
 * @throws {ERROR} The check failed.
 */

/**
 * A predicate testing the validity of a value.
 * @template [TYPE=any] The type of the tested value.
 * @callback Predicate
 * @param {TYPE} value The tested value.
 * @returns {boolean} True, if and only if the value passes the predicate.
 */

/**
 * A predicate testing a value of iteration.
 * @template [TYPE=any] The type of the tested value.
 * @callback IteratorPredicate
 * @param {TYPE} value The tested value.
 * @param {number} [index] The index of the iteration.
 * @returns {boolean} True, if and only if the value passes the predicate.
 */

/**
 * A predicate testing a value of iteration.
 * @template [TYPE=any] The type of the tested value.
 * @callback IteratorPredicate
 * @param {TYPE} value The tested value.
 * @param {number} [index] The index of the iteration.
 * @param {TYPE[]} [array] The array of th eiteration.
 * @returns {boolean} True, if and only if the value passes the predicate.
 */

/**
 * The property definition as an array.
 * @template [TYPE=any]
 * @template [ERROR=any] The type of the error thorwn.
 * @typedef {[name: string, validator: Predicate<TYPE>, checker: Checker<TYPE,ERROR>]} PropertyArrayDef
 */

/**
 * The property definition as an object.
 * @template [TYPE=any]
 * @template [ERROR=any] The type of the error thorwn.
 * @typedef {Object} PropertyObjectDef
 * @property {string} propertyName The name of the property.
 * @property {Predicate<TYPE>} testValue Test the property value validity.
 * @property {boolean} [required=true] Is the property required.
 * @property {Checker<TYPE,ERROR>} checkValue Check the property value.
 * @property {(source: object) => boolean} supports Test, if the property has valid property value.
 */

/**
 * The definition of a type.
 * - If the checker is not implemente
 * @template [TYPE=any]
 * @template [ERROR=any] The type of the error thorwn.
 * @typedef {PropertyArrayDef<TYPE,ERROR>|PropertyObjectDef<TYPE,ERROR>} PropertyDef
 */

/**
 * Get property definition.
 * @template TYPE The type of the property value.
 * @template [ERROR=any] The error thrown on failed check.
 * @param {string} propertyName The property name.
 * @param {*} propertyDefs The property definitions.
 * @returns {PropertyDef<TYPE, ERROR>|PropertyDef<TYPE|undefined, ERROR>|undefined}
 */
export function getPropertyDef(propertyName, propertyDefs = []) {
  let def = /** @type {PropertyDef<TYPE, ERROR>|undefined} */ propertyDefs.find(
    ([name]) => name === propertyName
  );
  return def;
}

/**
 * A class representing a property definition.
 * @template TYPE The value type.
 * @template [ERROR=any] The error type on failed validation.
 * @extends {PropertyObjectDef<TYPE, ERROR>}
 */
export default class PropertyDefinition {


  /**
   * Generate a required property definition from tester and error genrator.
   * @param {string} propertyName The property name.
   * @param {Predicate<TYPE>} tester The tester function.
   * @param {(value: any) => ERROR} errorGenerator The error generator for an invalid value.
   * @param {(value: any) => TYPE} [converter] The function converting the value to type.
   * Defaults to type cast.
   */
  static required(propertyName, tester, errorGenerator, converter=undefined) {
    return new PropertyDefinition(
      propertyName,
      (value) => {
        if (tester(value)) {
          return /** @type {TYPE} */ (converter ? converter(value) : value);
        } else {
          throw errorGenerator(value);
        }
      },
      tester,
      true
    )
  }


  /**
   * Generate a required property definition from tester and error genrator.
   * @param {string} propertyName The property name.
   * @param {Predicate<TYPE>} tester The tester function.
   * @param {(value: any) => ERROR} errorGenerator The error generator for an invalid value.
   * @param {(value: any) => TYPE} [converter] The function converting the value to type.
   * Defaults to type cast.
   */
  static optional(propertyName, tester, errorGenerator, converter=undefined) {
    return new PropertyDefinition(
      propertyName,
      (value) => {
        if (tester(value)) {
          return /** @type {TYPE} */ (converter ? converter(value) : value);
        } else if (value === undefined) {
          // Optional value. 
          return undefined;
        } else {
          // Throw error.
          throw errorGenerator(value);
        }
      },
      tester,
      false
    )
  }


  /**
   * The name of the property.
   * @type {string}
   */
  #name;

  /**
   * The checker of the vlaid value.
   * @type {Checker<TYPE, ERROR>}
   */
  #checker;

  /**
   * Test the validity of the value.
   * @type {Predicate<TYPE>}
   */
  #tester;

  /**
   * Is the property required.
   * @type {boolean}
   */
  #required;

  /**
   * Create a new property definition.
   * @param {string} propertyName The name of the proeprty.
   * @param {Checker<TYPE, ERROR>} checker THe checker function.
   * @param {Predicate<TYPE>} [tester] The tester of the value validity.
   * @param {boolean} [equired=true] Is the property required.
   */
  constructor(propertyName, checker, tester = undefined, required = true) {
    this.#name = propertyName;
    this.#required = required;
    this.#checker = checker;
    this.#tester =
      tester ??
      ((value) => {
        try {
          this.check(value);
          return true;
        } catch (err) {
          return false;
        }
      });
  }

  /**
   * The property name.
   */
  get propertyName() {
    return this.#name;
  }

  /**
   * Is the property required.
   * @type {boolean}
   */
  get required() {
    return this.#required;
  }

  /**
   * Test validity of the value.
   * @param {*} value The tested value.
   * @returns {boolean} True, if and only if the value is valid property value.
   */
  testValue(value) {
    return this.#tester(value);
  }

  /**
   * Check validity fo the value.
   * @param {*} value The tested value.
   * @returns {TYPE|(TYPE|undefined)} The checked value.
   * @throws {ERROR} The check failed.
   */
  checkValue(value) {
    return this.#checker(value);
  }

  /**
   * Does the source support the property.
   * @param {*} source The tested source.
   * @returns {boolean} Returns true, if and only if the source
   * has the property, or the source lacks an optional property.
   */
  supports(source) {
    if (typeof source === "object") {
      // We do have an object.
      if (this.propertyName in source) {
        return this.testValue(source[this.propertyName]);
      } else {
        return !this.required;
      }
    } else {
      // Invalid source.
      return false;
    }
  }

  /**
   * Get the value of property.
   * @param {object} source The source value.
   * @returns {TYPE|undefined} The value of property in source.
   * @throws {TypeError} The source did not have the property.
   */
  getValue(source) {
    if (typeof source === "object") {
      // We do have an object.
      if (this.propertyName in source) {
        return this.checkValue(source[this.propertyName]);
      } else {
        return !this.required;
      }
    } else {
      // Invalid source.
      return undefined;
    }
  }

  /**
   * Set the value of a property.
   * @param {*} target The target of the property assignment.
   * @param {TYPE|undefined} value The new value.
   * @throws {TypeError} The target does not support the property.
   * @throws {ERROR} The value was invalid property value. 
   */
  setValue(target, value) {
    if (typeof target === "object" && target !== null) {
      // We do have an object.
      target[this.propertyName] = this.checkValue(value);
    } else {
      // Invalid source.
      throw new TypeError("Cannot set properties of basic types");
    }
  }


  /**
   * Convert the property definition into array form.
   * @returns {PropertyArrayDef<TYPE, ERROR>}
   */
  toArray() {
    return [this.propertyName, this.testValue, this.checkValue];
  }
}

/**
 * Get the property value checking function.
 * @template [TYPE=any] The type of the property value.
 * @template [ERROR=any] The error thrown in case of invalid value.
 * @param {PropertyDef<TYPE,ERROR>} propetyDefinition
 * @returns {import("./validator.mjs").Predicate<TYPE>|import("./validator.mjs").Predicate<TYPE|undefined>}
 */
export function getPropertyTester(propertyDefinition) {
  if (propertyDefinition) {
    return Array.isArray(propertyDefinition)
      ? propertyDefinition[1]
      : propertyDefinition.validValue;
  } else {
    return undefined;
  }
}/**
 * Get the property value checking function.
 * @template [TYPE=any] The type of the property value.
 * @template [ERROR=any] The error thrown in case of invalid value.
 * @param {PropertyDef<TYPE,ERROR>} propetyDefinition
 * @returns {import("./validator.mjs").Checker<TYPE, ERROR>|import("./validator.mjs").Checker<TYPE|undefined, ERROR>}
 */
export function getPropertyChecker(propertyDefinition) {
  if (propertyDefinition) {
    return Array.isArray(propertyDefinition)
      ? propertyDefinition[2]
      : propertyDefinition.checkValue;
  } else {
    return undefined;
  }
}
/**
 * Test validity of an object.
 * @param {object} source The tested value.
 * @param {PropertyDef<any>[]} [requiredPropertyDefs] The required property definitions.
 * @param {PropertyDef<any|undefined>[]} [optionalPropertyDefs] The optional property definitions.
 * @returns
 */
export function validObject(
  source,
  requiredPropertyDefs = [],
  optionalPropertyDefs = []
) {
  if (typeof source !== "object" || source === null) {
    return false;
  }
  return (
    requiredPropertyDefs.every(([prop, propTest]) => {
      return prop in source && propTest(source[prop]);
    }) &&
    optionalPropertyDefs.every(([prop, propTest]) => {
      return !(prop in source) || propTest(source[prop]);
    })
  );
}
/**
 * Test validity of a property of an object.
 * @param {any} source The tested property value.
 * @param {string} propertyName The tested property name.
 * @param {PropertyDef<any>[]} [requiredPropertyDefs] The required property definitions.
 * @param {PropertyDef<any|optional>[]} [optionalPropertyDefs] The optional property definitions.
 * @returns {boolean} True, if and only if the property  value is valid.
 */
export function validProperty(
  source,
  propertyName,
  requiredPropertyDefs = [],
  optionalPropertyDefs = []
) {
  let def = requiredPropertyDefs.find(([name]) => propertyName === name);
  if (def === undefined) {
    // Optional property definition.
    def = optionalPropertyDefs.find(([name]) => propertyName === name);
    return def !== null && (!(propertyName in source) || def[1](source));
  } else {
    // Required property definition.
    return def !== null && propertyName in source && def[1](source);
  }
}
/**
 * Check validity of an object.
 * @template TYPE The type of the checked value.
 * @template [ERROR=any] The error thrown in case of invalid value.
 * @param {any} source The tested value.
 * @param {(value, error=undefined) => ERROR} defaultError The function generating default
 * error from value and possible error thrown by property checkers.
 * @param {PropertyDef<any>[]} [requiredPropertyDefs] The required property definitions.
 * @param {PropertyDef<any>[]} [optionalPropertyDefs] The optional property definitions.
 * @returns {TYPE} The return type.
 */
export function checkObject(
  source,
  defaultError,
  requiredPropertyDefs = [],
  optionalPropertyDefs = []
) {
  if (validObject(source, requiredPropertyDefs, optionalPropertyDefs)) {
    // The value is valid.
    return /** @type {TYPE} */ source;
  }
  try {
    requiredPropertyDefs.forEach(([prop, propTest, checker]) => {
      if (prop in source) {
        if (checker) {
          // Some of these checks throws error.
          try {
            checker(source[prop]);
          } catch (err) {
            throw new Error(`Invalid property ${prop}`, { cause: err });
          }
        } else if (propTest(source[prop])) {
          throw new Error(`Invalid property ${prop}`);
        }
      } else {
        throw new Error(`The required property ${prop} missing`);
      }
    });
  } catch (error) {
    throw defaultError(source, error);
  }
}

