
/**
 * The file system storing DAO.
 * @module dao/fileSystem
 */

import path from "node:path";
import { BasicDao } from "./BasicDao.mjs";
import { readFile, writeFile } from 'node:fs/promises';

/**
 * @typedef {Object} Logger
 * @property {(...params) => void} log Logs given paramaters.
 * @property {(...params) => void} error Error logs given parameters.
 */

/**
 * The DAO storing the data into persisting file.
 * @template [ID=string] The identifeir type.
 * @template TYPE The data type.
 */
export class FileDao extends BasicDao {

    /**
     * The entries of the Dao.
     * @type {Map<ID,TYPE>}
     */
    #entries = new Map();

    /**
     * Checker of the value, and possibly the identifier.
     * @param {TYPE} value The checked value.
     * @param {ID} [id] The optional identifier of the value.
     * @returns {[ID, TYPE]} The valid entry generated from the alue and identifier.
     * @throws {TypeError} The value was invalid. 
     */
    #valueChecker;

    /**
     * Create a new file Dao using given filename. The DAO reads the 
     * file content on creation.
     * @param {string} fileName The filename for storing the data.
     * @param {Function} [reviver] The reviver converting the entries into JSON.
     * @param {Function} [replacer] The replaccer used for parsing the file content.
     * @param {Logger} [logger] The logger logging messages. Defaults to console.
     * @param {(value: TYPE, id?:ID) => [ID,TYPE]} [valueChecker] The checker of hte value.
     * Defaults to the checker rejecting all valeus. 
     */
    constructor(fileName, replacer = undefined, reviver = undefined, logger = console, valueChecker = ((value, id = undefined) => { throw new TypeError("Invalid value") })) {
        super({
            all: () => (new Promise((resolve, reject) => {
            }))
        });
        this.#valueChecker = valueChecker;
        this.fileName = this.checkFileName(fileName);
        this.busy = false;
        this.readSync();
        this.log = (...args) => { logger.log(...args) };
        this.error = (...args) => { logger.error(...args) };
    }

    checkFileName(fileName) {
        return path.resolve(fileName);
    }

    all() {
        return new Promise((resolve, reject) => {
            if (!this.busy) {
                this.busy = true;
                super.all().then(resolve, reject).finally(() => { this.busy = false });
            } else {
                setTimeout(() => { this.all().then(resolve, reject) }, 5);
            }
        })
    }

