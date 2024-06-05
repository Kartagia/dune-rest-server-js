/**
 * @module MapLike
 *
 * The library implementing MapLike interface.
 */

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
export function checkMapEntries(iterable = [], options = {}) {
  /** @type {Iterator<any>} */
  const iterator = iterable[Symbol.iterator]();
  let cursor = iterator.next();
  /** @type {[KEY,VALUE][]} */
  let result = options.entries
    ? options.createNewResult
      ? [...options.entries]
      : options.entries
    : /** @type {[KEY,VALUE][]} */ [];
  const equalKey = options.equalKey ?? ReadOnlyMapLike.SameValueZero;
  const validKey = options.validKey ?? ((/** @type {KEY} */ key) => true);
  const validValue =
    options.validValue ?? ((/** @type {VALUE} */ value) => true);
  const validEntry =
    options.validEntry ??
    (([/** @type {KEY} */ key, /** @type {VALUE} */ value]) =>
      validKey(key) && validValue(value));
  while (!cursor.done) {
    if (
      !Array.isArray(cursor.value) ||
      cursor.value.length !== 2 ||
      !validEntry(cursor.value)
    ) {
      throw new SyntaxError("Invalid entry.");
    }
    if (!validKey(cursor.value[0])) {
      throw new RangeError("Invalid key of map");
    }
    if (!validValue(cursor.value[1])) {
      throw new TypeError("Invalid value of map");
    }
    const indexOf = result.findIndex(([entryKey]) =>
      equalId(entryKey, options.value[0])
    );
    if (indexOf >= 0) {
      // Duplicate.
      if (options.refuseDuplicates ?? false) {
        throw new RangeError("Duplicate keys not allwoed");
      } else if (options.createNewResult) {
        if (options.replaceToEnd) {
          result = [
            ...result.filter(
              ([entryKey]) => !equalKey(entryKey, cursor.value[0])
            ), // The old result without replaced entry
            [...cursor.value], // The new entry to the end.
          ];
        } else {
          result = [
            ...result.slice(0, indexOf), // Head.
            [...cursor.value], // New etnry
            ...result.slice(indexOf + 1), // tail.
          ];
        }
      } else if (options.replaceToEnd) {
        // Replacing to the end of the result.
        result.splice(indexOf, 1);
        result.push([...cursor.value]);
      } else {
        // Changing the result.
        result.splice(indexOf, 1, [...cursor.value]);
      }
    } else {
      // No duplicate.
      result.push(cursor.value);
    }

    // Moving to next element.
    cursor = iterator.next();
  }

  // Return the reuslt.
  return result;
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
  static checkMapEntries = checkMapEntries;

  /**
   * The same value zero equality.
   * @template TYPE The tested type.
   * @type {Equality<TYPE>}
   */
  static SameValueZero = (
    /** @type {TYPE} */ tested,
    /** @type {TYPE} */ testee
  ) => {
    return (
      tested === testee ||
      (typeof testee == typeof tested &&
        typeof testee === "number" &&
        testee !== tested)
    );
  };

  /**
   * The same value equality.
   * @template TYPE The tested type.
   * @type {Equality<TYPE>}
   */
  static SameValueZero = (
    /** @type {TYPE} */ tested,
    /** @type {TYPE} */ testee
  ) => {
    return Object.is(tested, testee);
  };

  /**
   * The strict equality.
   * @template TYPE The tested type.
   * @type {Equality<TYPE>}
   */
  static StrictEquals = (
    /** @type {TYPE} */ tested,
    /** @type {TYPE} */ testee
  ) => {
    return tested === testee;
  };

  /**
   * The loose equality.
   * @template TYPE The tested type.
   * @type {Equality<TYPE>}
   */
  static LooseEquals = (
    /** @type {TYPE} */ tested,
    /** @type {TYPE} */ testee
  ) => {
    return tested == testee;
  };

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
  }

  /**
   * Does the map have key.
   * @param {KEY} key The tested key.
   * @returns {boolean} True, if and only if the map has entry with key.
   */
  has(key) {
    return this.#entries.findIndex(([entryKey]) => this.equalKey(key, entryKey)) >= 0;
  }

  /**
   * @inheritdoc
   */
  get(key) {
    const result = this.#entries.find( ([entryKey]) => this.equalKey(key, entryKey));
    return result ? result[1] : undefined;
  }

  get size() {
    return this.#entries.length;
  }

  values() {
    return this.#entries.map( ([_, value]) => (value));
  }

  keys() {
    return this.#entries.map( ([key]) => (key));
  }

  entries() {
    return this.#entries.map( ([key, value]) => ([key, value]));
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
    return this.#entries.findIndex(([entryKey]) => this.equalKey(key, entryKey)) >= 0;
  }

  /**
   * @inheritdoc
   */
  get(key) {
    const result = this.#entries.find( ([entryKey]) => this.equalKey(key, entryKey));
    return result ? result[1] : undefined;
  }

  get size() {
    return this.#entries.length;
  }

  values() {
    return this.#entries.map( ([_, value]) => (value));
  }

  keys() {
    return this.#entries.map( ([key]) => (key));
  }

  entries() {
    return this.#entries.map( ([key, value]) => ([key, value]));
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
    const index = this.entries.findIndex( ([currentKey]) =>this.equalKey(currentKey, entryKey));
    if (index >= 0) {
        if (this.createNewResult) {
            this.#entries = (this.replaceToEnd ?
                [ ...this.#entries.filter( ([currentKey]) =>!this.equalKey(currentKey, entryKey)), [entryKey,entryValue]] : 
            [...this.#entries.slice(0, index), [entryKey, entryValue], ...this.#entries.slice(index+1)]);
        } else {
            this.#entries.splice(index, 1, [entryKey, entryValue]);
        }
    } else if (this.createNewResult) {
        this.#entries = [...this.#entries, [entryKey, entryValue]];
    } else {
        this.#entries.push([entryKey, entryValue]);
    }
    if (this.validKey(key))
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
    const index = this.#entries.findIndex( ([currentKey])=>this.equalkKey(currentKey, key));
    if (index >= 0) {
        if (this.createNewResult) {
            this.#entries = this.#entries.filter( (_, entryIndex) => (entryIndex !== index));
        } else {
            this.#entries.splice(index, 1);
        }
        return true;
    } else {
        return false;
    }
  }
}
