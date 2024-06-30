/**
 * The color support.
 * @module
 */

/**
 * The RGB value as an array of color values.
 * @typedef {[red: number, green: number, blue: number]} RGBArray
 */

/**
 * THe RGB valeu as an object.
 * @typedef {Object} RGBObject
 * @property {number} red The red color value.
 * @property {number} green The green color value.
 * @property {number} blue The blue color value.
 */

/**
 * RGB color definition.
 * @typedef {RGBArray|RGBObject} RGB
 */

/**
 * Is the given value valid RGB valie.
 * @param {*} value The tested value.
 * @returns {boolean} True, if and only if the value is RGB.
 */
export function isRGB(value) {
  function validRgbValue(value) {
    return Number.isSafeInteger(value) && value >= 0 && value <= 255;
  }
  switch (typeof value) {
    case "string":
      /** TODO rgb support */
      return false;
    case "number":
      return Number.isSafeInteger(value) && value >= 0 && value < 2 ** 24;
    case "object":
      if (value instanceof Array) {
        return value.length >= 3 && value.slice(0, 3).every(validRgbValue);
      } else {
        return ["red", "green", "blue"].every(
          (prop) => prop in value && validRgbValue(value[prop])
        );
      }
    default:
      return false;
  }
}

/**
 * Check if a value is a RGB value. A value is a valid RGB value, if it is either
 * integer representing a 24 bit RGB value, a string containing RGB value in format
 * #<rr><gg><bb>[<aa>], or a valid REB array, or a valid RGB object.
 * @param {*} value The checked value.
 * @returns {RGB} THe valid RGB value derrived from the value.
 * @throws {TYpeError} The parameter was not a vlaid RGB value.
 */
export function checkRGB(value) {
  if (!isRGB(value)) {
    throw new TypeError("Value is not a RGB value");
  } else if (typeof value === "string") {
    return [
      Number.parseInt(value.substring(1, 2), 16),
      Number.parseInt(value.substring(3, 4), 16),
      Number.parseInt(value.substring(5, 6), 16),
    ];
  } else if (typeof value === "number") {
    return [(number >> 16) & 0xff, (number >> 8) & 0xff, (number >> 0) & 0xff];
  } else if (Array.isArray(value)) {
    return value;
  } else {
    return value;
  }
}

/**
 * The RGB value as an array of color values.
 * @typedef {[red: number, green: number, blue: number, alpha: number]} RGBAArray
 */

/**
 * THe RGB valeu as an object.
 * @typedef {Object} RGBAObject
 * @property {number} red The red color value.
 * @property {number} green The green color value.
 * @property {number} blue The blue color value.
 * @property {number} alpha The alpha channel value.
 */

/**
 * RGBA color definition.
 * @typedef {RGBAArray|RGBAObject} RGBA
 */

/**
 * @typedef {Object} FormatOptions
 * @property {number} [minLength] THe minimum length of the format.
 * @property {number} [maxLength] The maximum lenght of the format.
 */

/**
 *Convert a positive integer value to hex.
 * @param {number} value The integer value.
 * @param {FormatOptions} [options] The hex options.
 * @returns {string} THe hex string reprsentation of the given value. The result is zero-padded
 * on high-end, and excess most significant hex digits are removed.
 * @throws {RangeError} The value was not a safe integer, or was a negative safe
 * integer.
 */
export function toHex(value, options = {}) {
  const opt = { minDigits: 2, maxDigits: 2, ...options };
  if (Number.isSafeInteger(value) && value >= 0) {
    const base = value.toString(16);
    const prefix = "0".repeat(
      Math.max(0, (opt.minDigits ?? base.length) - base.length)
    );
    const result = `${prefix}${base}`;
    if (result.length > (opt.maxDigits ?? base.length)) {
      return result.substring(result.length - opt.maxDigits);
    } else {
      return result;
    }
  } else {
    throw new RangeError("Only positive integers cna be converted to hex");
  }
}

/**
 * The parse hex options.
 * @typedef {Object} ParseHexOptions
 * @property {number} [bytes=2] The number of bytes the hex contains.
 * @property {string} [message="Invalid value"] The error message on failed parse.
 */

/**
 * The default parse hex otions.
 * @type {Required<ParseHexOptions>}
 */
