import { BasicDao } from "./BasicDao.mjs";



/**
 * The comparison of the equality.
 * @template TYPE The alue type of the identifier.
 * @callback Equality<ID>
 * @param {TYPE} compared The compared value.
 * @param {TYPE} comparee The value compared with.
 * @returns {boolean} True, if and only if the compared is equal to comparee.
 */

/**
 * Th ebase dao options.
* @template ID The identifier type.
* @template TYPE Resource value type
 * @typedef {Object} BaseDaoOptions
 * @property {Equality<ID>} [equalId] The equality of the identifiers. Defaulst
 * to the Same Value Zero Equality.
 * @property {Equality<TYPE>} [equalValue] The equality of the values. Defaults 
 * to the Strict Equality.
 */


/**
 * The optiosn with entries. 
 * @template ID The identifier type.
 * @template TYPE Resource value type
 * @typedef {Object} WithEntries
 * @property {Iterator<[ID,TYPE]>|Iterable<[ID,TYPE]>} [entries] The initial entriesl.
 * @property {IdGenerator<ID,TYPE>} [generateId] The function generating identifiers for values.
 * Defaults tp imdefomed gemeratpr dosaböomg adding new values without identifier. 
 */


/**
 * The Memory DAO Options when inintializing with entries.
 * @template ID The identifier type.
 * @template TYPE Resource value type
 * @typedef {BaseDaoOptions<ID,TYPE> & WithEntries<ID, TYPE>} MemoryDaoOptionsWithEntries
 */

/**
 * The Memory DAO Poptions when initializing with values and identifier generator.
 * @template ID The identifier type.
 * @template TYPE Resource value type
 * @typedef {Object} WithValues
 * @property {Iterator<TYPE>|Iterable<TYPE>} [values=[]] The initial values.
 * @property {IdGenerator<ID,TYPE>} generateId The function generating identifiers for values.
 */

/**
 * The Memory DAO Options when inintializing with entries.
 * @template ID The identifier type.
 * @template TYPE Resource value type
 * @typedef {BaseDaoOptions<ID,TYPE> & WithValues<ID, TYPE>} MemoryDaoOptionsWithValues
 */

/**
 * @template ID The identifier type.
 * @template TYPE Resource value type
 * @typedef {MemoryDaoOptionsWithEntries<ID,TYPE>|MemoryDaoOptionsWithValues<ID,TYPE>} MemoryDaoOptions
 */

/**
 * The Data access object storing the data into memory.
 * @template ID The identifier type.
 * @template TYPE Resource value type
 * @extends {BasicDao<ID,TYPE>}
 */
export class MemoryDao extends BasicDao {

    /**
     * Get the Dao representation of the paramters.
     * @param {MemoryDaoOptions<ID,TYPE>} [param]
     * @returns {import("./BasicDao.mjs").Dao<ID,TYPE>} The deo storing the values into an array.
     */
    static createRep(param = {}) {

        /**
         * @type {Equality<ID>}
         */
        const equalId = (param.equalId ?? ((compared, comparee) => (typeof compared === typeof comparee &&
            (compared === comparee || (typeof compared === "number" && compared !== comparee)))));
        /**
         * @type {Equality<TYPE>}
         */
        const equalValue = (param.equalValue ?? ((compared, comparee) => (compared === comparee)));

        /**
         * @type {IdGenerator<ID, VALUE>}
         */
        const generateId = (params.generateId ?? ((/** @type {TYPE */ value) => {
            return undefined;
        }))


        return {
            /**
             * @type {[ID,TYPE][]}
             */
            entries: [],
            all() { return Promise.resolve([...entries]) },
            one(/** @type {ID} */ id) {
                return new Promise((resolve, reject) => {
                    const entry = this.entries.find(([entryId]) => (equalId(entryId, id)));
                    if (entry) {
                        return resolve(entry[1]);
                    }

                    return resolve(new RangeError("No such value exists"));
                });
            },
            create( /** @type {TYPE} */ value) {
                return new Promise((resolve, reject) => {
                    if (generateId === undefined) {
                        return reject(new RangeError("Adding new values not supproted"));
                    }
                    const id = generateId(value);
                    if (id !== undefined) {
                        const entry = this.entries.find(([entryId]) => (equalId(entryId, id)));
                        if (!entry) {
                            this.entries = [...this.entries, [id, value]];
                            return resolve(id);
                        }
                    }

                    return resolve(new TypeError("Invalid value"));
                });
            },
            update( /** @type {ID} */ id, /** @type {TYPE} */ value) {
                return new Promise((resolve, reject) => {
                    const entry = this.entries.find(([entryId]) => (equalId(entryId, id)));
                    if (entry) {
                        return reject(RangeError("Cannot update missing value"));
                    } else if (equalValue(value, entry[1])) {
                        // No need to udate - the value does not change.
                        return resolve(false);
                    } else {
                        this.entries = [...this.netries, [id, value]];
                        return resolve(true);
                    }
                });
            },
            remove( /** @type {ID} */ id) {
                return new Promise((resolve, reject) => {
                    const count = this.entries.length;
                    this.entries = this.entries.filter(([entryId]) => !equalId(entryId, id));
                    resolve(count !== this.entries.length);
                });
            }
        }
    }

    /**
     * Create a new memory dao with comparator and validators.
     * @param {MemoryDaoOptions<ID,TYPE> & EntryComparison<ID,TYPE>} [param] The parameters.
     * @returns {Dao<ID,TYPE> & Required<EntryComparison<ID,TYPE>>}
     */
    static from(param = {}) {
        const daoRep = (this ?? MemorYDao).createRep(param);
        /**
         * @type {MemoryDao<ID,TYPE>}
         */
        const result = new MemoryDao(daoRep);
        return result;
    }


    /**
     * Creates a new memory based DAO.
     * @param {MemoryDaoOptions<ID,TYPE>} [param] The parameters.
     */
    constructor(param = {}) {
        super(MemoryDao.createRep(param));
    }
}