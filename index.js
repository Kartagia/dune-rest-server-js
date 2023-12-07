import express from "express";
import {
  ValidationError,
  ValidationErrorOptions,
} from "./modules/tools.promise.mjs";
const app = express();
const logger = console;

/**
 * The user information structure.
 * // TODO: Move this to its own file.
 * @typedef {Object} UserInfo
 * @property {string} account The accont of the user.
 * @property {string} [displayName] The display name of the user.
 */

/**
 * Get a value.
 * @template TYPE - the value type.
 * @typedef {import("./modules/tools.promise.mjs").Getter<TYPE>} Getter
 */

/**
 * Set a value.
 * @template TYPE - The value type.
 * @typedef {import("./modules/tools.promise.mjs").Setter<TYPE>} Setter
 */

/**
 * An authorization error.
 */
export class AuthError extends Error {
  /**
   * Create a new authorization error.
   * @param {string|null} message The message of the error.
   * @param {UserInfo|null} [userInfo] The user information.
   * @param {Error} [cause] The cause of the error.
   */
  constructor(message, userInfo = null, cause = undefined) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.userInfo = userInfo;
  }
}

/**
 * The port of the application.
 */
const PORT = 3000;

/**
 * The default menu structure.
 */
const defaultMenu = () => ({
  icon: "./public/icon.svg",
  file: {
    title: "File",
    action: "/file",
  },
  skills: {
    title: "Skills",
    action: "/data/skills",
  },
  drives: {
    title: "Drives",
    action: "/data/drives",
  },
  traits: {
    title: "Traits",
    action: "/data/traits",
  },
  account: {
    title: "Account",
    menu: {
      login: {
        title: "Sign In",
        rename: {
          condition: "=logged",
          title: "Change account",
        },
        action: "/account/login",
      },
      logout: {
        title: "Sign Out",
        hide: "!logged",
        action: "/account/logout",
      },
      signup: {
        title: "Register",
        hide: "!logged",
        action: "/account/register",
      },
    },
    align: "right",
  },
});

/**
 * The menu stored in the memory.
 */
const menu = defaultMenu();

/**
 * The skill template.
 * @typedef {ResourceTemplate} SkillTemplate
 * @property {FieldDefinition<string>} name The name of the skill.
 * @property {FieldDefinition<string>} title The title of the skill.
 * @property {FieldDefinition<string>} description The description of the skill.
 */

/**
 * The model of a skill.
 * @typedef {Object} SkillModel
 * @property {string} name The name of the skill.
 * @property {string} [title] The title of the skill. Defaults to the
 * name property value.
 * @property {string} [abbreviation] The abbreviation of the skill.
 * @property {string} [description] The description of the skill.
 */

/**
 * Test validity of a name.
 * @param {string} name The tested name.
 * @returns {boolean} True, if and only if the name is a valid name.
 */
export const validName = (name) => {
  return (
    typeof name === "string" &&
    name.length &&
    name.trim().length === name.length
  );
};

/**
 * The regular expression matching to a single word.
 * @type {RegExp}
 */
const wordRe = /\p{Lu}\p{Ll}*/gu;

/**
 * Test validity of a skill name.
 * @param {string} name The tested skill name.
 * @returns {boolean} True, if and only if the name is a valid skill name.
 */
export const validSkillName = (name) => {
  return (
    validName(name) &&
    RegExp(
      "^" +
        "(?<name>" +
        wordRe.source +
        "(?:[\\s\\-]" +
        wordRe.source +
        ")*" +
        ")" +
        "$",
      "gu"
    ).test(name)
  );
};

/**
 * Test validity of an abbreviation. An abbreviation is a valid abbreviation, if it contains
 * upper case lettters.
 * @param {string} abbreviation The tested abbreviation.
 * @returns {boolean} True, if and only if the name is a valid abbreviation.
 */
export const validAbbreviation = (abbreviation) => {
  return (
    validName(abbreviation) &&
    /^\p{Lu}(?:\p{Ll}+|(?:\.\p{Lu})*)$/u.test(abbreviation)
  );
};