const defualtParseHexOptions = { bytes: 2, message: "Invalid value" };

/**
 * Parse a hex value.
 * @param {string} value The parsed string.
 * @param {ParseHexOptions} [options] THe parse options.
 * @returns {number} THe hex value.
 * @throws {TypeError} THe valeu was not a valid string representaiton of a hex.
 */
function parseHex(value, options = {}) {
  const { bytes, message } = { ...defualtParseHexOptions, ...options };
  const regex = new RegExp(
    "^(?:0x|#)?" + `([a-f0-9]{${2 * bytes}})` + "$",
    "i"
  );
  if (regex.test(value)) {
    return Number.parseInt(value.substring(value.length - 2 * bytes), 16);
  }
  throw new TypeError(message);
}

/**
 * Check hex word.
 * @param {any} value The hex word as string or as a number.
 * @param {ParseHexOptions} [options] The parse options.
 * @returns {number} The word value as an integer number.
 * @throws {TypeError} The value was ivnalid.
 */
function checkHexWord(value, options = {}) {
  const { bytes, message } = { ...defualtParseHexOptions, ...options };
  switch (typeof value) {
    case "string":
      return parseHex(value, options);
    case "number":
      if (Number.isSafeInteger(value) && value >= 0 && value < 2 ** bytes) {
        return value;
      }
    default:
  }
  throw new TypeError(message);
}

/**
 * Create a rgb object.
 * @param {number|hex} red THe red color value.
 * @param {number|hex} green The green color value.
 * @param {number|hex} blue The blue color value.
 * @returns {RGBObject} The RGB object.
 */
export function rgb(red, green, blue) {
  return {
    red: checkHexWord(red, { bytes: 2, message: "Invalid red color value" }),
    gree: checkHexWord(green, {
      bytes: 2,
      message: "Invalid green color value",
    }),
    blue: checkHexWord(blue, { bytes: 2, message: "Invalid blue color value" }),
    toString() {
      return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
    },
  };
}

/**
 * Create a rgba object.
 * @param {number|hex} red THe red color value.
 * @param {number|hex} green The green color value.
 * @param {number|hex} blue The blue color value.
 * @param {number|hex} alpha The alpha channel value.
 * @returns {RGBObject} The RGB object.
 */
export function rgba(red, green, blue, alpha = 255) {
  return {
    ...rgb(red, green, blue),
    alpha: checkHexWord(alpha, {
      bytes: 2,
      message: "Invalid alpha channel value",
    }),
    toString() {
      return `#${toHex(red)}${toHex(green)}${toHex(blue)}${toHex(alpha)}`;
    },
  };
}

/**
 * Definition of a color.
 * @extends {StyleDef}
 */
export class ColorDef {
  /**
   * Create color definition from RGB.
   * @param {RGB} [foreground] The foreground color. Defaults to the current
   * color.
   * @param {RGB} [background] The background color. Defaults to the current
   * color.
   */
  static fromRGB(foreground = undefined, bacground = undefined) {
    return new ColorDef().rgbForeground(foreground).rgbBackground(background);
  }

  /**
   * Create a new color definition.
   */
  constructor() {
    this.foreground = "";
    this.background = "";
  }

  get color() {
    return `${this.foreground}${this.background}`;
  }

  /**
   * Set the foreground from RGB value.
   * @param {RGB} [rgbForeground] The new RGB foreground.
   * @returns {ColorDef} The color definition with RGB foreground set to the givne value.
   */
  rgbForeground(rgbForeground) {
    if (rgbForeground !== undefined) {
      const rgb = checkRGB(rgbForeground);
      const [red, green, blue] = Array.isArray(rgb)
        ? rgb
        : [rgb.red, rgb.green, rgb.blue];
      this.foreground = AnsiColorSupport.rgbForeground(red, green, blue);
    } else {
      this.foreground = "";
    }
    return this;
  }

  /**
   * Set the background from RGB value.
   * @param {RGB} [rgbBackground] The new RGB background.
   * @returns {ColorDef} The color definition with RGB background set to the givne value.
   */
  rgbBackground(rgbBackground) {
    if (rgbBackground !== undefined) {
      const rgb = checkRGB(rgbBackground);
      const [red, green, blue] = Array.isArray(rgb)
        ? rgb
        : [rgb.red, rgb.green, rgb.blue];
      this.background = AnsiColorSupport.rgbBackground(red, green, blue);
    } else {
      this.backround = "";
    }
    return this;
  }

