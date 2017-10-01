import Liquid from "../../src";
import { read } from "../utils";

const engine = Liquid();

const tmpl = engine.parse(`
{% case foo %}
{% when 'bar' %}
"BAR"
{% when 'baz' %}
"BAZ
{% else %}
"OTHER"
{% endcase %}
`);

describe("Tags", () => {
  describe("Case", () => {
    test("1st branch", async () => {
      const res = await await engine.render(tmpl, { foo: "bar" }).then(read);
      expect(res).toContain("BAR");
      expect(res).not.toContain("BAZ");
      expect(res).not.toContain("OTHER");
    });

    test("2nd branch", async () => {
      const res = await await engine.render(tmpl, { foo: "baz" }).then(read);
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