/**
 * Create a new skill.
 * @constructor
 * @param {string} skillName The name of the skill.
 * @param {string} [skillTitle] THe title of the skill.
 * @param {string} [abbreviation] The abbreviation of the skill.
 * @param {string} [description] The description of the skill.
 * @returns {SkillModel}
 */
export const createSkillModel = (
  skillName,
  skillTitle = undefined,
  abbreviation = undefined,
  description = undefined
) => {
  if (!validSkillName(skillName)) {
    throw typeof skillName === "string"
      ? new RangeError("Invalid skill name")
      : new TypeError("Invalid skill name");
  }
  if (abbreviation && !validAbbreviation(abbreviation)) {
    throw typeof abbreviation === "string"
      ? new RangeError("Invalid skill abbreviation")
      : new TypeError("Invalid skill abbreviation");
  }

  return /** @type {SkillModel} */ {
    name: skillName,
    title: skillTitle ? skillTitle : skillName,
    description,
    abbreviation,
  };
};

/**
 * A function converting a value into a string.
 * @template SOURCE
 * @callback ToStringer
 * @param {SOURCE} value The value converted to a string.
 * @returns {string} The string representation of the value.
 */

/**
 * A function converting a string into a value.
 * @template TARGET
 * @callback FromStringer
 * @param {string} source The parsed string.
 * @returns {TARGET} The parsed value.
 * @throws {SyntaxErrror} The parse failed.
 */

/**
 * The model value represents a reference to a model value.
 * @template MODEL The type of the contained value.
 * @template VALUE The type of the value.
 * @typedef {Object} ModelValue
 * @property {string[]|URL} ref The reference of the resource. The reference
 * must refer to a rsource of model type.
 * @property {VALUE} value The value of the resource.
 * @property {Getter<VALUE>|undefined} get The getter of the value.
 * If undefined, the value is write only.
 * @property {Setter<VALUE>|undefined} set The setter of the value.
 * If undefined, the value is read only.
 * @property {Getter<MODEL>} getModel The getter of the model of the value.
 */

/**
 * The skill model value.
 * @typedef {ModelValue<SkillModel, number>} SkillValue
 */

/**
 * A container storing resources
 * @template TYPE The type of the content.
 * @typedef {Object.<string, TYPE>} ResourceContainer
 */

/**
 * @template TYPE - The value type.
 * @typedef {Object} FieldDefinition
 * @property {string} name The name of the field.
 * @property {string} desc The description of the field.
 * @property {boolean} [optional=false] Is the field optional.
 * @property {TYPE|string|undefined} [defaultValue] The default value of the field.
 * - The string value starting with "=" is considered as property reference.
 * - An undefined value indicates the default value is undefined. This is the default.
 */

/**
 * The definition of a resource.
 * @template TYPE - The value type of the resource.
 * @typedef {Object} ResourceDefinition
 * @property {Object.<string, FieldDefinition<any>>} fields The field definitions.
 * @property {ToStringer<TYPE>} format The converter of the field to the string.
 * @property {FromStringer<TYPE>} parse The converter from a string to resource value.
 */

/**
 * The template mapping of the resources.
 * @type {Object.<string, ResourceDefinition>}
 */
const templates = {
  skills: {
    fields: {
      name: {
        desc: "The name of the skill",
        type: "string",
      },
      title: {
        desc: "The title of the skill",
        type: "string",
        optional: true,
        defaultValue: "=property(name)",
      },
      description: {
        desc: "The description of the skill",
        type: "string",
        optional: true,
      },
    },
  },
  traits: {
    fields: {
      name: { desc: "The name of the drive", type: "string" },
      title: {
        desc: "The title of the drive",
        type: "string",
        optional: true,
        default: "=property(name)",
      },
      description: {
        desc: "The description of the drive",
        type: "string",
        optional: true,
      },
    },
  },
  drives: {
    fields: {
      name: { desc: "The name of the drive", type: "string" },
      title: {
        desc: "The title of the drive",
        type: "string",
        optional: true,
        default: "=property(name)",
      },
      description: {
        desc: "The description of the drive",
        type: "string",
        optional: true,
      },
    },
  },
};

/**
 * The in memory data.
 * @type {ResourceContainer<any>}
 */
