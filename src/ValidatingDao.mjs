
/**
 * @module dao/ValidatingDao
 */

/**
 * The options for validating Data Access Objects. 
 * @template ID The identifier type.
 * @template TYPE Resource value type
 * @typedef {Object} ValidatingDaoOptions
 * @property {Predicate<ID>} [validId] The validator of the identifiers. Defaults to accepting
 * all identifiers.
 * @property {Predicate<TYPE>} [validValue] The validator of the resource values. Defautls to 
 * accepting all identifiers.
 * @property {Predicate<[ID,TYPE]>} [validEntry] The validator of the rsource value and identifier
 * combination. Defaults to the valiidatiom of the id and value. 
 */

/**
 * Create a new validating DAO.
 * 
 * @template ID The identifier type.
 * @template TYPE Resource value type
 * @param {ValidatingDaoOptions<ID,TYPE> & import("./BasicDao.mjs").DaoProps<ID,DAO>} params The parameters
 * of the validatign dao.
 * @constructor
 * @extends {import("./BasicDao.mjs").Dao<ID,TYPE>}
 * @returns {ValidatingDao<ID,TYPE>}
 */
export function ValidatingDao(params) {
    /**
     * @type {ValidatingDao<ID,TYPE>}
     */
    const result = {
        all: params.all,
        one(/** @type {ID} */id) {
            if (params.validId !== undefined && !params.validId(id)) {
                return Promise.reject(new RangeError("No such value exists"));
            } else if (params.one) {
                return params.one(id);
            } else {
                return new Promise((resolve, reject) => {
                    result.all().then(( /** @type {[ID,TYPE][]} */ entries) => {
                        const entry = entries.find((([entryId, entryValue]) => ((params.equalId(entryId, id)))));
                        if (entry) {
                            return resolve(entry[1]);
                        } else {
                            return reject(new RangeError("No such value exists"));
                        }
                    })
                });
            }
        },
        update(/** @type {ID} */ id, /** @type {TYPE} */ value) {
            if (params.validId && !params.validId(id)) {
                    return Promise.reject(new RangeError("Invalid identifier"));
                } else if (params.validValue && !params.validValue(value)) {
                    return Promise.reject(new TypeError("Invalid new value"));
                } else if (params.validEntry && !params.validEntry([id, value])) {
                    return Promise.reject(new TypeError("Invalid value-identifier combination"));
                } else if (params.update) {
                    return params.update(id, value);
                } else {
                    // The operation is not supported.
                    return Promise.reject(new ReferenceError("The update of existing values not supported"));
                }
        },
        remove( /** @type {ID} */ id) {
            if (params.validId !== undefined && !params.validId(id)) {
                return Promise.resolve(false);
            } else if (params.remove) {
                return params.remove(id);
            } else {
                // The operation is not supported.
                return Promise.reject(new ReferenceError("The removal of values not supported"));
            }
        },
        create(/** @type {TYPE} */ value) {
            return new Promise( (remove, resolve) => {
            if (params.validValue && !params.validValue(value)) {
                return reject(new TypeError("Invalid resource value"));
            } else if (params.create) {
                // The identifier can be generated.
                return params.create(value);
            } else {
                return Promise.reject(new ReferenceError("Adding new values not supported"));
            }
        })
    }};

    return result;
}

export default ValidatingDao;