  /**
   * Set colro by the code.
   * @param {number} code The ANSI color code.
   */
  colorCode(code) {
    const scheme = [
      AnsiColorSupport.COLORS.foreground,
      AnsiColorSupport.COLORS.background,
    ].find((scheme) => scheme.first <= color && color <= scheme.last);
    if (scheme === AnsiColorSupport.COLORS.foreground) {
      this.foreground = scheme.toAnsiCommand(code);
    } else if (scheme === AnsiColorSupport.COLORS.background) {
      this.background = scheme.toAnsiCommand(code);
    } else {
      this.foreground = "";
      this.background = "";
    }
  }
}

/**
 * The style definition.
 * @typedef {Object} StyleDef
 * @property {string} color The ansi color of the style.
 */

/**
 * A color scheme.
 * @typedef {Object} ColorScheme
 * @property {number} first The first valid value.
 * @property {number} last The last valid value.
 * @property {(number)=>boolean} has Does the scheme contain color value.
 * @property {(number)=>string} toAnsiCommand Get ANSI command starting the color.
 * @property {Record<string, number>} [colors] The mapping from color names to the color codes.
 * @property {Record<string, ColorScheme>} [members] The sub scheme of the current scheme.
 */

/**
 * Class creating ANSI color support for loggers.
 */
export class AnsiColorSupport {
  /**
   * The escape sequence start.
   */
  static ESCAPE = "\u001b";

  /**
   * Color reset.
   */
  static RESET = `${this.ESCAPE}0m`;

  /**
   * Get the escape starting a foreground color.
   * @param {number} code The color code.
   * @returns {string} THe ANSI escape starting the foreground color.
   */
  static foreground(code) {
    if (
      code >= this.COLORS.foreground.first &&
      code <= this.COLORS.foreground.last
    ) {
      return `${this.COLOR_COMMAND_START}${code}${this.COLOR_COMMAND_END}`;
    } else {
      return "";
    }
  }

  /**
   * Get the escape starting a background color.
   * @param {number} code The color code.
   * @returns {string} THe ANSI escape starting the background color.
   */
  static background(code) {
    if (
      code >= this.COLORS.background.first &&
      code <= this.COLORS.background.last
    ) {
      return `${this.COLOR_COMMAND_START}${code}${this.COLOR_COMMAND_END}`;
    } else {
      return "";
    }
  }