const data = {
  skills: /** @type {ResourceContainer<SkillModel>} */ {
    ...["Battle", "Communcation", "Duty", "Move", "Understand"].map(
      (name, index) => ({ [index]: { name, title: name } })
    ),
  },
  traits: {},
  drives: {
    ...["Duty", "Faith", "Justice", "Power", "Truth"].map((name, index) => ({
      [index]: { name, title: name },
    })),
  },
};

/**
 * @template [ID=string] the identifier type.
 * @template TYPE the type of the identified value.
 * The object containing the identifier and value pair.
 * @typedef {Object} Identified
 * @property {ID|null} id The identifier value. A null value
 * indicates there is no identifier.
 * @property {TYPE} value The identified value.
 * @method toArray
 * @returns {Array.[ID, TYPE]} The identified as an array tuple
 * [key, value].
 * @method toJSON
 * @returns {string} The JSON representation of the identified.
 */

/**
 * Create a string identified value.
 * @template TYPE The value type.
 * @param {string|null} id The identifier.
 * @param {TYPE} value The value
 * @returns {Identified<TYPE>} The identified.
 */
export function createIdentified(id, value) {
  return {
    id,
    value,
    toArray() {
      return [id, value];
    },
    toJSON() {
      return JSON.stringify(this.toArray());
    },
  };
}

/**
 * Get all resources.
 * @template MODEL - The resource model.
 * @param {*} data The data structure of the resources.
 * @param {string} resource The queried resource.
 * @returns {Promise<Array<Identified<MODEL>>>} The promise of the resource
 * entries.
 */
const getAll = (data, resource) => {
  if (hasDataResource(data, resource)) {
    return Promise.resolve(
      Object.getOwnPropertyNames(data[resource]).map((resName) =>
        /** @type {Identified<MODEL>} */ createIdentified(
          resName,
          /** @type {MODEL} */ data[resource][resName]
        )
      )
    );
  } else {
    return Promise.reject(new RangeError("No such resource exits"));
  }
};

/**
 * Get the data resource.
 * @template TYPE
 * @param {Map<string, TYPE>|Object.<string,TYPE>} resources
 * @param {string} resourceName The name of the resource.
 * @returns {Promise<TYPE>} The promise of the value.
 */
function getDataResource(resources, resourceName) {
  if (resources instanceof Map) {
    return Promise.resolve(resources.get(resourceName));
  } else if (resources instanceof Object) {
    return Promise.resolve(resources[resourceName]);
  } else {
    return Promise.reject(RangeError("Missing resource"));
  }
}

/**
 * Does the data have a resource.
 * @param {Map<string, any>|Object.<string, any>} resources The resource
 * collection.
 * @param {string|string[]} resource The resource name, or the path
 * to the resource.
 */
function hasDataResource(resources, resource) {
  if (resource instanceof Array) {
    return resource.reduce(
      async (result, resourceName, index, path) => {
        if (result.result) {
          if (hasDataResource(result.cursor, resourceName)) {
            result.cursor = await getDataResource(result.cursor, resourceName);
            if (
              index !== path.length - 1 &&
              !(result.cursor instanceof Object)
            ) {
              // The value is not a resource container.
              result.result = false;
            }
          } else {
            // The resource does not exist.
            result.result = false;
          }
        }
        return result;
      },
      { cursor: resources, result: true }
    ).result;
  } else if (typeof resource !== "string") {
    // A non-string resource.
    return false;
  } else if (resources instanceof Map) {
    return resources.has(resource);
  } else if (resources instanceof Object) {
    return resource in resources;
  }
}

/**
 * @typedef {string|number|boolean|null|Date} JSONScalars The JSON scalars.
 */

/**
 * The JSON Array.
 * @typedef {{[id:string]: (JSONScalars|JSONArray|JSONObject)} JSONArray
 */

/**
 * Test whether an object is a JSON object.
 * @param {any} value The tested value.
 * @param {object[]} alreadyHandled The already handled objects to
 * catch recursion.
 * @returns {boolean} True, if and only if the object is a JSON object.
 */
