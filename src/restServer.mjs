/**
 * @module server/rest
 * Rest server module for generic DAO using rest sever.
 */

import { BasicDao } from "./BasicDao.mjs";

/**
 * Get another value, if the value is defined.
 * @template TYPE The tested value.
 * @template [RESULT=TYPE] The result value type.
 * @param {TYPE|undefined|null} value The tested value.
 * @param {RESULT} defiendValue The value used, if the value is defined.
 * @returns {RESULT|undefined|null} If the value is deifned, the given defined value. Otherewise
 * the undefined or null value given.
 */
export function andThen(value, defiendValue) {
  if (value == null) {
    return value;
  } else {
    return defiendValue;
  }
}

/**
 * Call a function with value, if the value is defined, undefined, or null.
 * @template TYPE The tested value.
 * @template [RESULT=TYPE] The result value type.
 * @param {TYPE} value The tsted valeu.
 * @param {(value: TYPE) => (RESULT|undefined|null)} definedFn The function producing the reuslt, if the value
 * is defined.
 * @param {(value = undefined) => (RESULT|undefined|null)} [undefinedFn] The function transofmring an undefined value. Defaults to a function always returning
 * an undefined value.
 * @param {(value = null) => (RESULT|undefined|null)} [nullFn] The function transofmring a null value. Defaults to a function always returning a null value.
 * @returns {RESULT|undefined|null} If the value is defined, the given {@link definedFn} result.. Otherewise
 * the undefined or null value given.
 */
export function andThenDo(
  value,
  definedFn,
  undefinedFn = undefined,
  nullFn = undefined
) {
  if (value === undefined) {
    return undefinedFn ? undefinedFn(value) : value;
  } else if (value === null) {
    return nullFn ? nullFn(value) : value;
  } else {
    return definedFn(value);
  }
}

/**
 * Get value or a default value, if value does not exist.
 * @template TYPE The tested value type and the result type.
 * @param {TYPE|undefined|null} value The tested value.
 * @param {TYPE} undefinedDefaultValue The default value, if the value is undefined.
 * @param {TYPE} [nullDefaultValue] The default value for null avlue. Defaults to the
 * undeifned default valeu.
 * @returns {TYPE} If the value is defind and not null, retuns the value. Otherwise returns
 * appropriate default value.
 */
export function orElse(
  value,
  undefinedDefaultValue,
  nullDefaultValue = undefined
) {
  if (
    value === undefined ||
    (value === null && nullDefaultValue === undefined)
  ) {
    return undefinedDefaultValue;
  } else if (value === null) {
    return nullDefaultValue;
  } else {
    return value;
  }
}

/**
 * @template [ID=string] The identifier type of the dao.
 * @template TYPE The type of the resource.
 * @callback IdFunction
 * @param {TYPE} value The value, wnose new Identifier is generated.
 * @returns {ID} The identifier for the value.
 * @throws {RangeError} The generation of the identifier is not possible.
 */

/**
 * The function generating the REST Data links property for REST data.
 * @template ID The resource identifier type.
 * @template TYPE The resource value type.
 * @callback LinkGenerator
 * @param {TYPE} value The resource value.
 * @param {ID} [id] The identifier.
 * @returns {Record<string, string>|undefined} The links structure from link name to the link value.
 */

/**
 * The options of the resource.
 *
 * @template [ID=string] The identifier type of the dao.
 * @template TYPE The type of the resource.
 * @typedef {Object} ResourceOptions
 * @property {IdFunction<ID,TYPE>} [getId] The function generating identifier for a created
 * value.
 * @property {boolean} [canPut] Does the resource allow update.
 * @property {boolean} [canPost] Does the resource allow creation of the identifier.
 * Defaults to the existence of the function to generate id for the new value.
 * @property {boolean} [canDelete] Does the resource allow removal of the resource.
 * @property {boolean} [canPatch] Does the resource allow patching an existing value.
 */

