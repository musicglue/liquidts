import Liquid from "../../src";
import { read } from "../utils";

const engine = Liquid();

const tmpl = engine.parse(`
{% if foo == 'bar' %}
BAR
{% elsif foo == baz %}
BAZ
{% else %}
OTHER
{% endif %}
`);

describe("Tags", () => {
  describe("If", () => {
    test("main branch", async () => {
      const res = await await engine.render(tmpl, { foo: "bar" }).then(read);
      expect(res).toContain("BAR");
      expect(res).not.toContain("BAZ");
      expect(res).not.toContain("OTHER");
    });

    test("alternate branch", async () => {
      const res = await await engine.render(tmpl, { foo: "baz", baz: "baz" }).then(read);
      expect(res).not.toContain("BAR");
      expect(res).toContain("BAZ");
      expect(res).not.toContain("OTHER");
    });

    test("else", async () => {
      const res = await await engine.render(tmpl, { foo: "foo" }).then(read);
      expect(res).not.toContain("BAR");
      expect(res).not.toContain("BAZ");
      expect(res).toContain("OTHER");
    });
  });
});
