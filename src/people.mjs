
/**
 * @module dune/people
 * The module containing the people data.
 */

import { BasicDao } from "./BasicDao.mjs";

import { ConsoleLogger, Logger } from './logger.mjs';

const log = new ConsoleLogger();
log.logLevel = "all";
 
/** 
 * @template [ID=string] The identifier type.
 * @typedef {Object} NamedProps 
 * @property {string} name The main name of the object.
 * @property {ID} [id] The identifier of the object.
*/

/**
 * The collection of values referred by their identifiers.
 * @template ID The identifeir type of the content.
 * @template CONTENT The content type.
 * @typedef {Record<ID,CONTENT>} Collection
 */

/**
 * @typedef {Object} ValuedProps
 * @property {number} current The current value.
 * @property {number} [minValue] The smallest allowed value. Defaults to no boundary.
 * @property {number} [maxValue] The largest allowed value. Defaults to no boundary.
 */

/**
 * The properties specific to the skills. 
 * @typedef {Object} SkillSpecificProps
 * @property {number} current The current value.
 * @property {number} [minValue=4] The smallest allowed value.
 * @property {number} [maxValue=8] The largest allowed value.
 * @property {number} [maxAdvances=1] The maximum number of advances.
 * @property {number} [advances=0] The current number of advances.
 */

/**
 * The skill properties.
 * @typedef {NamedProps & SkillSpecificProps} SkillProps
 */

/**
 * The collection of skills.
 * @typedef {Collection<string, SkillProps>} Skills
 */

/**
 * The properties specific to the entiteis with skills.
 * @typedef {Object} SkilledProps
 * @property {Skills} [skills] The skills of the person.
 */

/**
 * The properties specific to the people.
 * @typedef {Object} PeopleSpecificProps
 * @property {"Support"|"Minor"|"Major"} [type="Major"] The type of the character.
 */


/**
 * The properties of the people. 
 * @typedef {NamedProps & PeopleSpecificProps & SkilledProps} PeopleProps
 */

/**
 * Class representing a person.
 * @extends {PeopleProps}
 */
export class People {
    /**
     * The character types of the game system.
     * @type {string[]}
     */
    static get characterTypes() {
        return ["Major", "Minor", "Support"];
    }


    /**
     * The default skills of the people.
     * @type {Skills}
     */
    static get defaultSkills() {
        return ["Battle", "Communicate", "Duty", "Move", "Understand"].reduce( (result, skill) => {
            result[skill] = { name: skill, id: skill, minValue: 4, maxValue: 8, current: 4, valueOf() { return this.current } };
            return result;
        }, {})
    }

    /**
     * The type specific skills.
     * @type {Record<string,Skills>} 
     */
    static get typeSpecificSkills() {
        return People.characterTypes.reduce((result, type) => {
            result[type] = People.defaultSkills;
            return result;
        }, {});
    }

    /**
     * Get the default identifier of the people.
     * @param {PeopleProps} props The properties of the people model.
     * @throws {SyntaxError} The name is invalid.
     * @throws {TypeError} The type of the given people model were invalid.
     */
    defaultId(props) {
        if (props && props.name) {
            return props.name;
        } else if (props) {
            throw new SyntaxError("Invalid name");
        } else {
            throw new TypeError("Invalid people - not an implementation of PeopleProps");
        }
    }

    /**
     * Create a new person.
     * @param {PeopleProps} props The properties of the people. 
     */
    constructor(props) {
        this.name = props.name;
        this.id = props.id ?? this.defaultId(props);
        this.type = props.type ?? "Major";
        this.skills = props.skills ?? People.typeSpecificSkills[this.type];
    }



}

/**
 * The POJO properties of the People Dao.
 * @typedef {import("./BasicDao.mjs").DaoProps<string, People>} PeopleDaoProps
 */

/**
 * The DAO handling people.
 * @extends {BasicDao<People>}
 */
export class PeopleDao extends BasicDao {

    /**
     * Create a dao using SQL querys.
     * @param {*} param0 
     * @returns {PeopleDao}
     */
    static fromSql({ dbh, fetchAllQuery, peopleFromQueryResult, peopleToQueryFields = undefined,
        fetchQuery = undefined, updateQuery = undefined, deleteQuery = undefined, insertQuery = undefined
    }) {
        return new PeopleDao({
            all() {
                const rows = dbh.query(fetchAllQuery);
            },
            one: fetchQuery ? (function (id) {
                return this.all().then((entries) => {
                    const result = entries.find(([entryId]) => (id === entryId));
                    if (result) {
                        resolve(result[1]);
                    } else {
                        reject("No such people exists");
                    }
                })
            }) : ((id) => {
                return new Promise((resolve, reject) => {
                    try {
                        const dataSet = dbh.query(fetchQuery, [id]);
                        resolve(peopleFromQueryResult(dataSet));
                    } catch (err) {
                        reject(new RangeError("Invalid identifeir", { cause: err }));
                    }
                })
            })
        })
    }

    /**
     * Create a new people dao.
     * @param {PeopleDaoProps} params The parameters.
     */
    constructor(params) {
        super(params);
    }

}

/**
 * The storage of the people.
 * @type {Map<string, People>}
 */
let people = new Map();

/**
 * @template [ID=string]
 * @param {ID} id The altered identifier.
 * @param {*} oldValue 
 * @param {*} newValue 
 * @returns 
 */
function getUpdateMessage(id, oldValue, newValue) {
    return `Entry %s updated to %o`;
}

const dummyDaoProperties = {
    validReplacement( /** @type {People} */ oldValue, /** @type {People} */ newValue) {
        console.log(`Checking if ${JSON.stringify(newValue)} is valid replacement for ${
            JSON.stringify(newValue)
        }`);
        return newValue.id === undefined || oldValue.id === newValue.id;
    },
    all: () => (Promise.resolve([...people.entries()])),
    one: (id) => {
        return new Promise( (resolve, reject) => {
            if (people.has(id)) {
                resolve(people.get(id));
            } else {
                reject(new RangeError("No such people exists"));
            }
        });
    },
    update: (id, value) => {
        return new Promise((resolve, reject) => {
            try {
                const newValue = new People(value);
                const entry = people.get(id);
                if (entry && this.validReplacement(entry, newValue)) {
                    if (!newValue.id) {
                        newValue.id = entry.id;
                    }
                    log.debug(log.formatMessage(getUpdateMessage(id, entry, newValue), [id, entry, newValue]));
                    people.set(id, newValue);
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (err) {
                // Update failed.
                /** @todo Add error logging */
                log.debug(log.formatMessage(`Update %s failed due error %o`, [id, err]));
                resolve(false);
            }
        });
    },
    remove: (id) => {
        return new Promise((resolve, reject) => {
            resolve(people.delete(id));
        })
    },
    create: (value) => {
        return new Promise((resolve, reject) => {
            try {
                const added = new People(value);
                if (people.has(added.id)) {
                    throw new RangeError("The identifier already reserved");
                } else {
                    people.set(added.id, added);
                    resolve(added.id);
                    return;
                }
            } catch (err) {
                /** @todo Add error logging */
                reject(new TypeError("Invalid new person", { cause: err }));
                return;
            }
        }
        );
    }
};

/**
 * The dummy memory based DAO.
 * @type {PeopleDao}
 */
export const dummyDao = new PeopleDao(dummyDaoProperties)

export default People; 