function isJSONObject(value, alreadyHandled = []) {
  const newAlreadyHandled = [...alreadyHandled, value];
  return (
    value instanceof Object &&
    ("toJSON" in value ||
      Object.getOwnPropertyNames(value).every((property) => {
        const tested = value[property];
        return (
          tested === undefined ||
          tested instanceof Function ||
          isJSONType(tested, newAlreadyHandled)
        );
      }))
  );
}

/**
 * Test, if the value is already handled.
 * @param {any} value The tested value.
 * @param {object[]} [alreadyHandled=[]] The already handled objects.
 * @returns {boolean} True, if and only if the given value is a valid
 * JSON type.
 */
function isJSONType(value, alreadyHandled = []) {
  if (alreadyHandled.find((entry) => entry === value)) {
    // Recursive structure with loop is not JSONifiable.
    return false;
  }
  switch (typeof value) {
    case "number":
    case "boolean":
    case "null":
      return true;
    case "string":
      // TODO: Checking for escapes, if necessary
      return true;
    case "object":
      if (value instanceof Date) {
        return true;
      } else if (value instanceof Array) {
        return value.every((entry) =>
          isJSONType(entry, [...alreadyHandled, value])
        );
      } else if ("toJSON" in value) {
        return true;
      } else {
        return isJSONObject(value, [...alreadyHandled]);
      }
  }
}

/**
 * Creates a JSON array.
 * @constructor
 * @param {JSONTypes[]} [values=[]] The values of the array.
 * @returns {Array<JSONTypes>} The array containing JSON types.
 * @throws {TypeError} The values array was invalid.
 */
function JSONArray(values = []) {
  if (values && values.every((value) => isJSONType(value))) {
    return [values];
  } else {
    throw new TypeError("All values must be JSON types");
  }
}

/**
 * The JSON Object or dictionary.
 * @typedef {Object.<string, {JSONScalars|JSONArray|JSONObject}>} JSONObject
 */

/**
 * @typedef {(string|number|boolean|null|Date|
 * Array<JSONTypes>|Object.<string, JSONTypes>)} JSONTypes The JSON types.
 */

/**
 * Test whether the give path is a valid resource path value.
 * @param {string|string[]} path The resource path.
 * @returns {boolean} True, if and only if the given resource path is a valid
 * resource path value.
 */
function validResourcePath(path) {
  if (path instanceof Array) {
    return path.every(
      (resourceName) =>
        typeof resourceName === "string" && validResourcePath(resourceName)
    );
  } else {
    return typeof path === "string" && validName(path);
  }
}

/**
 * Is the given resource a valid resource value.
 * @param {ResourceContainer} data The resource ontainer.
 * @param {string|string[]} resource A resource or a resource path.
 * @param {JSONTypes} json A JSON type of the value.
 * @returns {boolean} True, if and only if the given resource value
 * is a valid resource value.
 */
function validResource(data, resource, json) {
  if (
    hasDataResource(data, resource) ||
    (allowNewResources && validResourcePath(resource))
  ) {
    // Checking the content.
    return isJSONType(json);
  } else {
    return false;
  }
}

/**
 * Set a resource withing container.
 * @template TYPE The type o fhte resource value.
 * @param {ResourceContainer} source The data source.
 * @param {string|string[]} path The path wihting the source.
 * @param {TYPE} value The new value of the container.
 * @returns {Promise<never>} The promise of the completion of the
 * operation.
 */