/**
 * The options for RestResource
 * @template [ID=string] The identifier type of the DAO.
 * @template TYPE The type of hte resource value.
 * @typedef {Object} RestResourceOptions
 * @property {Stringifier<ID, RangeError>} [formatId] The function converting the Resource identifier into
 * string identifier of the REST. The result requires URL encoding if used in URL.
 * @property {Parser<ID, RangeError>} parseId The function converting urldecoded Rest identifier into the
 * DAO identifier.
 * @property {Stringifier<TYPE, TypeError>} [formatData] The function used to format the resource value.
 * This option is only used, if the formatValue is absent.
 * @property {LinkGenerator<ID, TYPE>} [generateLinks] The function generating links of the REST data. Defaults to a function always
 * returning an undefined value.
 * @property {Parser<TYPE, TypeError>} [parseData] The function used to parse the resource value from
 * data of the Rest data. This value is only used, if the parseValue is absent.
 * @property {ValueFormatter<ID,TYPE>} [formatValue] The function formatting
 * the resource value into the RestData. Defaults to the JSON conversion of the resoruce value into data, and
 * creating links with link generator. This value takes precedense over formatData and generateLinks properties.
 * @property {ValueParser<ID,TYPE>} [parseValue] The function parsing the
 * resource value from the rest data from the client. Dafaults to the {@link JSON.parse} of the value.
 */

/**
 * The links of the HATEOAS REST Data.
 * @typedef {Record<string,string>} Links
 */

/**
 * The REST data representation.
 * @typedef {Object} RestData
 * @property {Links} [links] The HATEOAS REST links.
 * @property {string} data The JSON representation of the data.
 */

/**
 * The function converting a value into a string.
 * @template TYPE The converted value type.
 * @template [ERROR=SyntaxError] The error type.
 * @callback Stringifier
 * @param {TYPE} value The converted value.
 * @returns {string} The string representation of the value.
 * @throws {ERROR} The value could not be converted into a string.
 */

/**
 * A function parsing value from a string representation.
 * @template TYPE The parsed value type.
 * @template [ERROR=any] The error type.
 * @callback Parser
 * @param {string} source The parsed string.
 * @returns {TYPE} The parsed value.
 * @throws {ERROR} The parwe failed.
 */

/**
 * A function formatting an identifier into REST identifier.
 * @template ID The identifier type.
 * @callback IdFormatter
 * @param {ID} id The identifier to format.
 * @returns {string} The formatted string representation of the id.
 * @throws {RangeError} The formatting of the identifier failed.
 */

/**
 * A function parsing the identifier from a REST identifier.
 * @template ID The identifier type.
 * @callback IdParser
 * @param {string} restId The formatted identifier.
 * @returns {ID} The idetnifier parsed from the REST identifier.
 * @throws {RangeError} The parsing of the identifier failed.
 */

/**
 * A function formatting a value into a Rest Data.
 * @template ID The identifier type of the resource.
 * @template TYPE The value type of the resource.
 * @callback ValueFormatter
 * @param {TYPE} value The resource value.
 * @param {ID} [id] The optional identifier of the value.
 * @returns {RestData} The rest data for the value.
 * @throws {TypeError} The given value counld not be converterd into Rest Data.
 * @throws {RangeError} The given identifier was invalid.
 */

/**
 * A function parsing the value from a Rest Data.
 * @template ID The identifier type of the resource.
 * @template TYPE The alue type of the resource.
 * @callback ValueParser
 * @param {RestData} value The REST value.
 * @returns {TYPE} The converted resource value.
 * @throws {TypeError} The given REST value counld not be converterd into a resource value.
 */

/**
 * A rest resource cottaining basic dao.
 * @template [ID=string] The identifier type of the actula DAO.
 * @template TYPE The actual value stored in the DAO.
 * @extends {BasicDao<string, RestData>}
 */
export class RestResource extends BasicDao {
  
    /**
     * Convert the identifier to the JSON string representation.
     * @type {IdFormatter<ID>} 
     */
  static defaultIdFormatter(id) {
    try {
        return JSON.stringify(id);
    } catch (err) {
        throw new RangeError("Invalid resource identifier", { cause: err });
      }
    }
    /**
   * Create identifier formatter.
   * @template ID The identifeir type.
   * @param { IdFormatter<ID>|undefined} formatFn The formatter function.
   * @returns {IdFormatter<ID>} The given identifier formatter function, or the default
   * function.
   * @throws {ReferenceError} The given formatter was not a suitable function.
   */
  static checkIdFormatter(formatFn) {
    if (formatFn === undefined) {
      return (this ?? RestResource).defaultIdFormatter;
    } else if (formatFn instanceof Function && formatFn.length === 1) {
      return formatFn;
    } else {
      throw new ReferenceError("Invalid identifier formatting function.");
    }
  }

