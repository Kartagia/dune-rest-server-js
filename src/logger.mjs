
/**
 * @module logger
 * Logging implementation.
 */

import {format} from 'node:util';

/**
 * The message options.
 * @typedef {Object} MessageOptions
 * @property {string} [prefix=""] The prefix of the message.
 * @property {number} [indentLevel=0] The indent level of hte message.
 * @property {string} [suffix=""] The suffix of the message.
 * @property {boolean} [showTrace=false] Does the message include stack trace.
 */

/**
 * The optional message options.
 * @typedef {Pick<MessageOptions, "prefix"|"indentLevel"|"suffix"|"showTrace">} OptionalMessageOptions
 */

/**
 * The required mesasge options.
 * @typedef {Omit<MessageOptions,keyof OptionalMessageOptions>} RequiredMessageOptions
 */

/**
 * The default message options for the optional options.
 * @type {Required<OptionalMessageOptions>}
 */
export const DefaultMessageOptions = {
    prefix: "",
    suffix: "",
    indentLevel: 0,
    showTrace: false
};
Object.freeze(DefaultMessageOptions);

/**
 * A messegner sending a message.
 * @callback Messenger
 * @param {string} message The outputted message.
 * @param {MessageOptions} [options] The mesage options.
 * @returns {Promise<void>} The promise of the message delivery.
 */

/**
 * A messenger sending error message.
 * @template [ERROR=any] The type of the error value.
 * @callback ErrorMessenger
 * @param {string} message The outputted emssage.
 * @param {ERROR} [error] The error cause.
 * @param {MessageOptions} [options] The mesage options.
 * @param {...any} args The message arguments. 
 * @returns {Promise<void>} The promise of the message delivery.
 */

/**
 * A messenger sending a table message.
 * @callback TableMessenger
 * @param {Array<any>|Record<string|number|symbol, any>} table The outputted table.
 * @param {string[]} [columns] The columns of the table.
 * @returns {Promise<void>} The promise of the message delivery.
 */

/**
 * The directory output options.
 * @template {Object} DirOptions
 * @property {boolean} [colors=true] Does the output use colors. 
 * @property {number|null} [depth=2] The maximum depth of the recursion on Object and Array
 * values.
 * @property {boolean} [showHidden=false] Do the output contain hidden fields.
 * 
 */

/**
 * A directory sending mesasge.
 * @callback DirMessenger
 * @param {Record<string|number|symbol,any>|} object The outputted option.
 * @param {DirOptions} [options] The directory options.
 * @returns {Promise<void>} The pormise of the sending the directory message.
 */
export function ConsoleTableMessenger(table) {
    return new Promise((resolve, reject) => {
        global.console.table(table);
    });
}

/**
 * The console output logger.
 * 
 * The console handles the indentaiton.
 * @type {Messenger}
 */
export function ConsoleOutputMesenger(message, options={}) {
    return new Promise( (resolve, reject) => {
        global.console.log(formatMessage(message, undefined, options)).then(
            () => {
                if (options.showTrace) {
                    global.console.trace();
                }
                resolve(undefined);
            }
        );
    });
}
/**
 * The console error messenger.
 * 
 * The console handles the indentaiton.
 * @type {ErrorMessenger} 
 */
export function ConsoleErrorMessenger(message, error=undefined, options={}, ...args) {
    return new Promise( (resolve, reject) => {
        if (error) {
            global.console.error(formatMessage(message, args, options).then(
                () => {
                    if (options.showTrace) {
                        global.console.trace(error ?? "");
                    }
                    resolve();
                }
            ));
        } else {
            global.console.error(formatMessage(message, args, options));
            resolve();
        }
    });
}

/**
 * Formats a value.
 * @template [TYPE=any]
 * @template [OUTPUT=string]
 * @callback Formatter
 * @param {TYPE} value The formatted value.
 * @returns {OUTPUT} The formatted value.
 * @throws {SyntaxError} The formatting of the value failed. 
 */

/**
 * THe logger options.
 * @typedef {Object} LoggerOptions
 * @property {ErrorMessenger} error The error message handler.
 * @property {Messenger} output The output handler. 
 * @property {boolean} [showTime=false] Does the logger show time.
 * @property {Formatter<number|Date, string>} [formatTime] THe formatter of the time.
 * Defaults to the time numeric value.
 */