function setDataResource(source, path, value) {
  return new Promise((resolve, reject) => {
    try {
      if (path instanceof Array) {
        getDataResource(source, path.slice(0, path.length - 1)).then(
          (parent) => {
            if (
              getDataResourceValidator(parent, path[path.length - 1])(value)
            ) {
            } else {
              throw ValidationError(
                "Invalid resource value",
                /** @type {ValidationErrorOptions} */ { propertyName: path }
              );
            }
          }
        );
      } else if (getDataResourceValidator(source, path)(value)) {
        source[path] = value;
        resolve();
      } else {
        throw (
          (ValidationError("Invalid resource value"), { propertyName: path })
        );
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get keys of the data source.
 * @template TYPE - The type of the data source values.
 * @param {ResourceContainer} dataSource The resource container.
 * @return {Promise<Array<string>>} The promise of keys.
 */
function getKeys(dataSource) {
  if (dataSource instanceof Map) {
    return Promise.resolve([...dataSource.keys()]);
  } else if (dataSource instanceof Object) {
    return Promise.resolve(Object.getOwnPropertyNames(dataSource));
  } else {
    return Promise.reject(new TypeError("Invalid data source"));
  }
}

/**
 * Get data entries.
 * @template TYPE - The type of the data source values.
 * @param {ResourceContainer} dataSource The resource container.
 * @returns {Promise<Array.<string, TYPE>>} The promise of entries.
 */
function getEntries(dataSource) {
  if (dataSource instanceof Map) {
    return Promise.resolve([...dataSource.entries()]);
  } else if (dataSource instanceof Object) {
    return Promise.resolve(
      Object.getOwnPropertyNames(dataSource).map((property) => [
        property,
        dataSource[property],
      ])
    );
  } else {
    return Promise.reject(new TypeError("Invalid data source"));
  }
}

/**
 * The map of next ids.
 */
const nextIds = new Map(
  getEntries(data).map(([resourceName, resources]) => {
    return [
      resourceName,
      getKeys(resources).reduce(
        (result, value) =>
          result === undefined || result < value ? value : result,
        undefined
      ),
    ];
  })
);

/**
 * Increment the string value.
 * @param {string} source The incremented string.
 * @param {number} [index] The index of the incrementation. Defaults to
 * the last index of the source. Any value greater than the last index of the source
 * is treated like as last index of the source.
 * @returns {string|undefined} The incremented string, if such value
 * exists.
 */
const stringIncrementer_usAsciiLetter = (source, index = source.length - 1) => {
  const increment = 1;
  if (typeof source !== "string" || !Number.isInteger(index) || index < 0) {
    return undefined;
  } else if (index >= source.length) {
    return stringIncrementer_usAsciiLetter(source);
  }
  // The index is within the source and is an integer.

  /**
   * Generate a string containing a letter order.
   * @param {number} index The letter index.
   * @param  {...Array.[string|number, string|number]} ranges The ranges of letters.
   * The numbers are treated as code points.
   */
  const letterOrderFunction = function* (index, ...ranges) {
    let cursor = 0;
    let end = ranges.length;
    const getRangeValue = (rangeValue) => {
      switch (typeof rangeValue) {
        case "number":
          return rangeValue;
        case "string":
          return rangeValue.codePointAt(0);
        default:
          return undefined;
      }
    };
    while (index < end - (cursor ? 0 : 1)) {
      let letter = getRangeValue(ranges[cursor][0]);
      while (letter <= getRangeValue(ranges[cursor][1])) {
        yield String.fromCodePoint(letter++);
      }
      index++;
    }
  };
  const validLetterRanges = [
    ["a", "z"],
    ["A", "Z"],
    ["0", "9"],
  ];
  const letterOrder = [
    ...letterOrderFunction(index, ...validLetterRanges),
  ].join("");
  const index = letterOrder.findIndex((letter) => letter === source[index]);
  if (index >= 0) {
    // The The letter exists in the incrementation order. 
    // - Incrementing the prefix part, if the incremented letter is the last letter
    //  of the order. 
    /* TODO: Add check whether we should decrement the index by 2 if the previous
    code point is surrogate taking 2 characters.
    */
    return index + increment >= letterOrder.length
      ? stringIncrementer_usAsciiLetter(source.substring(0, index), index)
          ?.concat(letterOrder[(index+increment)%letterOrder.length])
          ?.concat(source.substring(index + 1))
      : substring(0, index)
          .concat(letterOrder[index + 1])
          .concat(source.substring(index + 1));
  } else {
    // The letter is not within the increment bounds - ignoring it.
    /* TODO: Add check whether we should decrement the index by 2 if the previous
    code point is surrogate taking 2 characters.
    */
    return index
      ? stringIncrementer_usAsciiLetter(source, index - 1)
      : undefined;
  }
};

/**
 * Generate next identifier.
 * @template {string|number} TYPE The type of the wanted identifier.
 * @param {TYPE|undefined} [identifier] The current identifier.
 * @returns {TYPE|undefined} The next identifier. An undefined value
 * is returned, if there is no next identifier.
 * @throws {TypeError} The type of the identifier was invalid.
 * @throws {RangeError} The value of the identifier was invalid.
 */
function generateNextId(
  identifier = undefined,
  stringIncrementer = stringIncrementer_usAsciiLetter
) {
  if (typeof identifier === "undefined") {
    // Default uses integer identifiers.
    return 1;
  } else if (typeof identifier === "number") {
    if (identifier < 1) {
      throw RangeError("Invalid identifier");
    } else {
      return identifier + 1;
    }
  } else if (typeof identifier === "string") {
    const intValue = Number.parseInt(identifier);
    if (Number.isInteger(intValue)) {
      if (intValue < 1) {
        throw RangeError("Invalid identifier");
      } else {
        return intValue + 1;
      }
    } else {
      // Determining the next string.
      if (identifier.length) {
        if (identifier.length === maxIdLength) {
          // Updating the value.
          let goOn = true;
          let result = identifier.concat("");
          let index = identifier.length - 1;
          while (goOn && index >= 0) {
            if (
              (index === 0 && identifier[index] === "Z") ||
              (index > 0 && identifier[index] === "9")
            ) {
              // We do have have carry.
              result[index] = "a";
            } else {
              switch (identifier[index]) {
                case "z":
                  result[index] = "A";
                  break;
                case "Z":
                  result[index] = "0";
                  break;
                default:
                  result[index] = identifier[index].charCodeAt() + 1;
              }
              goOn = true;
            }
          }
        } else {
          return identifier + "a";
        }
      } else {
        return "a";
      }
    }
  } else {
    return undefined;
  }
}

/**
 * Generate new identifier for new resource.
 * @param {ResourceContainer} source The resource container.
 * @param {string|string[]} path The path to the resource.
 * @return {Promise<string>} The promise of the identifier.
 */
function generateId(source, path) {
  if (path instanceof Array) {
    if (path.length === 1) {
      return generateId(source, path[0]);
    } else if (path.length === 0) {
      return Promise.reject(new RangeError("Missing resource"));
    } else {
    }
  } else if (typeof path === "string") {
    if (path in nextIds) {
      const result = nextIds.get(path);
      nextIds.set(path, generateNextId(result));
      return Promise.resolve(result);
    } else {
      const result = generateNextId();
      nextIds.set(path, result + 1);
      return Promise.resolve(result);
    }
  } else {
    return Promise.reject(TypeError("Invalid resource"));
  }
}

/**
 *
 * @template TYPE the value of th
 * @param {ResourceContainer<TYPE>} source
 * @param {string|string[]} path The path of the created resource.
 * @param {TYPE} value The value of the resource.
 * @returns {Promise<string>} The promise of the identifier of the created resource.
 */
function createDataResource(source, path, value) {
  return new Promise((resolve, reject) => {
    try {
      if (hasDataResource(source, path)) {
        // The resource is already taken.
        reject(new RangeError("Resource already exists"));
      } else if (path instanceof Array) {
        setDataResource(
          getDataResource(source, path.slice(0, path.lenght - 1)),
          path[path.lenght - 1],
          value
        );
        resolve(path[path.length - 1]);
      } else {
        source[path] = value;
        resolve(path);
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * The data source handler root requests.
 * @param {import('express').Request} req The request of the root resource.
 * @param {import('express').Response} res The response of the request.
 */
const mainIndexPageHandler = (req, res, next) => {
  const mesgContent = [
    "Dune Campaing Aid Data Service",
    "This is data service for Dune Campaing Aid.",
  ];
  // TODO: Add content encoding - at the moment only support UTF-8.
  if (req.accepts("html")) {
    res.send(
      mesgContent.map((content, index) =>
        index ? `<p>${content}</p>` : `<h1>${content}</h1>`
      )
    );
  } else if (req.accepts("xml")) {
    // The XML repsonse.
    res.send(
      `<document>${mesgContent
        .map((content, index) =>
          index
            ? `<paragraph>${content}</paragraph>`
            : `<title>${content}</title>`
        )
        .join("\n")}</document>`
    );
  } else if (req.accepts("json")) {
    // The JSON response.
    res.json(
      mesgContent.reduce(
        (result, content, index) => {
          if (index) {
            result.content.push(content);
          } else {
            result.title = content;
          }
          return result;
        },
        { title: undefined, content: [] }
      )
    );
  } else if (req.accepts("text/plain")) {
    res.send(mesgContent.join("\n"));
  }
};

/**
 * The data source handler handling menu requests.
 * @param {import('express').Request} req The request of the menu resource.
 * @param {import('express').Response} res The response of the request.
 */
const menuResourceHandler = (req, res) => {
  res.json({ message: "Menu not yet supported", result: Error("Unsupported") });
};

/**
 * The data source handler handling data requests.
 * @param {import('express').Request} req The request of the data resource.
 * @param {import('express').Response} res The response of the request.
 */
const dataResourceHandler = (req, res) => {
  res.json({ message: "Data not yet supported", result: Error("Unsupported") });
};

/**
 * The error handler for all data requests.
 * @param {Error|string} error The request handling error.
 */
const dataErrorHandler = (error, req, res, next) => {
  // Testing situation.
  if (res.headersSent) {
    return next(error);
  }

  // Checking if we do have more specific reason for error.
  if (error == null) {
    next();
  } else if (error instanceof Error) {
    switch (error.name) {
      case "RangeError":
        // Not found.
        res.sendStatus(404);
      case "TypeError":
        // The required data type was not available.
        res.sendStatus(406);
      case "AuthError":
        // The request was forbidden - checking if the user was known.
        res.sendStatus(error.user ? 403 : 401);
    }
  }

  // The default response is "Bad Request".
  res.sendStatus(400);
};

// Parsing JSON body.
app.use(express.json());

// Registering paths.
app.get("/", mainIndexPageHandler);

// Registering the data error handler.
app.use("/data/:resource/:id", (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  dataErrorHandler(error, req, res, next);
});
app.use("/data/:resource/", (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  dataErrorHandler(error, req, res, next);
});

// Data error handling.
app.put("/data/:resource/:id", (req, res, next) => {
  // Replace a resource.
  if (hasResource(data, req.params.resource)) {
    validResource(req.params.resource, res.params.id, req.body).then(
      () => setResource(req.params.id, req.body),
      (error) => dataErrorHandler(error, req, res)
    );
  } else {
    next();
  }
});
app.put("/data/:resource", (req, res, next) => {
  // Create a new resource.
  next();
});
app.post("/data/:resource", (req, res, next) => {
  // Replace all resources.
  if (req.is("json")) {
    replaceAll(req.params.resource, req.body).then(
      () => res.sendStatus(200),
      dataErrorHandler
    );
  } else if (req.is("xml")) {
    // XML Content - not supported at the moment - XML is bad request.
    res.sendStatus(400);
  } else if (req.is("application/x-www-form-urlencoded")) {
    // Parsing the form data - Bad request as it is not yet supported
    res.sendStatus(400);
  } else {
    // Unkonown request - sending not found.
    res.sendStatus(404);
  }
  next();
});
// Get all resources.
app.get("/data/:resource", async (req, res) => {
  // get all resources.
  return await getAll(data, req.params.resource).then((entries) => {
    return res.json(entries);
    switch (req.accepts("json")) {
      case "json":
        return res.json(entries);
      default:
        return Promise.reject(TypeError("Media type not recognized"));
    }
  });
});
app.post("/data/:resource", (req, res) => {
  // replace all resources.
  const resourceName = req.params.resource;
  if (validResource(data, resourceName, req.body)) {
    if (hasDataResource(data, resourceName)) {
      setDataResource(data, resourceName, req.body).then(
        () => {
          res.sendStatus(200);
        },
        (error) => dataErrorHandler(error, req, res)
      );
    } else {
      createDataResource(data, resourceName, req.body).then(
        (created) => res.status(201).json(created),
        (error) => dataErrorHandler(error, req, res)
      );
    }
  } else {
    return res.sendStatus(404);
  }
});
app.get("/data/", dataResourceHandler);
app.get("/menu/", menuResourceHandler);

app.listen(PORT, () => {
  logger.log(`Dune Rest server running on ${PORT}`);
});

logger.log("Dune Rest Service!");