  /**
   * The default resource identifeir parser.
   * @template ID
   * @type {IdParser<ID>}
   */
  static defaultIdParser(/** @type {string} */ restId) {
    try {
      return JSON.parse(restId);
    } catch (err) {
      throw new RangeError("Invalid REST identifier", { cause: err });
    }
  }

  /**
   * Check the idetnifier parsing function.
   * @template ID The resource identifier type.
   * @param {IdParser<ID>|undefined} parseFn The identifier parsing function.
   * @returns {IdParser<ID>} The checked idetnifeir parsing funciton.
   * @throws {ReferenceError} The given parser was not a suitable function.
   */
  static checkIdParser(parseFn) {
    if (parseFn === undefined) {
      return (this ?? RestResource).defaultIdParser;
    } else if (parseFn instanceof Function && parseFn.length === 1) {
      return parseFn;
    } else {
      throw new ReferenceError("Invalid identifier parser function.");
    }
  }

  /**
   * Check the value formatter function.
   * @template ERROR The error type of the possible cause of failure.
   * @param {Stringifier<TYPE, ERROR>|undefined} valueFormatFn The function formatting the value into data.
   * @param {LinkGenerator<ID,TYPE>} [linkGenerator] The function generating the links of hte rest data for HATEOAS Rest.
   * @returns {ValueFormatter<ID,TYPE>} The value formatter function converting a resource value (and possible id) into Rest Data.
   */
  static checkValueFormatter(valueFormatFn, linkGenerator = undefined) {
    if (valueFormatFn === undefined) {
      /**
       * The result value formatting function.
       * @type {ValueFormatter<TYPE,ID>}
       */
      const resultFn = (
        /** @type {TYPE} */ value,
        /** @type {ID|undefined} */ id = undefined
      ) => {
        try {
          /**
           * @type {RestData}
           */
          const result = {
            data: JSON.stringify(value),
            links:
              linkGenerator === undefined
                ? undefined
                : linkGenerator(value, id),
          };
          return result;
        } catch (err) {
          throw new TypeError("Invalid REST value", { cause: err });
        }
      };
      return resultFn;
    } else if (
      valueFormatFn instanceof Function &&
      valueFormatFn.length >= 1 &&
      valueFormatFn.length <= 2
    ) {
      /**
       * The result value formatting function.
       * @type {ValueFormatter<TYPE,ID>}
       */
      const resultFn = (
        /** @type {TYPE} */ value,
        /** @type {ID|undefined} */ id = undefined
      ) => {
        /**
         * @type {RestData}
         */
        const result = {
          data: valueFormatFn(value, id),
          links:
            linkGenerator === undefined ? undefined : linkGenerator(value, id),
        };
        return result;
      };
      return resultFn;
    } else {
      throw new ReferenceError("Invalid resource value formatting function.");
    }
  }

  /**
   * Check the value parser function.
   * @template ERROR The error type of the possible cause of failure.
   * @param {Parser<TYPE,ERROR>|undefined} valueParserFn The function formatting the value into data.
   * @returns {ValueParser<ID,TYPE>} The value formatter function converting a REST value into a resource value.
   */
  static checkValueParser(valueParserFn) {
    if (valueParserFn === undefined) {
      return (/** @type {RestData} */ restValue) => {
        try {
          return JSON.parse(restValue.data);
        } catch (err) {
          throw new TypeError("Invalid REST data", { cause: err });
        }
      };
    } else if (
      valueParserFn instanceof Function &&
      valueParserFn.lnegth === 1
    ) {
      return (/** @type {RestData} */ restValue) => {
        try {
          return valueParserFn(restValue.data);
        } catch (err) {
          throw new TypeError("Invalid REST data", { cause: err });
        }
      };
    } else {
      throw new ReferenceError("Invalid resource value parsing function.");
    }
  }

  /**
   * The actual data storage.
   * @type {import("./BasicDao.mjs").Dao<ID,TYPE>}
   */
  #dao;

  /**
   * The actual data storage.
   * @type {import("./BasicDao.mjs").Dao<ID,TYPE>}
   */
  get dao() {
    return this.#dao;
  }

  /**
   * The function formatting the resource value into the REST data.
   * @type {ValueFormatter<ID,VALUE>}
   */
  #formatValue;

