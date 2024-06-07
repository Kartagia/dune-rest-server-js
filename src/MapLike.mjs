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
let loggers = [];

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
    this.loggers.push(logger);
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
  let index = this.loggers.indexOf(logger, 0);
  if (index >= 0) {
    let nextIndex = this.loggers.indexOf(logger, index);
    while (nextIndex >= 0) {
      index = nextIndex;
      let nextIndex = this.loggers.indexOf(logger, index);
    }
  }
  if (index >= 0) {
    loggers.splice(index, 1);
  }
}

/**
 * Set the current log level.
 * @param {LOG_LEVEL} newLevel
 */
export function setLogLevel(newLevel) {
  debugLevel = newDebugLevel;
}

export function log(message, level = "info") {
  if (loggers.length && isLogLevel(level)) {
    loggers.forEach( log => {log.log(message)});
  }
}

export function error(message, level = "error") {
  if (loggers.length && isLogLevel(level)) {
    loggers.forEach( log => {log.error(message)});
  }
}

export function debug(message, level = "debug") {
  if (loggers.length && isLogLevel(level)) {
    loggers.forEach( log => {log.debug(message)});
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
        return `Object of ${Object.getPrototypeOf(element)}`;
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
 * @throws {SyntaxError} Any entry was invalid.
 * @throws {RangeError} Any key was invalid.
 * @throws {TypeError} Any value was invalid.
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
    throw new ReferenceError("Iterable not iterable!");
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
      equalKey(entryKey, addedValue)
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
    debug(
      `Acquired ${cursor.done ? "non-existing" : "existing"} next value`
    );
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
   * @param {MapLikeOptions<KEY,VALUE>} [options] THe options of the map-like.
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
   * @param {(entry: [KEY,VALUE], index?: number)} consumerFn
   */
  forEach(consumerFn) {
    this.entries().forEach(consumerFn);
  }
}

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
    this.options = options;
    if (iterable) {
      this.#entries = thic.checkMapEntries(iterable, options);
    }
  }

  /**
   * The options of the map-like.
   * @type {MapLikeOptions<KEY,VALUE>}
   */
  get options() {
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
    this.equalKey = options.equalKey ?? this.defaultKeyEquality;
    this.validEntry = options.validEntry;
    this.validKey = options.validKey;
    this.validValue = options.validValue;
    this.refuseDuplicates = options.refuseDuplicates;
    this.createNewResult = options.createNewResult;
    this.replaceToEnd = options.replaceToEnd;
    if (options.entries) {
      this.#entries = this.checkMapEntries(undefined, options);
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
    const [entryKey, entryValue] = this.checkEntry([key, value]);
    const index = this.entries.findIndex(([currentKey]) =>
      this.equalKey(currentKey, entryKey)
    );
    if (index >= 0) {
      if (this.createNewResult) {
        this.#entries = this.replaceToEnd
          ? [
              ...this.#entries.filter(
                ([currentKey]) => !this.equalKey(currentKey, entryKey)
              ),
              [entryKey, entryValue],
            ]
          : [
              ...this.#entries.slice(0, index),
              [entryKey, entryValue],
              ...this.#entries.slice(index + 1),
            ];
      } else {
        this.#entries.splice(index, 1, [entryKey, entryValue]);
      }
    } else if (this.createNewResult) {
      this.#entries = [...this.#entries, [entryKey, entryValue]];
    } else {
      this.#entries.push([entryKey, entryValue]);
    }
    if (this.validKey(key)) return this;
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