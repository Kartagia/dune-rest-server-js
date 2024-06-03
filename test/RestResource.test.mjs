import { describe, it } from "mocha";
import chaiAsPromised from "chai-as-promised";
import { use, expect } from "chai";
import { BasicDao } from "../src/BasicDao.mjs";
import { RestResource, orElse } from "../src/restServer.mjs";

describe("class RestResource", function () {
  /**
   * The basic dao.
   * @type {BasicDao<number, string>}
   */
  [
    ["Readonly empty BasicDao<number,string>", new BasicDao({}), []],
    [],
  ].forEach(
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
});
