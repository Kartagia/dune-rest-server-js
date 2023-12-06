/**
 * @module tools/promises
 * A module containing various tools with promise results.
 */

/**
 * @typedef {Object} ValidationErrorOptions 
 * @property {string} [propertyName] The invalid property name. 
 */

export class ValidationError extends Error {

  /**
   * The option values.
   */
  #options = {

  };

  /**
   * Create a new validation error.
   * @param {string} message The error message. 
   * @param {ValidationErrorOptions} [options] The error options.
   */
  constructor(message, options={}) {
    super(message);
    this.name = this.constructor.name;
    this.intoOptions(options);
  }

  /**
   * Initialize from options.
   * @protected
   * @param {ValidationErrorOptions} options 
   */
  initOptions(options) {
    this.#options = {...options};
  }

  /**
   * The options of the validation error options.
   * @type {ValidationErrorOptions} The options of the error.
   */
  get options() {
    return {...(this.#options)};
  }

  /**
   * Does the error have an option.
   * @param {string} optionName The option name.
   * @returns {boolean} True, if and only if the error has the option.
   */
  hasOption(optionName) {
    return typeof optionName === "string" && optionName in this.#options;
  }

  /**
   * Get the option value.
   * @param {string} optionName The option name. 
   * @returns The option value.
   */
  getOption(optionName) {
    return this.hasOption(optionName) && (this.options[optionName]);
  }
}

/**
 * Getter of a value.
 * @template TYPE - The result type.
 * @callback Getter
 * @returns {Promise<TYPE>} The promise of the value.
 */

/**
 * Create a getter returning fixed value.
 * @template TYPE - The result type.
 * @param {TYPE} value The returned value.
 * @returns {Getter<TYPE>} The getter always returning given value.
 */
export function singleValueGetter(value) {
  return Promise.resolve(value);
}

/**
 * Create a getter returning the property value.
 * @template TYPE - The result type.
 * @param {Object} source The object, whose property is returned.
 * @param {string} propertyName The name of the property.
 * @returns {Getter<TYPE>} The getter always returning given value.
 * @throws {RangeError} The property name was not a string.
 * @throws {TypeError} The source was not an object.
 */
export function propertyGetter(source, propertyName) {
  if (source instanceof Object) {
    if (typeof propertyName === "string") {
      // Creating a getter.
      return () => {
        return new Promise((resolve, reject) => {
          try {
            resolve(source[propertyName]);
          } catch (error) {
            reject(error instanceof Error ? error : Error(error));
          }
        });
      };
    } else {
      throw new RangeError("Invalid property name");
    }
  } else {
    throw new TypeError("Invalid source object");
  }
}

/**
 * Setter of a value.
 * @template TYPE - The value type.
 * @callback Setter
 * @param {TYPE} value The new value.
 * @returns {Promise<never>} The promise of the completion.
 * - Rejects with Error, if the setting of the value was not
 *   possible.
 */

/**
 * Create an object property setter.
 * @template [TARGET=Object] - The target object.
 * @template [TYPE=any] - The type of the set value.
 * @param {TARGET} target The modified target.
 * @param {string} propertyName The property name.
 * @param {Predicate<TYPE>} [validator] The optional validator of the value.
 * Default validator accepts all values.
 * @returns {Setter<TYPE>} The setter of the property.
 * @throws {RangeError} The property name was not a string.
 * @throws {TypeError} The source was not an object.
 */
export const propertySetter = (
  target,
  propertyName,
  validator = () => true
) => {
  if (target instanceof Object) {
    if (typeof propertyName === "string") {
      // Creating a getter.
      return (value) => {
        return new Promise((resolve, reject) => {
          try {
            if (validator == null || validator(value)) {
              target[propertyName] = value;
              resolve();
            } else {
              // Throwing an exception to indicate an invalid value.
              throw ValidationError(`Invalid value`);
            }
          } catch (error) {
            reject(error instanceof Error ? error : Error(error));
          }
        });
      };
    } else {
      throw new RangeError("Invalid property name");
    }
  } else {
    throw new TypeError("Invalid target object");
  }
};