  /**
   * The color schemes.
   * @type {Record<string, ColorScheme>}
   */
  static COLORS = {
    foreground: {
      /**
       * The first value of scheme.
       * @type {number}
       */
      first: 30,
      /**
       * The last value of scheme.
       * @type {number}
       */
      last: 37,
      /**
       * The mapping from known color names to the color values.
       * @type {Record<string, number>}
       */
      colors: {
        default: 39,
        ...[
          "black",
          "red",
          "green",
          "yellow",
          "blue",
          "magenta",
          "cyan",
          "white",
        ].map((name, index) => ({ name: index + this.first })),
      },
      has(code) {
        return (
          code === this.colors.default ||
          (this.first <= code && code <= this.last)
        );
      },
      toAnsiCommand: AnsiColorSupport.foreground,
    },
    background: {
      /**
       * The first value of scheme.
       * @type {number}
       */
      first: 40,
      /**
       * The last value of scheme.
       * @type {number}
       */
      last: 47,
      /**
       * The mapping from known color names to the color values.
       * @type {Record<string, number>}
       */
      colors: {
        default: 49,
        ...[
          "black",
          "red",
          "green",
          "yellow",
          "blue",
          "magenta",
          "cyan",
          "white",
        ].map((name, index) => ({ name: index + this.first })),
      },
      has(code) {
        return (
          code === this.colors.default ||
          (this.first <= code && code <= this.last)
        );
      },
      toAnsiCommand: AnsiColorSupport.background,
    },
    standard: {
      /**
       * The first value of scheme.
       * @type {number}
       */
      first: 0,
      /**
       * The last value of scheme.
       * @type {number}
       */
      last: 15,
      members: {
        standard: {
          /**
           * The first value of scheme.
           * @type {number}
           */
          first: 0,
          /**
           * The last value of scheme.
           * @type {number}
           */
          last: 7,
          /**
           * The mapping from known color names to the color values.
           * @type {Record<string, number>}
           */
          colors: {
            ...[
              "black",
              "red",
              "green",
              "yellow",
              "blue",
              "magenta",
              "cyan",
              "white",
            ].map((name, index) => ({ name: index + this.first })),
          },
          members:{
            foreground: {
              get first() {
                return AnsiColorSupport.COLORS.standard.members.standard.first;
              },
              /**
               * The last value of scheme.
               * @type {number}
               */
              get last() {
                return AnsiColorSupport.COLORS.standard.members.standard.last;
              },
              get colors() {
                return AnsiColorSupport.COLORS.standard.members.standard.colors;
              },
              has(code) {
                return (
                  AnsiColorSupport.first <= code &&
                  code <= AnsiColorSupport.last
                );
              },
              toAnsiCommand: AnsiColorSupport.extentedCodeForeground,
            },
            background: {
              get first() {
                return AnsiColorSupport.COLORS.standard.members.standard.first;
              },
              /**
               * The last value of scheme.
               * @type {number}
               */
              get last() {
                return AnsiColorSupport.COLORS.standard.members.standard.last;
              },
              get colors() {
                return AnsiColorSupport.COLORS.standard.members.standard.colors;
              },
              has(code) {
                return AnsiColorSupport.first <= code && code <= AnsiColorSupport.last;
              },

              toAnsiCommand: AnsiColorSupport.extentedCodeBackground,
            },
          },
        },

        highIntencity: {
          /**
           * The first value of scheme.
           * @type {number}
           */
          first: 8,
          /**
           * The last value of scheme.
           * @type {number}
           */
          last: 15,
          colors: [
            "black",
            "red",
            "green",
            "yellow",
            "blue",
            "magenta",
            "cyan",
            "white",
          ].map((name, index) => ({ name: index + this.first })),
          members: {
            foreground: {
              /**
               * The first value of scheme.
               * @type {number}
               */
              get first() {
                return AnsiColorSupport.COLORS.standard.members.highIntencity.first;
              },
              /**
               * The last value of scheme.
               * @type {number}
               */
              get last() {
                return AnsiColorSupport.COLORS.standard.members.highIntencity.last;
              },
              get colors() {
                return AnsiColorSupport.COLORS.standard.members.highIntencity.colors;
              },
              has(code) {
                return this.first <= code && code <= this.last;
              },
              toAnsiCommand: AnsiColorSupport.extentedCodeForeground,
            },
            background: {
              /**
               * The first value of scheme.
               * @type {number}
               */
              get first() {
                return AnsiColorSupport.COLORS.standard.members.highIntencity.first;
              },
              /**
               * The last value of scheme.
               * @type {number}
               */
              get last() {
                return AnsiColorSupport.COLORS.standard.members.highIntencity.last;
              },
              get colors() {
                return AnsiColorSupport.COLORS.standard.members.highIntencity.colors;
              },
              has(code) {
                return this.first <= code && code <= this.last;
              },

              toAnsiCommand: AnsiColorSupport.extentedCodeBackground,
            },
          },
        },
      },
      has(code) {
        return (
          Number.isSafeInteger(code) && this.first <= code && code <= this.last
        );
      },
    },

    /**
     * Extended additional colors of 6 groups of 36 colors.
     */
    extended: {
      first: 16,
      last: 231,
      members: {
        foreground: {
          /**
           * The first value of scheme.
           * @type {number}
           */
          get first() {
            return AnsiColorSupport.COLORS.extended.first;
          },
          /**
           * The last value of scheme.
           * @type {number}
           */
          get last() {
            return AnsiColorSupport.COLORS.extended.last;
          },
          /**
           * The mapping from known color names to the color values.
           * @type {Record<string, number>}
           */
          get colors() {
            return {};
          },
          has(code) {
            return this.first <= code && code <= this.last;
          },
          toAnsiCommand: AnsiColorSupport.extentedCodeForeground,
        },
        background: {
          get first() {
            return AnsiColorSupport.COLORS.extended.first;
          },
          /**
           * The last value of scheme.
           * @type {number}
           */
          get last() {
            return AnsiColorSupport.COLORS.extended.last;
          },
          /**
           * The mapping from known color names to the color values.
           * @type {Record<string, number>}
           */
          get colors() {
            return {};
          },
          has(code) {
            return this.first <= code && code <= this.last;
          },

          toAnsiCommand: AnsiColorSupport.extentedCodeBackground,
        },
      },
      has(code) {
        return (
          Number.isSafeInteger(code) && this.first <= code && code <= this.last
        );
      },
    },
    /**
     * Grayscale colors.
     */
    greyscale: {
      first: 232,
      last: 255,
      members: {
        foreground: {
          get first() {
            return AnsiColorSupport.COLORS.greyscale.first;
          },
          /**
           * The last value of scheme.
           * @type {number}
           */
          get last() {
            return AnsiColorSupport.COLORS.greyscale.last;
          },
          /**
           * The mapping from known color names to the color values.
           * @type {Record<string, number>}
           */
          get colors() {
            return {};
          },
          has(code) {
            return this.first <= code && code <= this.last;
          },
          toAnsiCommand: AnsiColorSupport.extentedCodeForeground,
        },
        background: {
          get first() {
            return AnsiColorSupport.COLORS.greyscale.first;
          },
          /**
           * The last value of scheme.
           * @type {number}
           */
          get last() {
            return AnsiColorSupport.COLORS.greyscale.last;
          },
          /**
           * The mapping from known color names to the color values.
           * @type {Record<string, number>}
           */
          get colors() {
            return {};
          },
          has(code) {
            return this.first <= code && code <= this.last;
          },

          toAnsiCommand: AnsiColorSupport.extentedCodeBackground,
        },
      },
      has(code) {
        return (
          Number.isSafeInteger(code) && this.first <= code && code <= this.last
        );
      },
    },
    rgb: {
      first: 0,
      last: 2 ** 24 - 1,
      mambers: {
        foreground: {
          get first() {
            return AnsiColorSupport.COLORS.rgb.first;
          },
          /**
           * The last value of scheme.
           * @type {number}
           */
          get last() {
            return AnsiColorSupport.COLORS.rgb.last;
          },
          /**
           * The mapping from known color names to the color values.
           * @type {Record<string, number>}
           */
          get colors() {
            return {};
          },
          has(code) {
            return this.first <= code && code <= this.last;
          },
          toAnsiCommand: AnsiColorSupport.rgbForeground,
        },
        background: {
          get first() {
            return AnsiColorSupport.COLORS.rgb.first;
          },
          /**
           * The last value of scheme.
           * @type {number}
           */
          get last() {
            return AnsiColorSupport.COLORS.rgb.standard.last;
          },
          get colors() {
            return {};
          },
          has(code) {
            return this.first <= code && code <= this.last;
          },

          toAnsiCommand: AnsiColorSupport.rgbBackground,
        },
      },
      has(code) {
        return (
          Number.isSafeInteger(code) && this.first <= code && code <= this.last
        );
      },
    },
  };

