import { describe, it } from "mocha";
import chaiAsPromised from "chai-as-promised";
import { use, expect } from "chai";
import { BasicDao } from "../src/BasicDao.mjs";
import { RestResource, orElse } from "../src/restServer.mjs";

describe("class RestResource", function () {

  /**
   * Default create identifier function.
   * @param {string} value 
   * @returns {number|undefined} The identifier for the given value.
   */
  function createId(/** @type {string) */ value) {
    switch (value.normalize().toLowerCase(value)) {
      case "zero":
        return 0;
      case "one":
        return 1; 
      case "two":
        return 2; 
      case "three":
        return 3;
        case "four":
          return 4;
      default:
        return undefined;
    }
  }

  /**
   * The basic dao.
   * @type {BasicDao<number, string>}
   */
  [
    ["BasicDao<number,string>", []],
    ["BasicDao<number,string> with members [[1, 'Three', 2, 'One', 3, 'Two']", [[1, 'Three'], [2, 'One'], [3, 'Two']]],
    ["BasicDao<number,string> with members [[1, '1', 2, '2', 3, '3']", [[1, '1'], [2, '2'], [3, '3']]]
  ].reduce( (result, [baseName, entries]) => {
    [ ["Read only", {} ], 
    ["Updateable", { update: true }], 
    ["Removable", { remove: true }], 
    ["Insertable", { createId }]].forEach( (prefix, supported) => {
      const daoParam = {
        entries, 
        all() {
          return Promise.resolve([...(this.entries)]);
        },
        update(id, value) {
          if (supported.update) {
          return new Promise( (resolve, reject) => {
            const index = this.entries.findIndex( ([entryId]) => (entryId === id));
            if (index >= 0) {
              if (this.entries[index][1] !== value) {
                this.entries.splice(index, 1, [id, value]);
                resolve(true);  
              } else {
                resolve(false);
              }
            } else {
              reject(new RangeError(`Cannot update non-existing value`));
            }
          });
          } else {
            return Promise.reject(new ReferenceError("Update not supported"))
          }
        },
        remove(id) {
          if (supported.remove) {
            return new Promise( (resolve, reject) => {
              const count = this.entries.length;
              this.entries = this.entries.filter( (entry) => (entry[0] !== id));
              resolve(this.entries.length !== count);
            })
          } else {
            return Promise.reject(new ReferenceError("Removal not supported"));
          }
        }, 
        create(value) {
          if (supported.createId) {
            return new Promise( (resolve, reject) => {
              const id = supported.createId(value);
              const entry = this.entries.find( (entry) => (entry[0] === id));
              if (entry) {
                reject(new RangeError("Identifier already reserverd"))
              } else {
                const id = supported.createId(value);
                if (id === undefined) {
                  reject(new TypeError("Invalid new value"));
                } else {
                  this.entreis = [...this.entries, [id, value]];
                  resolve(true);
                }
              }
            })
          } else {
            return Promise.reject(new ReferenceError("Create not supported"));
          }
        }
      };
      result.push([`${prefix} ${baseName}`, new BasicDao(daoParam), entries, 
        supported.createId
      ]);
    });
    return result;
  }, []
).forEach(
    ([
      testName,
      testDao,
      daoEntries,
      genId = undefined,
      formatId = undefined,
      parseId = undefined,
      formatData = undefined,
      parseData = undefined,
      linkGenerator = undefined,
    ]) => {
      /**
       * @type {(import("../src/restServer.mjs").RestResourceOptions<number,string> & {
       * caseName:string})[]}
       */
      const testValues = [
        {
          caseName: "undefined",
          parseId: undefined,
          formatId: undefined,
          parseValue: undefined,
          formatValue: undefined,
        },
        {
          caseName: "JSON",
          parseId: (val) => {
            const num = JSON.parse(num);
            if (Number.isInteger(num)) {
              return num;
            } else {
              throw new RangeError("Invalid identifief");
            }
          },
          formatId: (id) => JSON.format(id),
          formatValue: (val) => JSON.stringify(val),
          parseValue: (val) => JSON.parse(val),
        },
      ];

      describe(`Test ${testName}:`, function () {
        describe("RestResource<number, string>.checkIdFormatter", function () {
            const tester = RestResource.checkIdFormatter;
          testValues
            .map((options) => {
              return [options.caseName, options.formatId, orElse(options.formatId, RestResource.defaultIdFormatter)]
            })
            .forEach(
              ([
                caseName,
                testValue,
                expectedResult = undefined,
                expectedException = undefined
              ]) => {
                it(`Test ${caseName}`, function () {
                  if (expectedException !== undefined) {
                    expect(() => {
                      tester(testValue);
                    }).to.throw(expectedException);
                  } else {
                    expect(() => {
                      RestResource.checkIdFormatter(testValue);
                    }).to.not.throw();
                    const result = tester(testValue);
                    expect(result).equal(expectedResult);
                  }
                });
              }
            );
        });
      });

      describe("RestResource<number, string>.checkIdParser", function () {
        const tester = RestResource.checkIdParser;
        testValues
          .map((options) => {
            return [options.caseName, options.parseId, orElse(options.parseId, 
                RestResource.defaultIdParser)]
          })
          .forEach(
            ([
              caseName,
              testValue,
              expectedResult = undefined,
              expectedException = undefined
            ]) => {
              it(`Test ${caseName}`, function () {
                if (expectedException !== undefined) {
                  expect(() => {
                    tester(testValue);
                  }).to.throw(expectedException);
                } else {
                  expect(() => {
                    RestResource.checkIdFormatter(testValue);
                  }).to.not.throw();
                  const result = tester(testValue);
                  expect(result).equal(expectedResult);
                }
              });
            }
          );
      });

      describe("RestResource<number, string>.checkFormatValue", function () {});

      describe("RestResource<number, string>.checkParseValue", function () {});
    }
  );

  describe("Construction", function() {

  } )
});
