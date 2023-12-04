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

const mainIndexPageHandler = (req, res) => {

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
  res.json({message: "Menu not yet supported", result: Error("Unsupported")});
};

app.get("/", mainIndexPageHandler);
app.get("/data/", dataResourceHandler);
app.get("/menu/", menuResourceHandler);

logger.log("Dune Rest Service!");
