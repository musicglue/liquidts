import Liquid from "../../src";

const engine = Liquid();

const tmpl = engine.parse(`{% cycle 'yes', 'no', 'maybe' %}{% cycle 'yes', 'no', 'maybe' %}{% cycle 'yes', 'no', 'maybe' %}{% cycle 'yes', 'no', 'maybe' %}`);

describe("Tags", () => {
  describe("Cycle", () => {
    test("renders correctly", async () => {
      expect(await engine.render(tmpl).then(out => out.read())).toEqual("yesnomaybeyes");
    });
  });
});
