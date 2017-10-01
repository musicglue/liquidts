import Liquid from "../../src";
import { read } from "../utils";

const engine = Liquid();

const tmpl = engine.parse(`{% comment %}foo{% endcomment %}`);

describe("Tags", () => {
  describe("Comment", () => {
    test("renders nothing", async () => {
      expect(await engine.render(tmpl).then(read)).toEqual("");
    });
  });
});
