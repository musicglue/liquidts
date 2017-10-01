import Liquid from "../../src";
import { read } from "../utils";

const engine = Liquid();

describe("Tags", () => {
  describe("Increment", () => {
    test("renders nothing", async () => {
      const tmpl = engine.parse(`{% increment var %}`);
      expect(await engine.render(tmpl).then(read)).toEqual("");
    });

    test("increments an uninitialised counter", async () => {
      const tmpl = engine.parse(`{% increment var %}{{ var }}`);
      expect(await engine.render(tmpl).then(read)).toEqual("1");
    });

    test("increments an initialised counter", async () => {
      const tmpl = engine.parse(`{% increment var %}{{ var }}`);
      expect(await engine.render(tmpl, { var: 4 }).then(read)).toEqual("5");
    });
  });
});
