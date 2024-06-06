
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
 * The error message of the failed idetnifier validation.
 */
export const ID_VALIDATION_FAILED_MESSAGE = "No such value exists";

/**
 * The error message of the failed value validation.
 */
export const VALUE_VALIDATION_FAILED_MESSAGE = "Invalid new value";

/**
 * The error message of the failed identifer-value-pair validation.
 */
export const ENTRY_VALIDATION_FAILED_MESSAGE = "Invalid value-identifier combination";

/**
 * The error messgae of the duplicate identifier error.
 */
export const DUPLIATE_ID_MESSAGE = "The update of existing values not supported";

/**
 * Th eerror message of the unsupported rupdate operation.
 */
export const UNSUPPORTED_UPDATE_MESSAGE = "The update of values not supported";


/**
 * Th eerror message of the unsupported removal operation.
 */
export const UNSUPPORTED_REMOVAL_MESSAGE = "The removal of values not supported";

/**
 * The erro rmessage of the unsupported create operation.
 */
export const UNSUPPORTED_CREATE_MESSAGE = "Adding new values not supported";
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
                return Promise.reject(new RangeError(ID_VALIDATION_FAILED_MESSAGE));
            } else if (params.one) {
                return params.one(id);
            } else {
                return new Promise((resolve, reject) => {
                    result.all().then(( /** @type {[ID,TYPE][]} */ entries) => {
                        const entry = entries.find((([entryId, entryValue]) => ((params.equalId(entryId, id)))));
                        if (entry) {
                            return resolve(entry[1]);
                        } else {
                            return reject(new RangeError(ID_VALIDATION_FAILED_MESSAGE));
                        }
                    })
                });
            }
        },
        update(/** @type {ID} */ id, /** @type {TYPE} */ value) {
            if (params.validId && !params.validId(id)) {
                    return Promise.reject(new RangeError(ID_VALIDATION_FAILED_MESSAGE));
                } else if (params.validValue && !params.validValue(value)) {
                    return Promise.reject(new TypeError(VALUE_VALIDATION_FAILED_MESSAGE));
                } else if (params.validEntry && !params.validEntry([id, value])) {
                    return Promise.reject(new TypeError(ENTRY_VALIDATION_FAILED_MESSAGE));
                } else if (params.update) {
                    return params.update(id, value);
                } else {
                    // The operation is not supported.
                    return Promise.reject(new ReferenceError(UNSUPPORTED_CREATE_MESSAGE));
                }
        },
        remove( /** @type {ID} */ id) {
            if (params.validId !== undefined && !params.validId(id)) {
                return Promise.resolve(false);
            } else if (params.remove) {
                return params.remove(id);
            } else {
                // The operation is not supported.
                return Promise.reject(new ReferenceError(UNSUPPORTED_REMOVAL_MESSAGE));
            }
        },
        create(/** @type {TYPE} */ value) {
            return new Promise( (remove, resolve) => {
            if (params.validValue && !params.validValue(value)) {
                return reject(new TypeError(VALUE_VALIDATION_FAILED_MESSAGE));
            } else if (params.create) {
                // The identifier can be generated.
                return params.create(value);
            } else {
                return Promise.reject(new ReferenceError(UNSUPPORTED_CREATE_MESSAGE));
            }
        })
    }};

    return result;
}

export default ValidatingDao;