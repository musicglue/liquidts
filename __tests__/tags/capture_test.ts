import Liquid from "../../src";
import { read } from "../utils";

const engine = Liquid();

const tmpl = engine.parse(`{% capture foo %}bar{% endcapture %}{{ foo }}`);

describe("Tags", () => {
  describe("Capture", () => {
    test("renders correctly", async () => {
      expect(await engine.render(tmpl).then(read)).toEqual("bar");
    });
  });
});
