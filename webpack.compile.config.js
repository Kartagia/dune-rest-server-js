
/**
 * The webpack configuraiton compiling modules into a library the express can use.
 */
const path = require('path');

module.exports = [{
    entry: {menu: "./src/[name].mjs", people: "./src/[name].mjs"},
    output: {
        path: path.resolve(__dirname, "lib"),
        filename: '[name].js',
        globalObject: 'this',
        library:  {
            name: '[name]',
            type: 'umd'
        }
    }
}];