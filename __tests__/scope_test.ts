import { Scope } from "../src/scope";
import { Dict } from "../src/types";

describe("Scope", () => {
  // tslint:disable:no-let
  let scope: Scope;
  let vars: Dict<any> = {};
  // tslint:enable:no-let

  describe("functions present", () => {
    beforeEach(() => { scope = new Scope(vars); });

    test("get", () => {
      expect(scope.get).toBeInstanceOf(Function);
    });

    test("set", () => {
      expect(scope.set).toBeInstanceOf(Function);
    });

    test("push", () => {
      expect(scope.push).toBeInstanceOf(Function);
    });
  });

  describe("simple behaviour", () => {
    beforeEach(() => {
      vars = { a: 10, b: { c: 20 } };
      scope = new Scope(vars);
    });

    describe("getters", () => {
      test("simple", () => {
        expect(scope.get("a")).toEqual(vars.a);
      });

      test("dot separated", () => {
        expect(scope.get("b.c")).toEqual(vars.b.c);
      });

      test("bracket", () => {
        expect(scope.get("b[c]")).toEqual(vars.b.c);
      });
    });

    describe("setters", () => {
      test("simple", () => {
        scope.set("z", true);
        expect(scope.get("z")).toEqual(true);
      });

      test("dot separated", () => {
        scope.set("z.a", true);
        expect(scope.get("z.a")).toEqual(true);
      });

      test("bracket", () => {
        scope.set("z[a]", true);
        expect(scope.get("z.a")).toEqual(true);
      });
    });
  });

  describe("stack behaviour", () => {
    // tslint:disable:no-let
    let parent: Scope;
    let parentVars: Dict<any>;
    // tslint:enable:no-let

    beforeEach(() => {
      parentVars = { a: 10, b: { c: 20 }, f: 5, g: { h: 5 } };
      vars = { c: 20, d: { e: 10 }, f: 10, g: { i: 10 } };
      parent = new Scope(parentVars);
      scope = parent.push(vars);
    });

    describe("accessing parent vars", () => {
      test("simple", () => {
        expect(scope.get("a")).toEqual(parentVars.a);
      });

      test("dot separated", () => {
        expect(scope.get("b.c")).toEqual(parentVars.b.c);
      });

      test("bracket", () => {
        expect(scope.get("b[c]")).toEqual(parentVars.b.c);
      });
    });

    describe("accessing head vars", () => {
      test("simple", () => {
        expect(scope.get("c")).toEqual(vars.c);
      });

      test("dot separated", () => {
        expect(scope.get("d.e")).toEqual(vars.d.e);
      });

      test("bracket", () => {
        expect(scope.get("d[e]")).toEqual(vars.d.e);
      });
    });

    describe("overriden vars", () => {
      test("use the top of the stack", () => {
        expect(scope.get("f")).toEqual(vars.f);
        expect(scope.get("f")).not.toEqual(parentVars.f);
      });

      test("partial overrides overwrite the whole subtree", () => {
        expect(scope.get("g")).toEqual({ i: 10 });
      });
    });
  });
});
