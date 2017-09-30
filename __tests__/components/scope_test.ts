import { Scope } from "../../src/scope";

describe("Scope", () => {
  describe("constructing", () => {
    // tslint:disable-next-line:no-let
    let item: Scope;

    beforeEach(() => {
      item = new Scope([], {});
    });

    test("responds to getAll", () =>
      expect(item.getAll).toBeInstanceOf(Function));
  });
});
