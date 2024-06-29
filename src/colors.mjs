
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
 * Create a rgb objec.t 
 * @param {number|hex} red THe red color value.
 * @param {number|hex} green The green color value.
 * @param {number|hex} blue The blue color value.
 * @returns {RGBObject} The RGB object.
 */
export function rgb(red, green, blue) {
  return {
    red,
    green,
    blue,
    toString() {
      return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
    },
  };
}

export function rgba(red, green, blue, alpha = 255) {
  return {
    red,
    green,
    blue,
    alpha,
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
  constructor() {
    this.foreground = "";
    this.background = "";
  }

  get color() {
    return `${this.foreground}${this.background}`;
  }
}

/**
 * The style definition.
 * @typedef {Object} StyleDef
 * @property {string} color The ansi color of the style.
 */

/**
 * @typedef {Object} ColorScheme
 * @property {number} first The first valid value.
 * @property {number} last The last valid value.
 * @property {(number)=>string} toAnsiCommand Get ANSI command starting the color.
 * @property {Record<string, number>} [colors] The mapping from color names to the color codes.
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
      first: 30,
      last: 37,
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
      toAnsiCommand: AnsiColorSupport.foreground,
    },
    background: {
      first: 40,
      last: 47,
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
      toAnsiCommand: AnsiColorSupport.background,
    },
    standard: {
      first: 0,
      last: 15,
      standard: {
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
        ].map((name, index) => ({ name: index + this.first })),
        foreground: {
          get first() {
            return this.COLORS.standard.first;
          },
          get last() {
            return this.COLORS.standard.last;
          },
          get colors() {
            return this.COLORS.standard.colors;
          },
          toAnsiCommand: AnsiColorSupport.extentedCodeForeground,
        },
        background: {
          get first() {
            return this.COLORS.standard.first;
          },
          get last() {
            return this.COLORS.standard.last;
          },
          get colors() {
            return this.COLORS.standard.colors;
          },

          toAnsiCommand: AnsiColorSupport.extentedCodeBackground,
        },
      },
      highIntencity: {
        first: 8,
        last: 15,
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
        foreground: {
          get first() {
            return this.COLORS.standard.first;
          },
          get last() {
            return this.COLORS.standard.last;
          },
          get colors() {
            return this.COLORS.standard.colors;
          },
          toAnsiCommand: AnsiColorSupport.extentedCodeForeground,
        },
        background: {
          get first() {
            return this.COLORS.standard.first;
          },
          get last() {
            return this.COLORS.standard.last;
          },
          get colors() {
            return this.COLORS.standard.colors;
          },

          toAnsiCommand: AnsiColorSupport.extentedCodeBackground,
        },
      },
    },
    /**
     * Extended additional colors of 6 groups of 36 colors.
     */
    extended: {
      first: 16,
      last: 231,
      foreground: {
        get first() {
          return this.COLORS.standard.first;
        },
        get last() {
          return this.COLORS.standard.last;
        },
        get colors() {
          return this.COLORS.standard.colors;
        },
        toAnsiCommand: AnsiColorSupport.extentedCodeForeground,
      },
      background: {
        get first() {
          return this.COLORS.standard.first;
        },
        get last() {
          return this.COLORS.standard.last;
        },
        get colors() {
          return this.COLORS.standard.colors;
        },

        toAnsiCommand: AnsiColorSupport.extentedCodeBackground,
      },
    },
    /**
     * Grayscale colors.
     */
    greyscale: {
      first: 232,
      last: 255,
      foreground: {
        get first() {
          return this.COLORS.standard.first;
        },
        get last() {
          return this.COLORS.standard.last;
        },
        get colors() {
          return this.COLORS.standard.colors;
        },
        toAnsiCommand: AnsiColorSupport.extentedCodeForeground,
      },
      background: {
        get first() {
          return this.COLORS.standard.first;
        },
        get last() {
          return this.COLORS.standard.last;
        },
        get colors() {
          return this.COLORS.standard.colors;
        },

        toAnsiCommand: AnsiColorSupport.extentedCodeBackground,
      },
    },
    rgb: {
      first: 0,
      last: 2 ** 24 - 1,
      foreground: {
        get first() {
          return this.COLORS.standard.first;
        },
        get last() {
          return this.COLORS.standard.last;
        },
        get colors() {
          return this.COLORS.standard.colors;
        },
        toAnsiCommand: AnsiColorSupport.rgbForeground,
      },
      background: {
        get first() {
          return this.COLORS.standard.first;
        },
        get last() {
          return this.COLORS.standard.last;
        },
        get colors() {
          return this.COLORS.standard.colors;
        },

        toAnsiCommand: AnsiColorSupport.rgbBackground,
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
          // Name of color.
          if (color in AnsiColorSupport.COLORS.foreground) {
            def.color = AnsiColorSupport.COLORS.foreground[color];
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
              def.color = colorScheme.apply(color);
            }
          }
          break;
        case "object":
        // Check which kind of object.
        default:
        // Unknown color.
      }
      return `${def.color ?? ""}${text}${
        def.reset ? AnsiColorSupport.RESET : ""
      }`;
    }
  }
}
