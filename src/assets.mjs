
/**
 * @module dune/model/asset
 */


/** 
 * @template [ID=string] The identifier type.
 * @typedef {Object} NamedProps 
 * @property {string} name The main name of the object.
 * @property {ID} [id] The identifier of the object.
*/

/**
 * The implementation of a named properties.
 * @template [ID=string] The identifief type.
 * @extends {NamedProps<ID>}
 */
export class Named {

    /**
     * The name of the named.
     * @type {string}
     */
    #name;

    /**
     * The identifier of the named.
     * @type {ID|undefined}
     */
    #id;

    /**
     * Create a new named properties.
     * @param {NamedProps<ID> & Partial<{validId: Predicate<ID>}>} props 
     */
    constructor(props) {
        this.name = props.name;
        this.id = props.id;
        this.validId = props.validId ?? (()=>true);
    }

    /**
     * Test validity of the name.
     * @param {*} newName The tested new name. 
     * @returns {boolean} True, if and only if the name is a valid name.
     */
    validName(newName) {
        return typeof newName === "string";
    }

    get name() {
        return this.#name;
    }

    set name(newName) {
        if (this.validName(newName)) {
            this.#name = newName;
        } else {
            throw new TypeError("Invalid new name");
        }
    }

    get id() {
        return this.#id;
    }

    set id(newId) {
        if (this.validId(newId)) {
            this.#id = newId;
        } else {
            throw new TypeError("Invalid new identifier");
        }
    }
}

/**
 * The trait specific properties.
 * @typedef {Object} TraitSpecificProps
 * @property {string} description The description of the trait.
 * @property {number} [minLevel=1] The minimum level of the Trait.
 * @property {number} [maxlevel=10] The maximum level of the Trait.
 */

/**
 * The trait POJO.
 * @typedef {NamedProps<string½ & TraitSpecificProps} TraitProps
 */

/**
 * The collection of traits.
 * @typedef {Array<TraitProps>} Traits
 */

/**
 * A class reprsenting a single trait.
 * @extrends {TraitProps}
 */
export class Trait {

    /**
     * Create a new Trait from the given Trait Properties.
     * @param {TraitProps} params The construction paramters of the trait. 
     */
    constructor(params) {
        super(params);
        this.minLevel = params.minLevel ?? 1;
        this.maxLevel = params.maxLevel ?? 10;
    }

    validLevel(level) {
        return Number.isSafeInteger(level) && level >= this.minLevel && level <= this.maxLevel;
    }

    toString() {
        return `${this.name}`;
    }
}


/**
 * The asset specific properties.
 * @typedef {Object} AssetSpecificProps
 * @property {string} description The description of the trait.
 * @property {number} [minQuality=0] The minimum quality of the Asset.
 * @property {number} [maxQuality=4] The maximum quality of the Asset.
 * @property {Traits} [traits] The traits of the asset.
 * @property {string[]} [types] The quality types. 
 */

/**
 * The trait POJO.
 * @typedef {TraitProps & AssetSpecificProps} AssetProps
 */


/**
 * A class representing an asset. 
 * @extrends {Trait}
 */
export class Asset extends Trait {

    /**
     * Create a new asset.
     * @param {AssetProps} params The asset properties.
     */
    constructor(params) {
        super(params);
        this.minQuality = params.minQuality ?? 0;
        this.maxQuality = params.maxQuality ?? 4;
        this.traits = params.traits || [];
        this.types = params.types = [];
    }

    validQuality(quality) {
        return Number.isSafeInteger(quality) && quality >= this.minQuality && quality <= this.maxQuality;
    }

    /**
     * Convert asset into string.
     * @returns {string} The string representation of the asset.
     */
    toString() {
        return `${super.toString()}${this.types && this.types.length ? `(${this.types.join(",")})` : ""}${this.traits && this.traits.length ? `[${this.traits.join(",")}}` : ""}`;
    }

    /**
     * Does the asset have given trait.
     * @param {string} traitName The name of the seeked trait.
     * @return {boolean} True, if and only if the asset has given trait.
     */
    hasTrait(traitName) {
        return this.traits.find( (trait) => (trait.name === traitName)) !== undefined;
    }
}