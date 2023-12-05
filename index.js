import express from "express";
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
 * The model of a skill.
 * @typedef {Object} SkillModel
 * @property {string} name The name of the skill.
 * @property {string} [title] The title of the skill. Defaults to the
 * name.
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
const wordRe = /\p{Lu}\p{Ll}*/ug;


/**
 * Test validity of a skill name.
 * @param {string} name The tested skill name.
 * @returns {boolean} True, if and only if the name is a valid skill name.
 */
export const validSkillName = (name) => {
  return (
    validName(name) &&
    RegExp(
      "^" + "(?<name>" + wordRe + "(?:[\\s\\-]" + wordRe + ")*" + ")" + "$",
      "ug"
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
export const createSkillModel = (skillName, skillTitle=undefined, abbreviation=undefined, description=undefined) => {
  if (!validSkillName(skillName)) {
    throw (typeof skillName === "string"
    ? new RangeError("Invalid skill name")
    : new TypeError("Invalid skill name"));
  }
  if (abbreviation && !validAbbreviation(abbreviation)) {
    throw (typeof abbreviation === "string"
    ? new RangeError("Invalid skill abbreviation")
    : new TypeError("Invalid skill abbreviation"));    
  }
  
  return /** @type {SkillModel} */ {
    name: skillName,
    title: skillTitle ? skillTitle : skillName,
    description, 
    abbreviation
  }
}

/**
 * A function converting a value into a string.
 * @template SOURCE
 * @callback ToStringer
 * @param {SOURCE} value The value converted to a string.
 * @returns {string} The string representation of the value.
 */

/**
 * The model value represents a reference to a model value.
 * @template MODEL The type of the contained value.
 * @template VALUE The type of the value.
 * @typedef {Object} ModelValue
 * @property {string[]} ref The reference of the resource. The refernce
 * must refer to a rsource of model type.
 * @property {VALUE} value The value of the resource.
 * @property {Getter<VALUE>|undefined} get The getter of the value.
 * If undefined, the value is write only.
 * @property {Setter<VALUE>|undefined} set The setter of the value.
 * If undefined, the value is read only.
 * @property {ToStringer<MODEL>} toString The converter of the model
 * to string.
 */

/**
 * A container storing resources
 * @template TYPE The type of the content.
 * @typedef {Object.<string, TYPE|Container<TYPE>>} ResourceContainer<TYPE>
 */

/**
 * The in memory data.
 * @type {ResourceContainer<any>}
 */
const data = {
  skills: /** @type {Conteainer<SkillModel>} */ {
    template: {
      name: { desc: "The name of the skill", type: "string" },
      title: { desc: "The title of the skill", type: "string" },
      description: {
        desc: "The description of the skill",
        type: "string",
        optional: true,
      },
    },
    ...["Battle", "Communcation", "Duty", "Move", "Understand"].map(
      (name, index) => ({ [index]: { name, title: name } })
    ),
  },
  traits: {
    template: {
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
    template: {
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
    ...["Duty", "Faith", "Justice", "Power", "Truth"].map((name, index) => ({
      [index]: { name, title: name },
    })),
  },
};

/**
 *
 * @param {*} data
 * @param {*} resource
 */
const hasDataResource = (data, resource) => {
  if (resource instanceof Array) {
  } else {
  }
};

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
app.use("/data/:resource/:id", (error, req, res, next) => {});
app.use("/data/:resource/", (error, req, res, next) => {});

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
      res.sendStatus(200),
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
app.get("/data/:resource", (req, res) => {
  // get all resources.
  return getAll(data, req.params.resource).then((entries) => {
    switch (res.accepts("json")) {
      case "json":
      default:
        return Promise.reject(TypeError("Media type not recognized"));
    }
  });
});
app.post("/data/:resource", (req, res) => {
  // replace all resources.
});
app.get("/data/", dataResourceHandler);
app.get("/menu/", menuResourceHandler);

app.listen(PORT, () => {
  logger.log(`Dune Rest server running on ${PORT}`);
});

logger.log("Dune Rest Service!");