/**
 * A group of messages.
 * @typedef {Object} MessageGroup
 * @property {string} label The label of hte group.
 * @property {boolean} collapsed Is the group collapsed.
 * @property {Messenger} output The output to the group.
 * @property {ErrorMessenger} error The error output to teh group.
 * @property {() => undefined} close Closes the group.
 */

/**
 * Open a group.
 * @callback OpenGroup
 * @param {string} label The label of the created group.
 * @returns {Promise<MessageGroup>} The promise of the created message group and the
 * delivery of the opening message.
 */

/**
 * Close group.
 * @callback CloseGroup
 * @returns {Promise<void>} Promise of the completion and logging the end of group message.
 */

/**
 * End a timer and log end of timer message with elapsed tme.
 * @callback EndTimer
 * @param {string} [label="default"] The label of the ended timer.
 * @returns {Promise<void>} The promise of the ending a timer and delivery of the message.
 */

/**
 * @callback TimerLogMessenger
 * @param {string} [label="default"] The label of the logged timer.
 * @param {...string} messages The messages appended to the time elapsed.
 * @returns {Promise<void>} The promise of the delivery of the message.
 */

/**
 * Start a timer. 
 * @callback StartTimer
 * @param {string} [label="default"] The label of the created timer.
 * @returns {Promise<void>} The promise of the starting a timer and delivery of the message.
 */

/**
 * Logger model for logging information.
 * @typedef {Object} LoggerModel
 * @property {ErrorMessenger} error Output an error message.
 * @property {Messenger} log Log a essage.
 * @property {Messenger} info Log an info message.
 * @property {Messenger} warn Log a warnin gmessage.
 * @property {Messenger} debug Log a debug message.
 * @property {TableMessenger} [table] Log a table.
 * @property {DirMessenger} [dir] Log a directory.
 * @property {OpenGroup} [group] Opens a group with label.
 * @property {OpenGroup} [groupCollapsed] Opens a collapsed group with label.
 * @property {CloseGroup} [groupEnd] Closes the current group. 
 * @property {StartTimer} [timer] Start a named timer.
 * @property {TimerLogMessenger} [timerLog] Log a timer value message.
 * @property {EndTimer} [timerEnd] End a named timer.
 */

/**
 * The group support.
 * @typedef {Required<Pick<LoggerModel, "group"|"groupCollapsed"|"groupEnd">>} GroupSupport
 */

/**
 * A group supporting logger.
 * @typedef {Omit<LoggerModel, Keys<GroupSupport>> & GroupSupport} GroupLogger
 */

/**
 * The timer support.
 * @typedef {Object} TimerSupport
 * @property {StartTimer} timer Start a named timer.
 * @property {TimerLogMessenger} timerLog Log a timer value message.
 * @property {EndTimer} timerEnd End a named timer.
 */

/**
 * A timer supporting logger. 
 * @typedef {Omit<LoggerModel, Keys<TimerSupport>> & TimerSupport} TimerLogger
 */

/**
 * Create a logger with timer support.
 * @param {LoggerModel} logger The logger. 
 * @ereturns {TimerLogger}
 */
export function TimerSupport(logger) {
    
    /**
     * Timer start date-times.
     * @type {Record<string, number>}
     */
    const timers = new Map();

    /**
     * @type {StartTimer}
     */
    function defaultTime(label="default") {
        const currentTime = Date.now();
        timers.set(label, currentTime);
        return this.log(`${label}: Timer started`);
    }

    /**
     * @type {EndTimer}
     */
    function defaultTimeEnd(label="default") {
        const currentTime = Date.now();
        if (timers.has(label)) {
            return this.log(`${label}: ${currentTime - timers.get(label)}ms - timer ended`);
        } else {
            return this.warn(`Timer "${label}" doesn't exist`);
        }
    }

    /**
     * @type {TimerLogMessenger}
     */
    function timeLog(label="default", ...messages) {
        const currentTime = Date.now();
        if (timers.has(label)) {
            /** @todo Add support for messages. */
            return this.log(`${label}: ${currentTime - timers.get(label)}ms`)
        } else {
            return this.warn(`Timer "${label}" does not exist`)
        }
    }
    
    return {
        ...logger,
        time: defaultTime,
        timeEnd: defaultTimeEnd, 
        timeLog
    }
}

