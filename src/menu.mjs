
/**
 * @module menu
 * 
 * The module containing menu related methods.
 */

/**
 * The default menu structure.
 */
export const defaultMenu = () => ({
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

export default {
    defaultMenu
}