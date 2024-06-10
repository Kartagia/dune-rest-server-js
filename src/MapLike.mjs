/**
 * @module MapLike
 *
 * The library implementing MapLike interface.
 */

import { assert } from "chai";

/**
 * The log level of the module.
 */
let logLevel = undefined;

/**
 * @typedef {"debug"|"warn"|"info"|"error"|undefined} LOG_LEVEL;
 */

/**
 * Does the current log level include the given log level.
 * @param {LOG_LEVEL} level The tested level.
 * @returns {boolean} True, if and only if the current log level
 * means given log level is triggered.
 */
function isLogLevel(level) {
  switch (level) {
    case "debug":
      if (logLevel === "debug") return true;
    case "warn":
      if (logLevel === "warn") return true;
    case "info":
      if (logLevel === "info") return true;
    case "error":
      if (logLevel === "error") return true;
    case undefined:
      return false;
    default:
      // Unknown log level is never matched.
      return false;
  }
}

/**
 * A basic logger interface.
 * @typedef {Object} Logger
 * @property {(message: string) => undefined} log Logs the message.
 * @property {(message: string) => undefined} error Logs an error message.
 * @property {(message: string) => undefined} debug Logs a debug message.
 */

/**
 * The registered loggers used for the module logging.
 * @type {Logger[]}
 */
var loggers = [];

/**
 * Registers a logger into leggers.
 * @param {Logger} logger The used logger.
 * @returns {() => void} The function unregistering the logger.
 */
export function registerLogger(logger) {
  if (
    logger instanceof Object &&
    ["log", "error", "debug"].every(
      (method) =>
        method in logger &&
        logger[method] instanceof Function &&
        logger[method].length === 1
    )
  ) {
    loggers.push(logger);
    return () => {
      unregisterLogger(logger);
    };
  } else {
    throw new TypeError("Invalid logger");
  }
}

/**
 * Removes the most recent registration of the logger.
 * @param {Logger} logger The removed logger.
 */
