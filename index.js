import express from "express";
const app = express();
const logger = console;
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
    action: "/file"
  },
  skills: {
    title: "Skills",
    action: "/data/skills"
  },
  drives: {
    title: "Drives",
    action: "/data/drives"
  },
  traits: {
    title: "Traits",
    action: "/data/traits"
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
        action: "/account/login"
      },
      logout: {
        title: "Sign Out",
        hide: "!logged",
        action: "/account/logout"
      },
      signup: {
        title: "Register",
        hide: "!logged",
        action: "/account/register"
      }
    },
    align: "right"
  },
});

/**
 * The menu stored in the memory.
 */
const menu = defaultMenu();

/**
 * The in memory data.
 */
const data = {
  skills: {
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
 * The data source handler root requests.
 * @param {import('express').Request} req The request of the root resource.
 * @param {import('express').Response} res The response of the request.
 */
const mainIndexPageHandler = (req, res, next) => {
  const mesgContent = ["Dune Campaing Aid Data Service", 
  "This is data service for Dune Campaing Aid."];
  // TODO: Add content encoding - at the moment only support UTF-8.
  if (req.accepts("html")) {
  res.send(mesgContent.map( (content, index) => (
    index ? `<p>${content}</p>` : `<h1>${content}</h1>`
  )));
  } else if (req.accepts("xml")) {
    // The XML repsonse.
    res.send(`<document>${
      mesgContent.map( (content, index) => (
        index ? `<paragraph>${content}</paragraph>` : `<title>${content}</title>`
      )).join("\n")
    }</document>`)
  } else if (req.accepts("json")) {
    // The JSON response.
    res.json(mesgContent.reduce( (result, content, index) => {
      if (index) {
        result.content.push(content)
      } else {
        result.title = content;
      }
      return result;
    }, {title: undefined, content: []}))
  } else if (req.accepts("text/plain")) {
    res.send(mesgContent.join("\n"))
  }
};

/**
 * The data source handler handling menu requests.
 * @param {import('express').Request} req The request of the menu resource.
 * @param {import('express').Response} res The response of the request.
 */
const menuResourceHandler = (req, res) => {
  res.json({message: "Menu not yet supported", result: Error("Unsupported")});
};

/**
 * The data source handler handling data requests.
 * @param {import('express').Request} req The request of the data resource.
 * @param {import('express').Response} res The response of the request.
 */
const dataResourceHandler = (req, res) => {
  res.json({message: "Data not yet supported", result: Error("Unsupported")});
};

// Registering paths.
app.get("/", mainIndexPageHandler);
app.get("/data/", dataResourceHandler);
app.get("/menu/", menuResourceHandler);

app.listen(PORT, () => {
  logger.log(`Dune Rest server running on ${PORT}`);
});

logger.log("Dune Rest Service!");