  /**
   * The formatter function.
   * @type {Stringifier<TYPE>|undefined}
   */
  #formatData = undefined;

  /**
   * The parser of the data.
   * @type {Parser<TYPE>|undefined}
   */
  #parseData = undefined;

  /**
   * The function generating REST links.
   * @type {LinkGenerator<ID, TYPE>|undefined}
   */
  #linkGenerator = undefined;

  /**
   * The options of the rest resource.
   * @type {Readonly<RestResourceOptions<ID,TYPE>>}
   */
  get options() {
    return {
      formatId: this.idFormatter,
      valueFormatter: this.#formatValue,
      formatData: this.#formatData,
      parseData: this.#parseData,
      linkGenerator: this.#linkGenerator,
      idParser: this.idParser,
      valueParser: this.valueParser,
    };
  }

  /**
   * Create a new REST resource.
   * @param {Dao<ID,TYPE>} dao The DAO performing actual storage of the resources.
   * @param {RestResourceOptions<ID,TYPE>} [options] The resource options.
   */
  constructor(dao, options = {}) {
    super();
    this.idFormatter = this.checkIdFormatter(options.formatId);
    this.#parseData = andThen(
      options.formatValue,
      undefined,
      options.parseData
    );
    this.#formatData = options.formatData;
    this.#formatValue = orElse(
      options.formatValue,
      this.checkValueFormatter(options.formatValue, options.linkGenerator)
    );
    this.idParser = this.checkIdParser(options.idParser);
    this.valueParser = this.checkValueParser(options.valueParser);
    this.#dao = dao;
  }

  /**
   * Check the validty of the identifier formatter function.
   * @param {IdFormatter<ID>|undefined} formatterFn The idetnifier formatter function.
   * @returns {IdFormatter<ID>} The valid formatter function.
   * @throws {ReferenceError} The formatter was invalid.
   */
  checkIdFormatter(formatterFn) {
    return /** @type {RestResource<ID,TYPE>}*/ RestResource.checkIdFormatter(
      formatterFn
    );
  }

  /**
   * Check the validty of the value formatter function.
   * @param {ValueFormatter<ID,TYPE>|undefined} formatterFn The formatter function.
   * @returns {ValueFormatter<ID,TYPE>} The valid formatter function.
   * @throws {ReferenceError} The formatter was invalid.
   */
  checkValueFormatter(valueStringifier, linkGenerator = undefined) {
    return /** @type {RestResource<ID,TYPE>}*/ RestResource.checkValueFormatter(
      valueStringifier,
      linkGenerator
    );
  }

  /**
   * Check the validity of the identifier parser function.
   * @param {IdParser<ID>|undefined} parserFn The tested parser function.
   * @returns {IdParser<ID>} The valid identifier parser derived from the given praser function.
   * @throws {ReferenceError} The parser does not exist.
   */
  checkIdParser(parserFn) {
    return /** @type {RestResource<ID,TYPE>}*/ RestResource.checkIdParser(
      parserFn
    );
  }

  /**
   * Check the validity of the identifier parser function.
   * @param {Parser<TYPE>|undefined} parserFn The tested parser function.
   * @returns {ValueParser<ID, TYPE>} The valid value parser derived from the given praser function.
   * @throws {ReferenceError} The parser does not exist.
   */
  checkValueParser(parserFn) {
    return /** @type {RestResource<ID,TYPE>}*/ RestResource.checkValueParser(
      parserFn
    );
  }

  /**
   * Generate REST ID for a resoruce id.
   * @param {ID} id The respurce identifier.
   * @return {Promise<string>} The Rest id.
   */
  formatId(id) {
    return new Promise((resolve, reject) => {
      try {
        resolve(encodeURIComponent(this.idFormatter(id)));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Parse resource identifier from REST id.
   * @param {string} restId The parsed REST id.
   * @return {Promise<ID>} The promise of the resource identifier.
   */
  parseId(restId) {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.idParser(decodeURIcomponent(restId)));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Format the internal DAO entry RestResource value.
   * @param {TYPE} value The formatted DAO value.
   * @param {ID} [id] The DAO identifier of the formatted value.
   * @returns {Promise<RestData>} The promise of the REST Data of the given value.
   * @throws {TypeError} The resource value formatting failed. The error is rejected.
   */
  formatValue(value, id = undefined) {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.#formatValue(value, id));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Parse resource value from data.
   * @param {RestData} restData The rest data containing the resource value.
   * @returns {Promise<TYPE>} The promise of the resource value parsed from the REST data.
   * @throws {TypeError} The resource value parse failed. The error is rejected.
   */
  parseValue(restData) {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.valueParser(restData));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * @inheritdoc
   */
  all() {
    return this.#dao
      .all()
      .then((entries) =>
        entries.map(([id, value]) => [
          this.formatId(id),
          this.formatValue(value, id),
        ])
      );
  }

  /**
   * @inheritdoc
   */
  one(id) {
    const daoId = this.parseId(id);
    /**
     * @type {Promise<RestData>}
     */
    return this.#dao
      .one(daoId)
      .then((/** @type {TYPE} */ result) => this.formatValue(result, daoId));
  }

  /**
   * @inheritdoc
   */
  create(value) {
    return new Promise((resolve, reject) => {
      this.parseValue(value)
        .then((resourceValue) =>
          this.#dao.create(resourceValue).then((daoId) => {
            return this.formatId(daoId);
          })
        )
        .then(resolve, reject);
    });
  }

  /**
   * @inheritdoc
   */
  update(id, value) {
    return new Promise((resolve, reject) => {
      this.parseId(id)
        .then((resourceId) =>
          this.parseValue(value).then((resourceValue) =>
            this.#dao.update(resourceId, resourceValue)
          )
        )
        .then(resolve, reject);
    });
  }

  /**
   * @inheritdoc
   */
  remove(id) {
    return new Promise((resolve, reject) => {
      this.parseId(id)
        .then((resourceId) => this.#dao.remove(resourceId))
        .then(resolve, reject);
    });
  }
}

/**
 * Rest server storing important details of the rest server.
 */
export class RestServer {
  constructor() {}

  /**
   * The entries of the server.
   * @type {[string, string, ResourceOptions<any,any>, import("./BasicDao.mjs").Dao<any, any>]}
   */
  #resources = new Array();

  /**
   * Does the server have registered resource.
   * @param {string} path The resource path.
   * @param {string} resourceName The name of the resource.
   * @returns {boolean} True, if and only if the server ahs given resource name attached to the path.
   */
  hasResource(path, resourceName) {
    return (
      this.#resources.find(
        ([entryPath, entryName]) =>
          path === entryPath && resourceName == entryName
      ) !== undefined
    );
  }

  /**
   * Register a resource.
   * @template [ID=string] The identifier type of the dao.
   * @template TYPE The type of the resource.
   * @param {string} basePath The rsource path.
   * @param {string} resourceName The name of the resource.
   * @param {import("./BasicDao.mjs").Dao<ID, TYPE½} dao The deo handling the path resourcers.
   * @param {ResourceOptions<ID,TYPE>} [options={}] The options of the resource.
   */
  registerResource(basePath, resourceName, dao, options) {
    if (this.hasResource(basePath, resourceName)) {
      throw new RangeError("The resource path reserved");
    } else {
      this.#resources.push([basePath, resourceName, options, dao]);
    }
  }

  /**
   * Unregister a resource.
   * @param {string} basePath The rsource path.
   * @param {string} resourceName The name of the resource.
   */
  unregeisterResource(basePath, resourceName) {
    this.#resources = this.#resources.filter(
      ([entryPath, entryName]) => entryPath !== path || entryName !== entryName
    );
  }

  fetchAll(basePath, resourceName) {
    return new Promise((resolve, reject) => {
      if (this.hasResource(basePath, resourceName)) {
        const resource = this.getResource(basePath, resourceName);
        resource.all().then(resolve, reject);
      } else {
        reject(new RangeError("No such entry exists"));
      }
    });
  }

  /**
   * Get the resource value.
   * @param {string} basePath The base path.
   * @param {string} resourceName The resource name.
   * @param {string} id The identifier as string.
   * @return {Promise<RestData>} The promise of the resource REST data.
   */
  fetchOne(basePath, resourceName, id) {
    return new Promise((resolve, reject) => {
      if (this.hasResource(basePath, resourceName)) {
        const resource = this.getResource(basePath, resourceName);
        resource.one(resource.parseId(id)).then(resolve, reject);
      } else {
        reject(new RangeError("No such entry exists"));
      }
    });
  }
}