function unregisterLogger(logger) {
  let index = loggers.indexOf(logger, 0);
  if (index >= 0) {
    let nextIndex = loggers.indexOf(logger, index);
    while (nextIndex >= 0) {
      index = nextIndex;
      nextIndex = loggers.indexOf(logger, index);
    }
  }
  if (index >= 0) {
    loggers.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Get the current log level.
 * @returns {LOG_LEVEL} The current log level.
 */
export function getLogLevel() {
    return logLevel;
}

/**
 * Set the current log level.
 * @param {LOG_LEVEL} newLevel
 */
export function setLogLevel(newLevel) {
  logLevel = newLevel;
}

export function log(message, level = "info") {
  if (loggers.length && isLogLevel(level)) {
    loggers.forEach((log) => {
      log.log(message);
    });
  }
}

export function error(message, level = "error") {
  if (loggers.length && isLogLevel(level)) {
    loggers.forEach((log) => {
      log.error(message);
    });
  }
}

export function debug(message, level = "debug") {
  if (loggers.length && isLogLevel(level)) {
    loggers.forEach((log) => {
      log.debug(message);
    });
  }
}

/**
 * The equality test.
 * @template VALUE
 * @callback Equality
 * @param {VALUE} tested The tested value.
 * @param {VALUE} testee The value tested with.
 * @returns {boolean} True, if and only if the tested and testee are equals.
 */

/**
 * The predicate testing a value.
 * @template VALUE
 * @callback Predicate
 * @param {VALUE} tested The tested value.
 * @returns {boolean} True, if an donly if the value passes the predicate.
 */

/**
 * The supplier of the values.
 * @template VALUE The type of the suppleid value.
 * @callback Supplier
 * @returns {VALUE} The supplied value.
 */

/**
 * Getter of a value.
 * @template KEY
 * @template VALUE
 * @callback Getter
 * @param {KEY} key The key, whose value is queried.
 * @returns {VALUE} The value attached to the key.
 * @throws {RangeError} The key was invalid, and the getter does
 * not have value represeting an invalid value.
 */

/**
 * Getter of a value.
 * @template KEY The type of the key.
 * @template VALUE The value type of the set value.
 * @template [RETURNS=undefined] The return value type.
 * @callback Setter
 * @param {KEY} key The key, whose value is queried.
 * @param {VALUE} value The new value associate dto the key.
 * @throws {RangeError} The key was invalid.
 * @throws {TypeError} The value was invalid.
 * @returns {RETURNS} The return value.
 */

/**
 * The properties specific to the read only map-likes.
 * @template KEY The type of the key.
 * @template VALUE THe type of the value.
 * @typedef {Object} ReadOnlyMapLikeProps
 * @property {Predicate<KEY>} has Does the maplike have key.
 * @property {Getter<KEY,VALUE|undefined>} get Get the value of key.
 * @property {number} size The number of elements in teh map-like
 * @property {Supplier<[KEY,VALUE][]>} entries The entries of the map.
 * @property {Supplier<KEY[]>} keys The keys of the map.
 * @property {Supplier<VALUE[]>} values The values of the map.
 */

/**
 * The read-only MapLike
 * @template KEY The type of the key.
 * @template VALUE THe type of the value.
 * @typedef {ReadOnlyMapLikeProps<KEY,VALUE> & {[Symbol.iterator]:Iterable<[KEY,VALUE]>} } ReadOnlyMapLike
 */

/**
 * The remover of an entry with a key.
 * @typedef KEY The type of the key.
 * @callback Remover
 * @param {KEY} key The key of the removed entry.
 * @returns {boolean} True, iff the removal altered the structure.
 */

/**
 * Removes all entries of the object.
 * @callback Clearer
 */

/**
 * The properties specific to the mutable map-likes.
 * @template KEY The type of the key.
 * @template VALUE THe type of the value.
 * @typedef {Object} MutableMapLikeProps
 * @property {Setter<KEY,VALUE, MapLike<KEY,VALUE>>} set Set the value of a key.
 * @property {Getter<KEY,VALUE|undefined>} get Get the value of key.
 * @property {Remover<KEY>} delete Removes the entry with a key.
 * @property {Clearer} clear Remvoes all entreis of the map.
 */

/**
 * The changeable MapLike
 * @template KEY The type of the key.
 * @template VALUE THe type of the value.
 * @typedef {ReadOnlyMapLikeProps<KEY,VALUE> & MutableMapLikeProps<KEY,VALUE> & {[Symbol.iterator]:Iterable<[KEY,VALUE]>} } MutableMapLike
 */

/**
 * The map-like interface.
 * @template KEY The type of the key.
 * @template VALUE THe type of the value.
 * @typedef {ReadOnlyMapLike<KEY,VALUE>|MutableMapLike<KEY,VALUE>} MapLike
 */

/**
 * The options of the map-likes.
 * @template KEY The type of the key.
 * @template VALUE THe type of the value.
 * @typedef {Object} MapLikeOptions
 * @property {Predicate<KEY>} [validKey] The validator of the keys. Defaults to accepting
 * all values.
 * @property {Predicate<VALUE>} [validValue] The validator of the values. Defaults to accepting
 * all keys.
 * @property {Predicate<[KEY,VALUE]>} [validEntry] The validator of the entries. Defaults to
 * accepting all key-value-pairs.
 * @property {Equality<KEY>} [equalKey] The equality function of the values.
 * @property {[KEY,VALUE][]} [entries=[]] The current entries of the map.
 * @property {boolean} [refuseDuplicates=false] Does the map-like refuse duplicates instead
 * of replacing the old entry with new one.
 * @property {boolean} [replaceToEnd=false] Does the replacement of the entry value remove
 * the old entry and add to the end of hte entries.
 * @property {boolean} [createNewResult=false] Does the operation create a new array of entries
 * when entries are altered.
 * @default BasicMutableMapLike.SameValueZero The same value zero equality the
 * ECMAScript Map uses.
 */

/**
 * Alter the target array by removing the value at the index, and appending
 * the new entry to th eend.
 * @template TYPE
 * @param {TYPE[]} target The target array.
 * @param {number} index The altered index.
 * @param {TYPE} newValue The new valeu.
 * @returns {TYPE[]} The target with value at index removed, and new value added to the end.
 */
export function deleteAndPush(target, index, newValue) {
  console.log(`Removing ${index} and pushing new value`);
  target.splice(index, 1);
  target.push(newValue);
  return target;
}

/**
 * Create a new array with the value at index filtered out, and the new value
 * added to the end.
 * @template TYPE
 * @param {TYPE[]} source The source array.
 * @param {number} index The altered index.
 * @param {TYPE} newValue The new valeu.
 * @returns {TYPE[]} A new array derive dfrom tearget by removing the value at index, and
 * appending new value to the end.
 */
export function filterAndAppend(source, index, newValue) {
  console.log(
    `Create new array with removing ${index} and appending new value`
  );
  return [...source.filter((_, i) => i !== index), newValue];
}

/**
 * Alter the target array by rreplacing the replacmeent with new value.
 * @template TYPE
 * @param {TYPE[]} target The target array.
 * @param {number} index The altered index.
 * @param {TYPE} newValue The new valeu.
 * @returns {TYPE[]} The target with value at index replaced iwth new value.
 */
export function replace(target, index, newValue) {
  console.log(`Replace ${index} with new value`);
  target.splice(index, 1, newValue);
  return target;
}

/**
 * Create a new array without the value at the index, and new value in the end.
 * @template TYPE
 * @param {TYPE[]} source The target array.
 * @param {number} index The altered index.
 * @param {TYPE} newValue The new valeu.
 * @returns {TYPE[]} A new array derived from target by replacing value at index with new value.
 */
export function replaceCreateNew(source, index, newValue) {
  console.log(`Create a new array replacing ${index} with new value`);
  return [...source.slice(0, index), newValue, ...source.slice(index + 1)];
}

/**
 * Alter the target array by adding the new value to the end.
 * @template TYPE
 * @param {TYPE[]} target The target array.
 * @param {number} index The altered index.
 * @param {TYPE} newValue The new valeu.
 * @returns {TYPE[]} The target with new value added to the end.
 */
export function push(target, newValue) {
  console.log(`Pushing new value`);
  const size = target.length;
  const newSize = target.push(newValue);
  assert(size + 1 === newSize, `The value was not added!`);
  return target;
}

/**
 * Create a new array with the entries of the source followed by the new value.
 * @template TYPE
 * @param {TYPE[]} source The target array.
 * @param {number} index The altered index.
 * @param {TYPE} newValue The new valeu.
 * @returns {TYPE[]} A new array with values of the source followed by the new value.
 */
export function append(source, newValue) {
  console.debug(`Appending new value`);
  return [...source, newValue];
}

/**
 * Remove the target entry at the index.
 * @param {TYPE[]} target
 * @param {number} index The index of the removed value.
 * @returns {TYPE[]} The target array after modifications.
 */
export function remove(target, index) {
  if (index >= 0 && index < target.length) {
    target.splice(index, 1);
  }
  return target;
}

/**
 * Create a new array with value at the index removed.
 * @param {TYPE[]} source
 * @param {number} index The index of the removed value.
 * @returns {TYPE[]} The created array without the filtered value.
 */
export function filter(source, index) {
  return source.filter((_, i) => i === index);
}

/**
 * Convert a value into a human readable string without containing any
 * sensible information such function code. Symbols are referred by their
 * registered names, and functions by the function name. Object is represented
 * by their prototype name or "POJO" for plain old JavaScript objects.
 * @param {*} element The stringified element.
 * @returns {string} The string representation of the element.
 */
export function elementToString(element) {
  switch (typeof element) {
    case "string":
      return `"${element}"`;
    case "undefined":
      return `undefined`;
    case "symbol":
      return `Symbol ${Symbol.keyFor(element)}`;
    case "function":
      return `Function ${element.name}`;
    case "object":
      if (element === null) {
        return "null";
      } else if (Array.isArray(element)) {
        return `[${element.map(elementToString).join(",")}]`;
      } else {
        return `Object of ${Object.getPrototypeOf(element) ?? "POJO"}`;
      }
    default:
      return String(element);
  }
}

/**
 * Check map entries.
 * @template KEY The type of the key.
 * @template VALUE THe type of the value.
 * @param {Iterable<[KEY,VALUE>]} [iterable] The checked iterable of the checked map
 * entries. Defaults to an empty iterator.
 * @param {MapLikeOptions<KEY,VALUE>} [options] THe options of the map-like.
 * @returns {[KEY,VALUE][]} The list of valid entries generated from the iterator.
 * @throws {SyntaxError} The iterable was not iterable, or any entry was not a valid
 * KEY-VALUE-tuple.
 * @throws {RangeError} Any key was invalid.
 * @throws {TypeError} Any itearble value was invalid.
 */
export function checkMapEntries(
  iterable = /** @type {[KEY,VALUE]} */ [],
  options = {}
) {
  /** @type {Iterator<any>} */
  /**
   * @type {Iterator<[KEY,VALUE]>}
   */
  const iterator = iterable[Symbol.iterator]();
  let cursor = iterator.next();
  if (
    !(
      ("done" in cursor && typeof cursor.done === "boolean") ||
      "value" in cursor
    )
  ) {
    error("Iterable was not iterable");
    throw new SyntaxError("Iterable not iterable!");
  }
  /** @type {[KEY,VALUE][]} */
  let result =
    "entries" in options
      ? options.createNewResult
        ? [...options.entries]
        : options.entries
      : /** @type {[KEY,VALUE][]} */ [];
  const equalKey = options.equalKey ?? SameValueZeroEquality;
  const validKey = options.validKey ?? ((/** @type {KEY} */ _key) => true);
  const validValue =
    options.validValue ?? ((/** @type {VALUE} */ _value) => true);
  const validEntry =
    options.validEntry ??
    (([/** @type {KEY} */ key, /** @type {VALUE} */ value]) =>
      validKey(key) && validValue(value));

  debug("Iterating the values.");
  let index = 0;
  while (cursor && !cursor.done) {
    debug(`Entry #${index} exists`);
    if (
      !Array.isArray(cursor.value) ||
      cursor.value.length !== 2 ||
      !validEntry(cursor.value)
    ) {
      throw new SyntaxError("Invalid entry.");
    }
    const [addedKey, addedValue] = cursor.value;
    debug(`Entry #${index} is two value tuple`);
    if (!validKey(addedKey)) {
      throw new RangeError("Invalid key of map");
    }
    debug(`Entry #${index} has valid key ${String(addedKey)}`);
    if (!validValue(addedValue)) {
      throw new TypeError("Invalid value of map");
    }
    debug(`Entry #${index} has valid value ${String(addedValue)}`);
    const indexOf = result.findIndex(([entryKey, _entryValue]) =>
      equalKey(entryKey, addedKey)
    );
    if (indexOf >= 0) {
      // Duplicate.
      debug(`Entry #${indexOf} has existing key`);
      if (options.refuseDuplicates ?? false) {
        throw new RangeError("Duplicate keys not allwoed");
      } else if (options.createNewResult) {
        if (options.replaceToEnd) {
          result = filterAndAppend(result, indexOf, [addedKey, addedValue]);
        } else {
          result = replaceCreateNew(result, indexOf, [addedKey, addedValue]);
        }
      } else if (options.replaceToEnd) {
        result = deleteAndPush(result, indexOf, [addedKey, addedValue]);
      } else {
        // Changing the result.
        result = replace(result, indexOf, [addedKey, addedValue]);
      }
    } else {
      // No duplicate.
      if (options.createNewResult) {
        result = append(result, [cursor.value[0], cursor.value[1]]);
      } else {
        result = push(result, [cursor.value[0], cursor.value[1]]);
      }
    }

    // Moving to next element.
    if (result) {
      debug(`Current result: ${elementToString(result)}`);
    } else {
      debug(`Result does not exist!`);
    }
    cursor = iterator.next();
    debug(`Acquired ${cursor.done ? "non-existing" : "existing"} next value`);
    index++;
    debug(`Index incremented to ${index}`);
  }

  // Return the reuslt.
  return result;
}

/**
 * The Same Value Zero equlaity of the ECMA Script standard.
 * @template TYPE
 * @type {Equality<TYPE>}
 */
export function SameValueZeroEquality(
  /** @type {TYPE} */ tested,
  /** @type {TYPE} */ testee
) {
  return (
    tested === testee ||
    (typeof testee == typeof tested &&
      typeof testee === "number" &&
      testee !== testee &&
      tested !== tested)
  );
}

/**
 * The Same Value equality of the ECMA Script. This is equal to Object.is.
 * @template TYPE The tested types.
 * @type {Equality<TYPE>}
 */
export function SameValueEquality(
  /** @type {TYPE} */ tested,
  /** @type {TYPE} */ testee
) {
  return Object.is(tested, testee);
}

/**
 * The strict equality.
 * @template TYPE The tested type.
 * @type {Equality<TYPE>}
 */
export function StrictEquality(
  /** @type {TYPE} */ tested,
  /** @type {TYPE} */ testee
) {
  return tested === testee;
}

/**
 * The loose equality.
 * @template TYPE The tested type.
 * @type {Equality<TYPE>}
 */
export function LooseEquality(
  /** @type {TYPE} */ tested,
  /** @type {TYPE} */ testee
) {
  return tested == testee;
}

/**
 * Get the options of a read only map-like object.
 * @template KEY The key type of the target.
 * @template VALUE The value type of the target.
 * @param {ReadOnlyMapLike<KEY,VALUE>} source The source ffrom which the options are read.
 * @returns {MapLikeOptions<KEY,VALUE>} The initialization options of the read only map-like.
 */
function getReadOnlyOptions(source) {
  return [
    "equalKey",
    "validValue",
    "validKey",
    "refuseDuplicates",
    "createNewResult",
    "replaceToEnd",
  ].reduce((result, prop) => {
    result[prop] = source[prop];
    return result;
  }, {});
}

/**
 * Set the read only maplike properties from the options.
 * @template KEY The key type of the target.
 * @template VALUE The value type of the target.
 * @param {ReadOnlyMapLike<KEY,VALUE>} target The altereted read only maplike, whose
 * options state is initialized.
 * @param {MapLikeOptions<KEY,vALUE>} options The new options.
 */
function setReadOnlyOptions(target, options = {}) {
  [
    "equalKey",
    "validValue",
    "validKey",
    "refuseDuplicates",
    "createNewResult",
    "replaceToEnd",
  ].forEach((prop) => {
    /**
     * @inheritdoc
     */
    target[prop] = options[prop];
  });
}

/**
 * The basic implemetnation of a read only map-like.
 * @template KEY The type of the key.
 * @template VALUE THe type of the value.
 * @extends {ReadOnlyMapLike<KEY,VALUE>}
 */
export class BasicReadOnlyMapLike {
  /**
   * Check map entries.
   * @template KEY The type of the key.
   * @template VALUE THe type of the value.
   * @param {Iterable<[KEY,VALUE>]} [iterable] The checked iterable of the checked map
   * entries. Defaults to an empty iterator.
   * @param {Omit<MapLikeOptions<KEY,VALUE>, "entries">} [options] The options of the map-like.
   * @returns {[KEY,VALUE][]} The list of valid entries generated from the iterator.
   * @throws {SyntaxError} Any entry was invalid.
   * @throws {RangeError} Any key was invalid.
   * @throws {TypeError} Any value was invalid.
   */
  checkMapEntries(iterable = undefined, options = {}) {
    return checkMapEntries(iterable, options);
  }

  /**
   * The same value zero equality.
   * @template TYPE The tested type.
   * @type {Equality<TYPE>}
   */
  static SameValueZero = SameValueZeroEquality;

  /**
   * The same value equality.
   * @template TYPE The tested type.
   * @type {Equality<TYPE>}
   */
  static SameValueZero = SameValueZeroEquality;

  /**
   * The strict equality.
   * @template TYPE The tested type.
   * @type {Equality<TYPE>}
   */
  static StrictEquals = StrictEquality;

  /**
   * The loose equality.
   * @template TYPE The tested type.
   * @type {Equality<TYPE>}
   */
  static LooseEquals = LooseEquality;

  /**
   * The default key equality function.
   * @type {Equality<KEY>}
   */
  static get defaultKeyEquality() {
    return (this ?? BasicReadOnlyMapLike).SameValueZero;
  }

  /**
   * The entries of the map-like.
   * @type {[KEY,VALUE][]}
   */
  #entries = [];

  /**
   * Create a new mutable MapLike.
   * @param {Iterable<[KEY,VALUE]>} [iterable] The initial entries of the map-like.
   * @param {MapLikeOptions<KEY,VALUE>} [options] The options of the map-like.
   */
  constructor(iterable = undefined, options = {}) {
    this.options = options;
    if (iterable) {
      this.#entries = this.checkMapEntries(iterable, options);
    }
  }

  /**
   * The options of the map-like.
   * @type {MapLikeOptions<KEY,VALUE>}
   */
  get options() {
    return getReadOnlyOptions(this);
    return {
      equalKey: this.equalKey,
      validValue: this.validValue,
      validKey: this.validKey,
      validEntry: this.validEntry,
      refuseDuplicates: this.refuseDuplicates,
      createNewResult: this.createNewResult,
      replaceToEnd: this.replaceToEnd,
    };
  }

  /**
   * @param {MapLikeOptions<KEY,VALUE>}
   */
  set options(options) {
    /**
     * @todo Add error, if called after initialization
     */
    setReadOnlyOptions(this, options);
    return;
    this.equalKey = options.equalKey ?? this.defaultKeyEquality;
    this.validEntry = options.validEntry;
    this.validKey = options.validKey;
    this.validValue = options.validValue;
    this.refuseDuplicates = options.refuseDuplicates;
    this.createNewResult = options.createNewResult;
    this.replaceToEnd = options.replaceToEnd;
  }

  /**
   * Does the map have key.
   * @param {KEY} key The tested key.
   * @returns {boolean} True, if and only if the map has entry with key.
   */
  has(key) {
    return (
      this.#entries.findIndex(([entryKey]) => this.equalKey(key, entryKey)) >= 0
    );
  }

  /**
   * @inheritdoc
   */
  get(key) {
    const result = this.#entries.find(([entryKey]) =>
      this.equalKey(key, entryKey)
    );
    return result ? result[1] : undefined;
  }

  get size() {
    return this.#entries.length;
  }

  values() {
    return this.#entries.map(([_, value]) => value);
  }

  keys() {
    return this.#entries.map(([key]) => key);
  }

  entries() {
    return this.#entries.map(([key, value]) => [key, value]);
  }

  [Symbol.iterator]() {
    return this.#entries[Symbol.iterator]();
  }

  /**
   * Perform a consumer function for every entry.
   * @param {(entry: [KEY,VALUE], index?: number)} consumerFn The function
   * called for each entry.
   */
  forEach(consumerFn) {
    this.entries().forEach(consumerFn);
  }
}

function getAlteringOptions(source) {
  return [].reduce((result, prop) => {
    result[prop] = source[prop];
    return result;
  }, {});
}

/**
 * Initialize the current map-like with altering MapLikeOptions.
 * @param {MutableMapLike<KEY, VALUE>} target
 * @param {MapLikeOptions<KEY,VALUE>} [options]
 */
function setAlteringOptions(target, options = {}) {}

/**
 * The basic implemetnation of a mutable map-like.
 * @template KEY The type of the key.
 * @template VALUE THe type of the value.
 * @extends {MutableMapLike<KEY,VALUE>}
 */
export class BasicMutableMapLike {
  /**
   * The entries of the map-like.
   * @type {[KEY,VALUE][]}
   */
  #entries = [];

  /**
   * Create a new mutable MapLike.
   * @param {Iterable<[KEY,VALUE]>} [iterable] The initial entries of the map-like.
   */
  constructor(iterable = [], options = {}) {
    // The setting of options performs the initialization of the storage.
    this.options = options;
    if (iterable) {
      // Mutable version does not initialize the entries, but add the entries.
      checkMapEntries(iterable, options).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
  }

  /**
   * The options of the map-like.
   * @type {MapLikeOptions<KEY,VALUE>}
   */
  get options() {
    const result = { ...getReadOnlyOptions(this), ...getAlteringOptions(this) };
    return result;
    return {
      equalKey: this.equalKey,
      validValue: this.validValue,
      validKey: this.validKey,
      validEntry: this.validEntry,
      refuseDuplicates: this.refuseDuplicates,
      createNewResult: this.createNewResult,
      replaceToEnd: this.replaceToEnd,
    };
  }

  /**
   * Set the options.
   * @param {MapLikeOptions<KEY,VALUE>}
   */
  set options(options) {
    /**
     * @todo Add error, if called after initialization
     */
    setReadOnlyOptions(this, options);
    setAlteringOptions(this, options);
    // Setting the intial entries.
    if (options.entries) {
      this.#entries = checkMapEntries([], options);
    } else {
      this.#entries = [];
    }
  }

  /**
   * Check the entry.
   * @param {[KEY,VALUE]} entry The tested entry.
   * @returns {[KEY,VALUE]} The valid entry to add to the
   * array of entries.
   */
  checkEntry(entry) {
    if (this.validEntry(entry)) {
      return [entry[0], entry[1]];
    } else if (Array.isArray(entry) && entry.length === 2) {
      if (this.validKey(entry[0])) {
        throw new TypeError("Invalid entry value");
      } else {
        throw new RangeError("Invalid entry key");
      }
    } else {
      throw new SyntaxError("Invalid map entry");
    }
  }

  /**
   * Perform a consumer function for every entry.
   * @param {(entry: [KEY,VALUE], index?: number)} consumerFn
   */
  forEach(consumerFn) {
    this.entries().forEach(consumerFn);
  }

  /**
   * Does the map have key.
   * @param {KEY} key The tested key.
   * @returns {boolean} True, if and only if the map has entry with key.
   */
  has(key) {
    return (
      this.#entries.findIndex(([entryKey]) => this.equalKey(key, entryKey)) >= 0
    );
  }

  /**
   * @inheritdoc
   */
  get(key) {
    const result = this.#entries.find(([entryKey]) =>
      this.equalKey(key, entryKey)
    );
    return result ? result[1] : undefined;
  }

  get size() {
    return this.#entries.length;
  }

  values() {
    return this.#entries.map(([_, value]) => value);
  }

  keys() {
    return this.#entries.map(([key]) => key);
  }

  entries() {
    return this.#entries.map(([key, value]) => [key, value]);
  }

  [Symbol.iterator]() {
    return this.#entries[Symbol.iterator]();
  }

  /**
   * Set the value of the value of an entry.
   * @param {KEY} key The changed key.
   * @param {VALUE} value The new value of the key.
   * @throws {RangeError} The key is invalid.
   * @throws {TypeError} The value is invalid.
   * @throws {SyntaxError} The key-value pair is ivnalid.
   * @returns {BasicMutableMapLike<KEY,VALUE>}
   */
  set(key, value) {
    const newEntry = this.checkEntry([key, value]);
    const [entryKey, entryValue] = newEntry;
    debug(
      `The assignment of ${elementToString(entryKey)} to ${elementToString(
        entryValue
      )} is okay`
    );
    const index = this.entries.findIndex(([currentKey]) =>
      this.equalKey(currentKey, entryKey)
    );
    if (index >= 0) {
      debug(`Replacing existing entry at index ${index}`);
      if (this.createNewResult) {
        this.#entries = this.replaceToEnd
          ? filterAndAppend(this.#entries, index, newEntry)
          : deleteAndPush(this.#entries, index, newEntry);
      } else {
        this.#entries = this.replaceToEnd
          ? replace(this.#entries, index, newEntry)
          : replaceCreateNew(this.#entries, index, newEntry);
      }
    } else {
      debug(`Adding new entry`);
      if (this.createNewResult) {
        this.#entries = push(this.#entries, newEntry);
      } else {
        this.#entries = append(this.#entries, newEntry);
      }
    }
    return this;
  }

  clear() {
    if (this.createNewResult) {
      this.#entries = [];
    } else {
      this.#entries.clear();
    }
  }

  delete(key) {
    const index = this.#entries.findIndex(([currentKey]) =>
      this.equalkKey(currentKey, key)
    );
    if (index >= 0) {
      if (this.createNewResult) {
        this.#entries = this.#entries.filter(
          (_, entryIndex) => entryIndex !== index
        );
      } else {
        this.#entries.splice(index, 1);
      }
      return true;
    } else {
      return false;
    }
  }
}
