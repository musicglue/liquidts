import Liquid from "../../src";
import { read } from "../utils";

const engine = Liquid();

const tmpl = engine.parse(`
{% unless foo == 'bar' %}
BAR
{% else %}
BAZ
{% endunless %}
`);

describe("Tags", () => {
  describe("Unless", () => {
    test("main branch", async () => {
      const res = await await engine.render(tmpl, { foo: "bar" }).then(read);
      expect(res).not.toContain("BAR");
      expect(res).toContain("BAZ");
    });

    test("else", async () => {
      const res = await await engine.render(tmpl, { foo: "foo" }).then(read);
      expect(res).toContain("BAR");
      expect(res).not.toContain("BAZ");
    });
  });
});
