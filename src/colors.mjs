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
 * 
 * @param {*} value The tested valeu.
 * @returns {boolean} True, if and only if the value is valid
 * RGB component value.
 */
export function isValidRGBComponentValue(value) {
  return Number.isSafeInteger(value) && value >= 0 && value <= 255;
}

/**
 * Is the given value valid RGB value.
 * @param {*} value The tested value.
 * @returns {boolean} True, if and only if the value is RGB.
 */
export function isRGB(value) {
  function validRgbValue(value) {
    isValidRGBComponentValue(value);
  }
  switch (typeof value) {
    case "string":
      return /^\#(?:[0-9a-fA-F]{2}){3,4}$/.test(value);
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
 * Is the given value valid RGBA value.
 * @param {*} value The tested value.
 * @returns {boolean} True, if and only if the value is RGB.
 */
export function isRGBA(value) {
  switch (typeof value) {
    case "string":
      return /^\#(?:[0-9a-fA-F]{2}){4}$/.test(value);
    case "number":
      return Number.isSafeInteger(value) && value >= 0 && value < 2 ** 32;
    case "object":
      if (value instanceof Array) {
        return value.length >= 4 && value.slice(0, 4).every(validRgbValue);
      } else {
        return ["red", "green", "blue", "alpha"].every(
          (prop) => prop in value && validRgbValue(value[prop])
        );
      }
    default:
      return false;
  }
}


/**
 * Check if a value is a RGBA value. A value is a valid RGBA value, if it is either
 * integer representing a 32 bit RGB value, a string containing RGBA value in format
 * #<rr><gg><bb><aa>, or a valid REBA array, or a valid RGBA object.
 * @param {*} value The checked value.
 * @returns {RGBA} THe valid RGB value derrived from the value.
 * @throws {TYpeError} The parameter was not a vlaid RGB value.
 */
export function checkRGBA(value) {
  if (!isRGBA(value)) {
    throw new TypeError("Value is not a RGBA value");
  } else if (typeof value === "string") {
    return [
      Number.parseInt(value.substring(1, 2), 16),
      Number.parseInt(value.substring(3, 4), 16),
      Number.parseInt(value.substring(5, 6), 16),
      Number.parseInt(value.substring(7, 8), 16),
    ];
  } else if (typeof value === "number") {
    return [(number >> 24) & 0xff, (number >> 16) & 0xff, (number >> 8) & 0xff, (number >> 0) & 0xff];
  } else {
    return value;
  }
}


/**
 * The format opötions.
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
    throw new RangeError("Only positive integers can be converted to hex");
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
const defaultParseHexOptions = { bytes: 2, message: "Invalid value" };

/**
 * Parse a hex value.
 * @param {string} value The parsed string.
 * @param {ParseHexOptions} [options] THe parse options.
 * @returns {number} THe hex value.
 * @throws {TypeError} THe valeu was not a valid string representaiton of a hex.
 */
function parseHex(value, options = {}) {
  const { bytes, message } = { ...defaultParseHexOptions, ...options };
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
 * @returns {number|bigint} The word value as an integer number.
 * @throws {TypeError} The value was ivnalid.
 */
export function checkHexWord(value, options = {}) {
  const { bytes, message } = { ...defaultParseHexOptions, ...options };
  switch (typeof value) {
    case "string":
      return parseHex(value, options);
    case "number":
      if (Number.isSafeInteger(value) && value >= 0 && value < 2 ** (8 * bytes)) {
        return value;
      }
    case "bigint":
      if (value >= 0 && value < 2n ** BigInt(bytes)) {
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
    red: checkHexWord(red, { bytes: 1, message: "Invalid red color value" }),
    green: checkHexWord(green, {
      bytes: 1,
      message: "Invalid green color value",
    }),
    blue: checkHexWord(blue, { bytes: 1, message: "Invalid blue color value" }),
    valueOf() {
      return (this.red << 16) + (this.green << 8) + this.blue;
    },
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
 * @param {number|hex} [alpha=255] The alpha channel value. This value
 * is optional in order to create valid TGBA from a RGB value using default
 * alpha channel of full opaqueness.
 * @returns {RGBAObject} The RGBA object.
 */
export function rgba(red, green, blue, alpha = 255) {
  const rgbVal = rgb(red, green, blue);
  return {
    ...rgbVal,
    alpha: checkHexWord(alpha, {
      bytes: 2,
      message: "Invalid alpha channel value",
    }),
    valueOf() {
      return rgb(this.red, this.green, this.blue).valueOf() << 8 + this.alpha;
    },
    toString() {
      return rgb(this.red, this.green, this.blue).toString() + toHex(this.alpha);
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
  static fromRGB(foreground = undefined, background = undefined) {
    return new ColorDef().rgbForeground(foreground).rgbBackground(background);
  }

  /**
   * Create a new color definition.
   */
  constructor() {
    this.foreground = "";
    this.background = "";
  }

  /**
   * The ansi color declaration of the color.
   * @return {string} The ANSI color declaration for the color definition.
   */
  get color() {
    return `${this.foreground}${this.background}`;
  }

  /**
   * @inheritdoc
   */
  toString() {
    return this.color;
  }

  /**
   * Set the foreground from RGB value.
   * @param {RGB} [rgbForeground] The new RGB foreground.
   * @returns {ColorDef} The color definition with RGB foreground set to the givne value.
   */
  rgbForeground(rgbForeground) {
    if (rgbForeground !== undefined) {
      if (rgbForeground === null) {
        // Unsetting the foreground.
        this.foreground = "";
      } else {
        const rgb = checkRGB(rgbForeground);
        const [red, green, blue] = Array.isArray(rgb)
          ? rgb
          : [rgb.red, rgb.green, rgb.blue];
        this.foreground = AnsiColorSupport.rgbForeground(red, green, blue);
      }
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
      if (rgbBackground === null) {
        // Unsetting the background.
        this.background = "";
      } else {
        // Setting background to the given RGB value.
        const rgb = checkRGB(rgbBackground);
        const [red, green, blue] = Array.isArray(rgb)
          ? rgb
          : [rgb.red, rgb.green, rgb.blue];
        this.background = AnsiColorSupport.rgbBackground(red, green, blue);
      }
    }
    return this;
  }

  /**
   * Set color by the code.
   * @param {number} code The ANSI color code.
   */
  colorCode(code) {
    const scheme = [
      AnsiColorSupport.COLORS.foreground,
      AnsiColorSupport.COLORS.background,
    ].find((scheme) => scheme.has(code));
    if (scheme === AnsiColorSupport.COLORS.foreground) {
      this.foreground = scheme.toAnsiCommand(code);
    } else if (scheme === AnsiColorSupport.COLORS.background) {
      this.background = scheme.toAnsiCommand(code);
    } else if (code === 0) {
      // The code is the reset code.
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
 * @property {number} [first] The first valid value.
 * @property {number} [last] The last valid value.
 * @property {(number)=>boolean} has Does the scheme contain color value.
 * @property {(number)=>string} toAnsiCommand Get ANSI command starting the color.
 * @property {Record<string, number|RGB|RGBA>} [colors] The mapping from color names to the color codes.
 * @property {Record<string, ColorScheme>} [members] The sub scheme of the current scheme.
 */

/**
 * The list of color names.
 * @typedef {Array<string|null>} ColorNameList
 */

/**
 * The color name list source.
 * @typedef {ColorNameList & Required<Pick<ColorScheme, "toAnsiCommand"|"first">> & Partial<Omit<ColorScheme, "toAnsiCommand"|"first"|"colors">>} ColorNameSource
 */

/**
 * The color scheme source.
 * @typedef {Required<Pick<ColorScheme, "toAnsiCommand">> & Partial<Omit<ColorScheme, "toAnsiCommand">>} ColorSchemeSource
 */

/**
 * Create a color scheme.
 * @param {ColorNameSource|ColorSchemeSource} source The color scheme options.
 * @returns {ColorScheme} The created color scheme.
 * @throws {SyntaxError} The given source was invalid.
 */
export function createColorScheme(source = {}) {
  const { toAnsiCommand, has = undefined, first = undefined, colors = undefined, members = undefined } = source;
  var { last = undefined } = source;
  let colorRecord; 
  if (Array.isArray(colors)) {
    if (!Number.isSafeInteger(first)) {
      throw new SyntaxError("Invalid or missing first property");
    } else {
      last = first;
      colorRecord = colors.reduce(
        (result, colorName, index) => {
          if (colorName == null) {
            last = undefined;
          } else {
            result[colorName] = first + index;
            if (last !== undefined) {
              last = result[colorName];
            }
          }
          return result;
        }, {}
      )
    }
  } else {
    colorRecord = colors;
  }

  return {
    first: last == null ? undefined : first,
    last,
    colors: colorRecord,
    members,
    has(code) {
      if (has) {
        return has(code);
      } else {
        return (this.first === undefined || this.first <= code) &&
          (this.last === undefined || code <= this.last) ||
          (this.members != null && this.members.some(member => member.has(code)));
      }
    },
    toAnsiCommand(code) {
      if (this.has(code)) {
        return toAnsiCommand(code);
      } else {
        throw new SyntaxError("Invalid color code");
      }
    }
  };
}

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
  static RESET = `${AnsiColorSupport.ESCAPE}0m`;

  /**
   * Get the escape starting a foreground color.
   * @param {number} code The color code.
   * @returns {string} THe ANSI escape starting the foreground color.
   */
  static foreground(code) {
    if (
      code >= AnsiColorSupport.COLORS.foreground.first &&
      code <= AnsiColorSupport.COLORS.foreground.last
    ) {
      return `${AnsiColorSupport.COLOR_COMMAND_START}${code}${AnsiColorSupport.COLOR_COMMAND_END}`;
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
      code >= AnsiColorSupport.COLORS.background.first &&
      code <= AnsiColorSupport.COLORS.background.last
    ) {
      return `${AnsiColorSupport.COLOR_COMMAND_START}${code}${AnsiColorSupport.COLOR_COMMAND_END}`;
    } else {
      return "";
    }
  }

  /**
   * The color schemes.
   * @type {Record<string, ColorScheme>}
   */
  static COLORS = {
    foreground: createColorScheme({
      colors: [
        "black",
        "red",
        "green",
        "yellow",
        "blue",
        "magenta",
        "cyan",
        "white",
        null,
        "default"
      ].reduce((result, color, index) => {
        if (color != null) {
          result[color] = index + 30
        }
        return result;
      }, {}),
      toAnsiCommand: AnsiColorSupport.foreground
    }),
    background: createColorScheme({
      colors: [
        "black",
        "red",
        "green",
        "yellow",
        "blue",
        "magenta",
        "cyan",
        "white",
        null,
        "default"
      ].reduce((result, color, index) => {
        if (color != null) {
          result[color] = 40 + index;
        }
        return result;
      }, {}),
      toAnsiCommand: AnsiColorSupport.background
    }),
    standard: createColorScheme({
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
        standard: createColorScheme({
          first: 0,
          last: 7,
          colors: [
            "black",
            "red",
            "green",
            "yellow",
            "blue",
            "magenta",
            "cyan",
            "white",
          ],
          members: {
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
            get default() {
              return this.foreground;
            }
          },
        }),

        highIntencity: createColorScheme({
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
          ],
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
            get default() {
              return this.foreground;
            }
          }
        })
      },
    }),

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
      members: {
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
            return AnsiColorSupport.COLORS.rgb.last;
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
    return `${AnsiColorSupport.ESCAPE}${AnsiColorSupport.COLOR_COMMAND_START}${AnsiColorSupport.EXTENDED_FOREGROUND_COLOR};${code}${AnsiColorSupport.COLOR_COMMAND_END}`;
  }

  /**
   * Get extended color scheme ANSI backgorundground color start.
   * @param {number} code The extended color code from 0 to 255.
   * @returns {string} The color defining escape sequence.
   */
  static extentedCodeBackground(code) {
    return `${AnsiColorSupport.ESCAPE}${AnsiColorSupport.COLOR_COMMAND_START}${AnsiColorSupport.EXTENDED_BACKGROUND_COLOR};${code}${AnsiColorSupport.COLOR_COMMAND_END}`;
  }

  /**
   * Get the RGB color schemee ANSI foreground color start.
   * @param {number} red The red color code from 0 to 255.
   * @param {number} green The green color code from 0 to 255.
   * @param {number} blue  The blue color code from 0 to 255.
   * @returns {string} The ANSI foreground color start.
   */
  static rgbForeground(red, green, blue) {
    return `${AnsiColorSupport.ESCAPE}[${AnsiColorSupport.RGB_FOREGROUND_COLOR}${rgbColor(
      red,
      green,
      blue
    )}${AnsiColorSupport.COLOR_COMMAND_END}`;
  }

  /**
   * Get the RGB color schemee ANSI background color start.
   * @param {number} red The red color code from 0 to 255.
   * @param {number} green The green color code from 0 to 255.
   * @param {number} blue  The blue color code from 0 to 255.
   * @returns {string} The ANSI background color start.
   */
  static rgbBackground(red, green, blue) {
    return `${AnsiColorSupport.ESCAPE}[${AnsiColorSupport.RGB_BACKGROUND_COLOR}${rgbColor(
      red,
      green,
      blue
    )}${AnsiColorSupport.COLOR_COMMAND_END}`;
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

  /**
   * RGB foreground color command.
   */
  static RGB_FOREGRUND_COMMAND = "38;2";

  /**
   * RGB background color command.
   */
  static RGB_BACKGRUND_COMMAND = "48;2";

  /**
   * Create a new ANSI color support.
   */
  constructor() { }

  isValidColor(colorSpaceDef, color) {
    switch (typeof color) {
      case "number":
        // Color code.
        return colorSpaceDef.has(color);
      case "string":
        // Color name.
        if (colorSpaceDef.colors && color in colorSpaceDef.colors) {
          return true;
        } else if (colorSpaceDef.members) {
          return colorSpaceDef.members.some(subDef => this.isValidColor(subDef, color));
        } else {
          return false;
        }
      case "object":
        // Color spaces does not support RGB or RGBA values.
        return false;
    }
  }

  /**
   * Get text with foregorund color.
   * @param {number|RGB|ColorDef|StyleDef} color The color.
   * @param {string} text The colored text.
   * @returns {string} The text with ANSI color codes.
   */
  foregroundColor(color, text) {
    const def = AnsiColorSupport.COLORS.foreground;
    switch (typeof color) {
      case "number":
        // Color code.
        if (this.isValidColor(def, color)) {
          const colors = def;
          return `${colors.toAnsiCommand(color)}${text}${colors.toAnsiCommand(color.colors.default)}`;
        } else {
          throw new SyntaxError("Invalid foreground color code");
        }
      case "string":
        if (def.colors) {
          if (def.colors[color]) {
            return `${def.toAnsiCommand(color.colors[color])}${text}${def.toAnsiCommand(def.colors.default)}`;
          }
        }
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
      return `${def.color ?? ""}${text}${def.reset ? AnsiColorSupport.RESET : ""
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
      return `${def.color ?? ""}${text}${def.reset ? AnsiColorSupport.RESET : ""
        }`;
    }
  }
}
