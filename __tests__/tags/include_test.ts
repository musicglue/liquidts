import * as path from "path";
import Liquid, { Engine, FileSystem } from "../../src";
import * as t from "../../src/types";
import { identity, read } from "../utils";

const simpleTmpl = "{% include 'test_include' %}";
const variableTmpl = "{% include var %}";
const forTmpl = "{% include var for foo %}";
const simpleWithTmpl = "{% include var with foo %}";

describe("Tags", () => {
  // tslint:disable:no-let
  let engine: Engine;
  let tmpl: t.Template[];
  // tslint:enable:no-let

  describe("Include", () => {
    describe("with no filesystem", () => {
      beforeEach(() => {
        engine = Liquid();
        tmpl = engine.parse(simpleTmpl);
      });

      test("include should throw", async () => {
        const err = await engine.render(tmpl).then(read).catch(identity);
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toContain("line: 1");
      });
    });

    describe("with a filesystem", () => {
      beforeAll(() => {
        const base = path.resolve(__dirname, "..", "support", "liquid");
        const fileSystem = new FileSystem(base, { cache: false, extname: "liquid" });
        engine = Liquid({ fileSystem });
      });

      describe("simple includes", () => {
        beforeEach(() => {
          tmpl = engine.parse(simpleTmpl);
        });

        test("includes the content of the other file", async () => {
          expect(await engine.render(tmpl).then(read)).toEqual("hello\n");
        });
      });

      describe("variable includes", () => {
        beforeEach(() => {
          tmpl = engine.parse(variableTmpl);
        });

        test("includes the content of the other file", async () => {
          expect(await engine.render(tmpl, { var: "test_include" }).then(read)).toEqual("hello\n");
        });
      });

      describe("'with' includes", () => {
        beforeEach(() => {
          tmpl = engine.parse(simpleWithTmpl);
        });

        test("includes the content of the other file", async () => {
          expect(await engine.render(tmpl, { var: "test_simple_with_include", foo: "bar" }).then(read)).toEqual("hello bar\n");
        });
      });

      describe("'for' includes", () => {
        beforeEach(() => {
          tmpl = engine.parse(forTmpl);
        });

        test("single values", async () => {
          const vars = { var: "test_for_include", foo: "bar" };
          expect(await engine.render(tmpl, vars).then(read)).toEqual("bar\n");
        });

        test("collection values", async () => {
          const vars = { var: "test_for_include", foo: ["bar", "baz"] };
          expect(await engine.render(tmpl, vars).then(read)).toEqual("bar\nbaz\n");
        });
      });
    });
  });
});
