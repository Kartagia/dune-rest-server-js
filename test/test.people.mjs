
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

function testNamed(tested) {
    expect(tested, "Not an object").instanceOf(Object);
    expect(tested).property("name");
    expect(tested.name).string;
    if ("id" in tested) {
        expect(["string", "undefined"].some((type) => (typeof tested.id === type)), "Invalid id type").true;
    }
}

function testSkillProps(tested) {
    testNamed(tested);
    [["current", "number"]].forEach( ([requiredProperty, type]) => {
        expect(tested, `Missing required property ${requiredProperty}`).property(requiredProperty);
        expect(tested[requiredProperty]).a(type);
    });
    ["minValue", "maxValue"].map( (prop) => ([prop, "number"])).forEach( ([optionalProperty, type]) => {
        expect(tested, `Missing required property ${optionalProperty}`).property(optionalProperty);
        if (optionalProperty in tested && tested[optionalProperty] !== undefined) {
            expect(tested[optionalProperty]).a(type);
        }
    });
}

describe("class People", function () {

    describe("Default skills", function () {
        it("Exists", function() {
            expect(People.defaultSkills).not.null;
        });
        it("Is object", function() {
            expect(People.defaultSkills).instanceOf(Object);
        });
        it("Members are skill props", function() {
            Object.getOwnPropertyNames(People.defaultSkills).forEach( (skillName) => {
                const tested = People.defaultSkills[skillName];
                expect(tested).instanceOf(Object);
                testNamed(tested);
                testSkillProps(tested);
                expect(tested).property("minValue", 4);
                expect(tested).property("maxValue", 8);
                expect(tested).property("current", 4);
            });
            expect(People.defaultSkills).instanceOf(Object);
        });
    });

    describe("Construction", function () {
        it("Just name", function () {
            const name = "Sirius";
            const result = new People({ name: name });
            testPeople(result, name);
        });
        it("Name and Id", function () {
            const name = "Rigel";
            const id = "Carrowfan.Rigel"
            const result = new People({ name: name, id: id });
            testPeople(result, name, id);
        });
    });
});

describe("constant dummyPeople", function () {

    it(`All`, function() {
        expect(dummyDao.all()).eventually.property("length", 0);
    })

    describe('Add new person', function() {
        it("With name only", function() {
            let id = "Sirius";
            let name = id;
            expect(dummyDao.create({name}), `Adding ${id} failed`).eventually.equal(id);
            expect(dummyDao.all().then( (entries) => (entries.find( ([entryId, entry]) => (entry.name === name && entryId===id)) ?.id) ),
            "Could not find aadded person from all").eventually.equal(id);
        });
        it("Name and Id", function () {
            const name = "Rigel";
            const id = "Carrowfan.Rigel"
            expect(dummyDao.create({name, id}), `Adding ${id} failed`).eventually.equal(id);
            expect(dummyDao.all().then( (entries) => (entries.find( ([entryId, entry]) => (entry.name === name && entryId===id)) ?.id) ),
            "Could not find aadded person from all").eventually.equal(id);
        });
        it("Duplicate Name with Different Default Id", function () {
            const name = "Rigel";
            const id = name;
            expect(dummyDao.create({name}), `Adding ${id} failed`).eventually.equal(id);
            expect(dummyDao.all().then( (entries) => (entries.find( ([entryId, entry]) => (entry.name === name && entryId===id)) ?.id) ),
            "Could not find aadded person from all").eventually.equal(id);
        });
        it("Duplicate Name with duplicate Default Id", function () {
            const name = "Rigel";
            const id = name;
            expect(dummyDao.create({name}), `Adding duplicate id ${id} failed to throw`).eventually.rejectedWith(RangeError);
        });
    });


    describe("Update people", function() {
        it("Updating non-existing", function() {
            const name = "Taloudenhoitaja";
            const id = "Taloudenhoitaja";
            const updated = new People({name, id});
            expect(dummyDao.update(id, updated)).eventually.false;
        });
        it(`Updating skills of Sirius`, function() {
            const id = "Sirius";
            expect(dummyDao.one(id).then( (current) => {
                return {
                    ...current,
                    name: "Sirius II"
                }
            }).then( (newValue) => (dummyDao.update(id, newValue)))).eventually.true;
        });
    });

});

function testPeople(result, name, id=undefined, type=undefined) {
    expect(result).not.null;
    expect(result).instanceOf(People);
    expect(result.name).equal(name);
    expect(result.id).equal(id ?? name);
    expect(result.skills).not.null;
    expect(result.type).equal(type ?? "Major");

    Object.getOwnPropertyNames(People.defaultSkills).forEach((skillName) => {
        expect(result.skills, `Missing skill ${skillName}`).property(skillName);
        expect(result.skills[skillName]).property('current', 4);
        expect(result.skills[skillName]).property('minValue', 4);
        expect(result.skills[skillName]).property('maxValue', 8);
        expect(result.skills[skillName]).property('valueOf');
        expect(result.skills[skillName].valueOf()).equal(result.skills[skillName].current);
    });
}
