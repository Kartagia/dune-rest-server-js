/**
 * An interface for a data acess object.
 * @template [ID=string] The identifier type of the DAO.
 * @template TYPE The value type of the Dao.
 * @typedef {Object} Dao
 * @property {(id:ID)=>Promise<TYPE>} one Get one entry.
 * @property {()=>Promise<[ID,TYPE]>} all Get all entries.
 * @property {(id:ID)=>Promise<boolean>} remove Removing the entry from DAO.
 * @property {(id:ID, value:TYPE)=>Promise<boolean>} update Update an existing value.
 * @property {(value:TYPE)=>Promise<ID>} create Add a new entry to the dao.
 */

/**
 * The properties to create a people DAO.
 * @template [ID=string] The identifier of the DAO.
 * @template TYPE The content type.
 * @typedef {Required<Pick<Dao<ID,TYPE>, "all">> & Partial<Omit<Dao<ID,TYPE>, "all">>} DaoProps
 */


/**
 * The default Data access object generated from provided functions.
 * @template [ID=string] The identifier type of the DAO.
 * @template TYPE The type of the DAO content.
 *
 * @extends {Dao<ID,TYPE>}
 */
export class BasicDao {

    /**
     * Create a new data access object using given functions to perform various operations.
     * @param {DaoProps<ID,TYPE>} params The properties defining the dao. Missing remove, create and update
     * prohibits those DAO operations. The mission one means the one is implemented by filtering the entry
     * with idetnifier from all entries.
     */
    constructor(params) {
        const { all, one = undefined, create = undefined, update = undefined, remove = undefined } = params;
        
        /**
         * Get all entries of the data access object.
         * @type {()=>Promise<[ID,TYPE][]>}
         */
        this.all = all;
        /**
         * Get an existing entry from the DAO.
         * @type {(id: ID) => Promise<TYPE>}
         */
        this.one = one ?? function (/** @type {ID} */ id) {
            return this.all().then((/** @type {Array<[ID,TYPE]>}*/ entries) => {
                const result = entries.find(([entryId]) => (id === entryId));
                if (result) {
                    resolve(/** @type {TYPE} */ result[1]);
                } else {
                    reject("No such people exists");
                }
            });
        };
        /**
         * Add a new entry into the DAO.
         * @type {(added: TYPE) => Promise<ID>}
         */
        this.create = create ?? function (/** @type {TYPE} */ added) {
            return /** @type {Promise<ID>} */ Promise.reject("Unsupported operation");
        };
        /**
         * Update an existing entry in the DAO.
         * @type {(id: ID, value: TYPE) =½ Promise<boolean>}
         */
        this.update = update ?? function (/** @type {ID} */ id, /** @type {TYPE} */ value) {
            return /** @type {Promise<boolean>} */ Promise.reject("Unsupported operation");
        };

        /**
         * Reove an existing entry in the DAO.
         * @type {(id: ID) => Promise<boolean>}
         */
        this.remove = remove ?? function (/** @type {ID} */ id) {
            return /** @type {Promise<boolean>} */ Promise.reject("Unsupported operation");
        };

    }
}
