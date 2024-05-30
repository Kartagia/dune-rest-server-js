
/**
 * Webpack packaging the server into distribution foldef.
 */
const path = require("path");
const libraryDependencies = require("./webpack.compile.config.js");

const context = path.resolve(__dirname, "src");

module.exports = [
    {
        "output": {
            "filename": "./dist-amd.js",
            library: {
                type: 'umd',
            },
            path: path.resolve(__dirname, "dist")
        },
        name: "umd",
        entry: "./server.cjs",
        mode: "production",
        context
    },
    {
        "output": {
            "filename": "./dist-commonjs.js",
            library: {
                type: 'commonjs',
            },
            path: path.resolve(__dirname, "dist")
        },
        name: "commonjs",
        entry: "./server.cjs",
        mode: "production",
        context
    },
    {
        "output": {
            "filename": "./dist-commonjs-dev.js",
            library: {
                type: 'commonjs',
            },
            path: path.resolve(__dirname, "dist")
        },
        name: "commonjs",
        entry: "./server.cjs",
        mode: "development",
        context
    },

];