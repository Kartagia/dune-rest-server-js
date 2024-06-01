
import { FileDao } from "../src/FileDao.mjs";
import { unlink, writeFile } from "node:fs/promises";

import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';
use(chaiAsPromised);


describe("Class File Dao", function () {

    /**
     * Create test file.
     */
    this.beforeAll( async function() {
        await writeFile("number_string.dao.json", JSON.stringify([[1, "one"],[2, "two"],[3, "three"]]));
    });

    /**
     * Remove test file.
     */
    this.afterAll( async function() {
        await unlink("number_string.dao.json");
    });

    it("FileDao without existing file", function () {
        expect(unlink("newFile.dao.json").finally(function () {
            expect(() => {
                const dao = new FileDao("NewFile.dao.json");
            }).not.throw();
            const dao = new FileDao("NewFile.dao.json");
            return dao.all();
        })).eventually.property("length", 0);
    });

    describe("FileDao<number,string>", function() {
        let tested;
        it("Construction", function() {
            expect( () => {tested = new FileDao("number_string.dao.json")}).not.throw();
            expect(tested).not.null;
            expect(tested.all()).eventually.property("length", 3);
        });
        it("all", function() {
            expect(tested.all()).eventually.deep.equal([[1, "one"], [2, "two"], [3, "three"]]);
        });
        it("one", function() {
            expect(tested.one(1)).eventually.equal("one");
            expect(tested.one(2)).eventually.equal("two");
            expect(tested.one(3)).eventually.equal("three");
            expect(tested.one(4)).eventually.rejectedWith(RangeError);
        });
        it("update", function() {
            expect(tested.update(1, "One")).eventually.equal(true);
            expect(tested.one(1)).eventually.equal("One");
            expect(tested.update(0, "Zero")).eventually.rejectedWith(RangeError);
        });
        it("create", function() {
            expect(tested.create("zero")).eventually.rejectedWith(TypeError);
        });
        it("delete", function() {
            expect(tested.delete(1)).eventually.equal(true);
            expect(tested.delete(1)).eventually.equal(false);
            expect(tested.one(1)).eventually.rejectedWith(RangeError);
        });
    });


    describe("FileDao<number,string> with value validator for values ['zero', 'one', 'two', 'three', 'four']", function() {
        let tested;

        function getId(/** @type {string} */ value) {
            if (typeof value === "string") {
                switch (value.toLowerCase().normalize()) {
                    case "zero": return 0;
                    case "one": return 1;
                    case "two": return 2;
                    case "three": return 3;
                    case "four": return 4;
                    default:
                        throw new TypeError("Invalid value");
                }
            } else {
                throw new TypeError("Invalid value");
            }
        }
        const valueValidator = ( /** @type {string} */ value, /** @type {number} */ id=undefined) => {
            const valueId = getId(value);
            if (id !== undefined && id !== valueId) {
                throw new RangeError("The given identifier is invalid");
            }
            return [valueId, value];
        }
        it("Construction", function() {
            expect( () => {tested = new FileDao("number_string.dao.json", undefined, undefined, valueValidator)}).not.throw();
            expect(tested).not.null;
            expect(tested.all()).eventually.property("length", 3);
        });
        it("all", function() {
            expect(tested.all()).eventually.deep.equal([[1, "one"], [2, "two"], [3, "three"]]);
        });
        it("one", function() {
            expect(tested.one(1)).eventually.equal("one");
            expect(tested.one(2)).eventually.equal("two");
            expect(tested.one(3)).eventually.equal("three");
            expect(tested.one(4)).eventually.rejectedWith(RangeError);
        });
        it("update", function() {
            expect(tested.update(1, "One")).eventually.equal(true);
            expect(tested.one(1)).eventually.equal("One");
            expect(tested.update(0, "Zero")).eventually.rejectedWith(RangeError);
        });
        it("create", function() {
            expect(tested.create("zero")).eventually.equal(0);
            expect(tested.create("Four")).eventually.equal(4);
            expect(tested.create("five")).eventually.rejectedWith(TypeError);
        });
        it("delete", function() {
            expect(tested.delete(1)).eventually.equal(true);
            expect(tested.delete(1)).eventually.equal(false);
            expect(tested.one(1)).eventually.rejectedWith(RangeError);
        });
    });

});