  /**
   * Get the RGB color section of the color commmand.
   * @param {number} red The red color code from 0 to 255.
   * @param {number} green The green color code from 0 to 255.
   * @param {number} blue  The blue color code from 0 to 255.
   * @returns {string} The color defining string.
   */
  static rgbColor(red, green, blue) {
    return `;${red};${green};${blue}`;
  }

  /**
   * Get extended color scheme ANSI foreground color start.
   * @param {number} code The extended color code from 0 to 255.
   * @returns {string} The color defining escape sequence.
   */
  static extentedCodeForeground(code) {
    return `${this.ESCAPE}${this.COLOR_COMMAND_START}${this.EXTENDED_FOREGROUND_COLOR};${code}${this.COLOR_COMMAND_END}`;
  }

  /**
   * Get extended color scheme ANSI backgorundground color start.
   * @param {number} code The extended color code from 0 to 255.
   * @returns {string} The color defining escape sequence.
   */
  static extentedCodeBackground(code) {
    return `${this.ESCAPE}${this.COLOR_COMMAND_START}${this.EXTENDED_BACKGROUND_COLOR};${code}${this.COLOR_COMMAND_END}`;
  }

  /**
   * Get the RGB color schemee ANSI foreground color start.
   * @param {number} red The red color code from 0 to 255.
   * @param {number} green The green color code from 0 to 255.
   * @param {number} blue  The blue color code from 0 to 255.
   * @returns {string} The ANSI foreground color start.
   */
  static rgbForeground(red, green, blue) {
    return `${this.ESCAPE}[${this.RGB_FOREGROUND_COLOR}${rgbColor(
      red,
      green,
      blue
    )}${this.COLOR_COMMAND_END}`;
  }