/**
 * Format a message.
 * @param {any} message The message.
 * @param {any[]} [messageArgs=[]] The message arguemnts.
 * @param {MessageOptions} [options] The message options. 
 */
export function formatMessage(message, messageArgs=[], options={}) {
    const indent = "  ".repeat(options.indentLevel ?? 0);
    return `${indent}${options.prefix ?? ""}${format(message, ...messageArgs).replace(
        /\n/g, `\n{${indent}`)}${options.suffix??""}`;
}

/**
 * Console based logger.
 * @extends {LoggerModel}
 */
export class ConsoleLogger {

    /**
     * @type {Console}
     */
    #console;

    constructor(console=global.console) {
        this.#console = console;
    }

    /**
     * Log with formatting.
     * @param {any} message The message. 
     * @param  {...any} args The messagae arguments.
     */
    logf(message, ...args) {
        return Promise.resolve(this.#console.log(this.formatMessage(message, {}, ...args)));
    }

    /**
     * Format a message.
     * @param {any} message The message. 
     * @param {MessageOptions} [options] The message options. 
     * @param  {...any} messageArgs The arguments of the message
     * @returns {string} The string representation of the message.
     */
    formatMessage(message, options={}, ...messageArgs) {
        return formatMessage(message, messageArgs, options);
    }

    log(message, options={}) {
        return Promise.resolve(this.#console.log(this.formatMessage(message, options)));
    }

    warn(message, options={}) {
        const logLevel = "warning";
        if (this.isLogged(logLevel)) {
            return this.log(message, {...options, prefix: `[${logLevel}]${options.prefix ?? ""}`});
        } else {
            return Promise.resolve();
        }
    }

    info(message, options={}) {
        const logLevel = "info";
        if (this.isLogged(logLevel)) {
            return this.log(message, {...options, prefix: `[${logLevel}]${options.prefix ?? ""}`});
        } else {
            return Promise.resolve();
        }
    }

    debug(message, options={}) {
        const logLevel = "debug";
        if (this.isLogged(logLevel)) {
            return this.log(message, {...options, prefix: `[${logLevel}]${options.prefix ?? ""}`});
        } else {
            return Promise.resolve();
        }
    }

    error(message, error = undefined, options={}) {
        const logLevel = "error";
        if (this.isLogged(logLevel)) {
            return this.log(message, {...options, prefix: `[${logLevel}]${options.prefix ?? ""}`}).then(
                () => {
                    if (error && options.printTrace) {
                        return this.trace(error, options);
                    }
                }
            );
        } else {
            return Promise.resolve();
        }
    }


    /**
     * Send error trace log message.
     * @param {any} error The traced error.
     * @param {MessageOptions} [options] The mesage options.
     * @returns {Promise<void>} The promise of the delivering the message.
     */
    trace(error, options={}) {
        return new Promise( (resolve, reject) => {
            this.#console.trace(error);
        });
    }
}

/**
 * The logger option performing logging.
 * @template [ERROR=any] The error type-
 * @type {LoggerModel}
 */
export class Logger {

    /**
     * The counters.
     * @type {Map<string, number>}
     */
    #counters = new Map();

    /**
     * The timer start times in milliseconds.
     * @type {Map<string, number>}
     */
    #timers = new Map();

    /**
     * The group stack. 
     * @type {string[]}
     */
    #groupStack = [];

    /**
     * The error message hanlder.
     * @type {ErrorMessenger}
     */
    #error = undefined;

    /**
     * The output message hanlder.
     * @type {Messenger}
     */
    #output = undefined;

    /**
     * Create a new logger.
     * @param {LoggerOptions} options 
     */
    constructor(options={}) {
        this.#error = options.error ?? ConsoleErrorMessenger;
        this.#output = options.output ?? ConsoleOutputMesenger;
    }

    /**
     * Create a new message group.
     * @param {string} label THe label of the group.
     * @param {boolean} [collapsed=false] is the group collapsed.
     * @returns {MessageGroup} The create message group. 
     */
    createGroup(label, collapsed=false) {
        return {
            label,
            indentLevel: this.#groupStack.length +1,
            collapsed,
            output: this.#output,
            error: this.#error,
            output(message, options={}) {
                if (this.output) {
                    return this.output(message, {...options, indentLevel: this.indentLevel});
                } else {
                    return Promise.reject("Group has closed");
                }
            },
            error(message, error=undefined, options={}) {
                if (this.error) {
                    return this.error(message, error, {...options, indentLevel: this.indentLevel});
                } else {
                    return Promise.reject("Group has closed");
                }
            },
            close() {
                this.error = undefined;
                this.output = undefined;
            }
        };
    }

    /**
     * Open a new gruop.
     * @param {string} label The label of the created group.
     * @returns {Promise<never>} The promise of the creation of the gruop.
     */
    group(label) {
        return new Promise( (resolve, reject) => {
            const group = this.createGroup(label);
            this.log(label).then(() => {
                this.#groupStack.push(group);
                resolve();
            });
        });
    }

    /**
     * Open a new collapsed gruop.
     * @param {string} label The label of the created group.
     * @returns {Promise<never>} The promise of the creation of the gruop.
     */
    groupCollapsed(label) {
        return new Promise( (resolve, reject) => {
            const group = this.createGroup(label, true);
            this.#groupStack.push(group);
            this.#output()
            resolve();
        });
    }

    /**
     * Close the topmost group.
     * @returns {Promise<never>} The promise that the current gorup is clsoed.
     */
    groupEnd() {
        return new Promise( (resolve, reject) => {
            const closedGroup = this.#groupStack.pop();
            if (closedGroup) {
                closedGroup.close();
            }
            resolve();
        })
    }

    /**
     * Log a message.
     * @param {string} message The logged message. 
     * @returns {Promise<void>} The promise of delivering the log message.
     */
    log(message) {
        return this.#output(message);
    }

    /**
     * Send a debug message.
     * @param {string} message The debug message. 
     * @returns {Promise<never>} The promise that the message is logged.
     */
    debug(message) {
        return this.#output(message, {prefix: "[debug]"});
    }

    /**
     * Send an info message.
     * @param {string} message The info message. 
     * @returns {Promise<never>} The promise that the message is logged.
     */
    info(message) {
        return this.#output(message, {prefix: "[info]"});
    }

    /**
     * Send an error message.
     * @param {string} message The error message.
     * @param {ERROR} [error] The error causing the message. 
     * @returns {Promise<never>} The promise that the message is logged.
     */
    error(message, error=undefined) {
        return this.#error(message, error, {prefix: "[error]"});
    }

    warn(message) {
        return this.#output(message, {prefix: "{warn]"});
    }

    time(label="debug") {
        const currentDate = Date.now();
        return new Promise( (resolve, reject) => {
            if (this.#timers.has(label)) {
                resolve(this.timeLog(label));
            } else {
                this.#timers.set(label, currentDate);
                resolve(this.log(`${label}: Start timer`));
            }
        });
    }

    timeEnd(label="debug") {
        const currentDate = Date.now();
        const startDate = this.#timers.get(label);
        return new Promise( (resolve, reject) => {
            if (this.#timers.delete(label)) {
                resolve(this.log(`${label}: ${currentDate - (startDate ?? 0)}ms - Timer ended`));
            } else {
                resolve(this.warn(`${label}: No such timer exists`));
            }
        });
    }

    /**
     * Log a current timer value and possible additional text.
     * @param {string} [label="default"] The timer label.
     * @param  {...any} [args] The argumetns printed after tthe timer.
     * @returns {Promise<void>} The promise of the delivering of the message.
     */
    timeLog(label="debug", ...args) {
        const currentDate = Date.now();
        const startDate = this.#timers.get(label);
        return new Promise( (resolve, reject) => {
            if (startDate !== undefined) {
                resolve(this.log(`${label}: ${currentDate - (startDate ?? 0)}ms ${formatMessage("", args)}`));
            } else {
                resolve(this.warn(`${label}: No such timer exists`));
            }
        });

    }

}



export default Logger;