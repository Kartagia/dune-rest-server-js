
import { describe, it } from "mocha";
import { use, expect } from 'chai';
import chaiAsPromised from "chai-as-promised";
import { PeopleDao, People, dummyDao } from "../src/people.mjs";

use(chaiAsPromised);

/**
 * @module test/people
 * Testing people-module with mocha & chai.
 */


function equalPOJOs(obj1, obj2) {
    const obj1props = Object.getOwnPropertyNames(obj1);
    const obj2props = Object.getOwnPropertyNames(obj2);
    return obj1props.length === obj2props.length && obj1props.every((prop) => (obj2props.includes(prop) && deepEquals(obj1[prop], obj2[prop])));
}

function deepEquals(a, b) {
    if (typeof a !== typeof b) { return false; }
    switch (typeof a) {
        case "object":
            if (a === null || b === null) {
                return a === b;
            } else if (Array.isArray(a)) {
                return Array.isArray(b) && a.length === b.length && a.every((entry, i) => (deepEquals(entry, b[i])));
            } else {
                return equalPOJOs(a, b);
            }
        default: 
            return a === b;
    }
}

describe("class People", function () {

    describe("Default skills", function () {
        expect(People.defaultSkills).not.null;
        expect(People.defaultSkills).instanceOf(Object);
    });

    describe("Construction", function () {
        it("Just name", function () {
            const name = "Sirius";
            const result = new People({ name: name });
            expect(result).not.null;
            expect(result).instanceOf(People);
            expect(result.name).equal(name);
            expect(result.id).equal(name);
            expect(result.skills).not.null;

            Object.getOwnPropertyNames(People.defaultSkills).forEach( (skillName) => {
                expect(result.skills, `Missing skill ${skillName}`).property(skillName);
                expect(result.skills[skillName]).property('current', 4);
                expect(result.skills[skillName]).property('minValue', 4);
                expect(result.skills[skillName]).property('maxValue', 8);
                expect(result.skills[skillName]).property('valueOf');
                expect(result.skills[skillName].valueOf()).equal(result.skills[skillName].current);


            });
            expect(result.skills);
        });
    });
});

describe("constant dummyPeople", function () {

    expect(dummyDao.all()).eventually.property("length", 0);

});