  /**
   * Get the RGB color schemee ANSI background color start.
   * @param {number} red The red color code from 0 to 255.
   * @param {number} green The green color code from 0 to 255.
   * @param {number} blue  The blue color code from 0 to 255.
   * @returns {string} The ANSI background color start.
   */
  static rgbBackground(red, green, blue) {
    return `${this.ESCAPE}[${this.RGB_BACKGROUND_COLOR}${rgbColor(
      red,
      green,
      blue
    )}${this.COLOR_COMMAND_END}`;
  }

  /**
   * The command starting color command.
   */
  static COLOR_COMMAND_START = "[";

  /**
   * The parameter to end the color command.
   */
  static COLOR_COMMAND_END = "m";

  /**
   * The start of the command to set foregournd extended color.
   */
  static EXTENDED_FOREGROUND_COLOR = "38;5";

  /**
   * The start of the command to set backgorund extended color.
   */
  static EXTENDED_BACKGROUND_COLOR = "48;5";

  static RGB_FOREGRUND_COMMAND = "38;2";

  static RGB_BACKGRUND_COMMAND = "48;2";

  constructor() {}

  /**
   * Get text with foregorund color.
   * @param {number|RGB|ColorDef|StyleDef} color The color.
   * @param {string} text The colored text.
   * @returns {string} The text with ANSI color codes.
   */
  foregroundColor(color, text) {
    const def = {};
    switch (typeof color) {
      case "number":
      case "string":
      case "object":

      default:
    }

    return color(def, text);
  }

  /**
   * Get text with backgorund color.
   * @param {number|RGB|ColorDef|StyleDef} color The color.
   * @param {string} text The colored text.
   * @returns {string} The text with ANSI color codes.
   */
  backgroundColor(color, text) {
    const def = {};
    return color(def, text);
  }

  /**
   * Color text.
   * @param {string|number|RGB|ColorDef|StyleDef} color The color used.
   * @param {string} text The colored text.
   * @returns {string} The text with ANSI color prefix, if necessary.
   */
  color(color, text) {
    if (color instanceof ColorDef) {
      const def = color;
      return `${def.color ?? ""}${text}${
        def.reset ? AnsiColorSupport.RESET : ""
      }`;
    } else {
      const def = {};
      switch (typeof color) {
        case "string":
          // Name of foreground color.
          if (color in (AnsiColorSupport.COLORS.foreground.colors ?? {})) {
            def.color = color(AnsiColorSupport.COLORS.foreground.colors[color]);
          }
          // Name of background color.
          if (color in (AnsiColorSupport.COLORS.background.colors ?? {})) {
            def.color = color(AnsiColorSupport.COLORS.background.colors[color]);
          }
          break;
        case "number":
          // THe color is a number.
          if (Number.isSafeInteger(number)) {
            // THe color is a number representation of the color.

            const colorScheme = [
              AnsiColorSupport.COLORS.foreground,
              AnsiColorSupport.COLORS.background,
            ].find((range) => range.first <= color && color <= range.last);
            if (colorScheme) {
              def.color = colorScheme.toAnsiCommand(color);
            }
          }
          break;
        case "object":
          // Check which kind of object.
          if (isRGB(color)) {
            // RGB foreground.
            def.color = AnsiColorSupport.rgbForeground(color);
          }
        default:
          // Unknown color.
      }
      return `${def.color ?? ""}${text}${
        def.reset ? AnsiColorSupport.RESET : ""
      }`;
    }
  }
}
