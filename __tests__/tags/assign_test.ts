import Liquid from "../../src";
import { read } from "../utils";

const engine = Liquid();

const tmpl = engine.parse(`{% assign foo = 'bar' %}{{ foo }}`);

describe("Tags", () => {
  describe("Assign", () => {
    test("renders correctly", async () => {
      expect(await engine.render(tmpl).then(read)).toEqual("bar");
    });
  });
});