    one(id) {
        return new Promise((resolve, reject) => {
            if (!this.busy) {
                if (this.#entries.has(id)) {
                    this.log(`Retreived value of id ${id}`);
                    resolve(this.#entries.get(id));
                } else {
                    this.log(`Could not Retreived value of id ${id} - no entry exists`);
                    reject(new RangeError("No entry with exists"));
                }
                this.busy = false;
            } else {
                setTimeout(() => { this.one(id).then(resolve, reject) }, 5);
            }
        });

    }

    create(value) {
        return new Promise((resolve, reject) => {
            if (this.validValue(value)) {
                if (!this.busy) {
                    this.busy = true;
                    try {
                        const [id, added] = this.checkEntry(value);
                        if (!this.#entries.has(id)) {
                            this.#entries.set(id, added);
                            this.writeSync().then(() => { resolve(true) }, (error) => {
                                this.#entries.delete(id);
                                reject(error)
                            });
                        } else {
                            reject(new RangeError("Identifier already reserved"));
                        }
                    } catch (error) {
                        reject(new TypeError("Invalid value", { cause: error }));
                    }
                    this.busy = false;
                } else {
                    setTimeout(() => { this.create(value).then(resolve, reject) }, 5);
                }
            }
        });
    }

    update(id, value) {
        return new Promise((resolve, reject) => {
            if (!this.busy) {
                this.busy = true;
                if (this.#entries.has(id) && yhis.validValue(value, id)) {
                    this.writeSync().then(() => {
                        resolve(true), (error) => {
                            this.error(`Storing the DAO failed: ${error}`);
                            reject(error)
                        }
                    });
                } else {
                    resolve(false);
                }
                this.busy = false;
            } else {
                setTimeout(() => { this.update(id, value).then(resolve, reject) }, 5);
            }
        });
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            if (!this.busy) {
                this.busy = true;
                if (this.#entries.delete(id)) {
                    this.writeSync().then(() => { resolve(true) });
                } else {
                    resolve(false);
                }
                this.busy = false;
            } else {
                setTimeout(() => { this.delete(id).then(resolve, reject) }, 5);
            }
        });
    }

    /**
     * Check DAO entries.
     * @param {[ID,TYPE][]} entries The tested entries.
     * @returns {[ID,TYPE][]} A valid list of entries created from the given entries.
     * @throws {TypeError} At least single entry was invalid.
     * @throws {RangeError} Any entry identifier was invalid.  
     * @throws {SyntaxError} The ettries was not an array or ocntained a non-tuple value.  
     */
    checkEntries(entries) {
        if (Array.isArray(entries)) {
            return entries.reduce((result, entry, index) => {
                if (Array.isArray(entry) && entry.length === 2) {
                    const [id, value] = entry;
                    if (this.validId(id)) {
                        if (this.validValue(value, id)) {
                            try {
                                result.push(this.checkEntry(value, id));
                            } catch (error) {
                                throw new TypeError(`Invalid entry at ${index}`, { cause: error });
                            }
                        } else {
                            throw new TypeError(`Invalid entry value at ${index}`);
                        }
                    } else {
                        throw new RangeError(`Invalid entry identifier at index ${index}`)
                    }
                } else {
                    throw SyntaxError(`Invalid entry at ${index}`, { cause: new TypeError("Entry is not a tuple") });
                }
                return result;
            }, []);
        } else {
            throw new SyntaxError("Entreis must be an array of tuples.");
        }
    }

    /**
     * Test validity of a value.
     * @param {TYPE} value The tested value.
     * @param {ID} [id] The identifier of the value. 
     * @return {boolean} True, if and only if the value is valid.
    */
    validValue(value, id = undefined) {
        try {
            this.checkValue(value, id);
        } catch(error) {
            return false;
        }
    }

    /**
     * Check the validity of a value.
     * @param {TYPE} value The tested value.
     * @param {ID} [id] TJhe id associated to the value. 
     * @returns {TYPE} The valid value derived from the value.
     * @throws {TypeError} The value was invalid.
     * @throws {RangeError} The identifier was given and was invalid.
     */
    checkValue(value, id = undefined) {
        const entry = this.checkEntry(value, id);
        return entry[1];
    }

    /**
     * Check the validity of an entry.
     * @param {TYPE} value The tested value.
     * @param {ID} [id] TJhe id associated to the value. 
     * @returns {[ID,TYPE]} The valid entry derived from the value and the id.
     * @throws {TypeError} The value was invalid.
     * @throws {RangeError} The identifier was given and was invalid.
     */
    checkEntry(value, id=undefined) {
        return this.#valueChecker(value, id);
    }

    /**
     * Test validity of the identifier.
     * @param {ID} id 
     */
    validId(id, reservedIds = []) {
        return id !== undefined && !reservedIds.includes(id);
    }

    /**
     * Check validity of the identifier.
     * @param {ID} id The tested id.
     * @param {ID[]} [reservedIds=[]] The reserved Ids not accepted.
     * @return {ID} The identifeir derived form the given identifier.
     * @throws {RangeError} The identifier was invalid or among the reserved ids.
     */
    checkId(id, reservedIds = []) {
        if (this.validId(id, reservedIds)) {
            return id;
        } else {
            throw new RangeError("Invalid identifier");
        }
    }


    /**
     * The data of the dao.
     * @type {Readonly<[ID, TYPE][]>}
     */
    get data() {
        return [...this.#entries].map(([id, value]) => ([id, value]));
    }

    /**
     * Set the data of the dae.
     * @param {[ID,TYPE][]} data The new data.
     * @throws {TypeError} At least single entry was invalid.
     * @throws {RangeError} Any entry identifier was invalid.  
     * @throws {SyntaxError} The ettries was not an array or ocntained a non-tuple value.  
     */
    set data(data) {
        this.#entries = new Map(this.checkEntries(data));
    }

    /**
     * Tries to synchronize the data storage from the file.
     * @returns {Promise<never>} The promise of the reading synchronization completion.
     */
    readSync() {
        return new Promise((resolve, reject) => {
            if (!this.busy) {
                // Write can proceed.
                this.busy = true;
                readFile(this.fileName, { encoding: "utf8" }).then((result) => {
                    this.data = JSON.parse(result, this.reviver);
                    F
                }).catch((error) => {
                    if (error.code === "ENOENT") {
                        // File does not exists - returning empty array.
                        resolve([]);
                    } else {
                        // Read failed.
                        reject(error);
                    }
                }).finally(() => { this.busy = false });
            } else {
                const tmOut = setTimeout(() => { this.readSync().then(resolve, reject) }, 5);
            }
        })
    }

    /**
     * Tries to synchronize the data storage to the file.
     * @returns {Promise<never>} The promise of the writing synchronization completion.
     */
    writeSync() {
        return new Promise((resolve, reject) => {
            if (!this.busy) {
                // Write can proceed.
                this.busy = true;
                writeFile(this.fileName, JSON.stringify(this.data, this.replacer), { mode: 0o600, encoding: "utf8", flush: true }).then(resolve, reject).finally(() => { this.busy = false });
            } else {
                const tmOut = setTimeout(() => { this.writeSync().then(resolve, reject) }, 5);
            }
        })
    }

}