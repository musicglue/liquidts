import Liquid from "../src";
import { filters } from "../src/filters";

const engine = Liquid();
const render = (tmpl: string, args?: any): Promise<string> =>
  engine.parseAndRender(tmpl, args).then(out => out.read());

describe("Filters", () => {
  test("abs", async () => {
    expect(filters.abs(-10)).toEqual(10);
    expect(await render("{{ var | abs }}", { var: -10 })).toEqual("10");
  });

  test("append", async () => {
    expect(filters.append("a", "b")).toEqual("ab");
    expect(await render("{{ var | append: more }}", { var: "hello", more: "world" })).toEqual("helloworld");
  });

  test("capitalize", async () => {
    expect(filters.capitalize("lower")).toEqual("Lower");
    expect(await render("{{ var | capitalize }}", { var: "hello" })).toEqual("Hello");
  });

  test("ceil", async () => {
    expect(filters.ceil(9.7)).toEqual(10);
    expect(await render("{{ 9.7 | ceil }}")).toEqual("10");
  });

  test.skip("date", () => {
    expect(filters.date(new Date(), "%Y")).toEqual(new Date().getFullYear().toString());
    expect(filters.date("now", "%Y")).toEqual(new Date().getFullYear().toString());
  });

  test("default", async () => {
    expect(filters.default("yes", "default")).toEqual("yes");
    expect(filters.default(null, "default")).toEqual("default");
    expect(await render("{{ var | default: 'cheese' }}")).toEqual("cheese");
  });

  test("divided_by", async () => {
    expect(filters.divided_by(10, 2)).toEqual(5);
    expect(await render("{{ var | divided_by: 5 }}", { var: 10 })).toEqual("2");
  });

  test("downcase", async () => {
    expect(filters.downcase("HELLO")).toEqual("hello");
    expect(await render("{{ 'UPPER' | downcase }}")).toEqual("upper");
  });

  test("escape", async () => {
    expect(filters.escape("&")).toEqual("&amp;");
    expect(await render("{{ '&' | escape }}")).toEqual("&amp;");
  });

  test("escape_once", async () => {
    expect(filters.escape_once("&")).toEqual("&amp;");
    expect(filters.escape_once("&amp;")).toEqual("&amp;");
    expect(await render("{{ '&amp;' | escape_once }}")).toEqual("&amp;");
  });

  test("first", async () => {
    expect(filters.first([1])).toEqual(1);
    expect(filters.first("hello")).toEqual("h");
    expect(await render("{{ 'hello' | first }}")).toEqual("h");
  });

  test("floor", async () => {
    expect(filters.floor(9.7)).toEqual(9);
    expect(await render("{{ 9.7 | floor }}")).toEqual("9");
  });

  test("join", async () => {
    expect(filters.join(["1", "2"])).toEqual("12");
    expect(filters.join(["1", "2"], ",")).toEqual("1,2");
    expect(await render("{{ var | join }}", { var: ["1", "2"]})).toEqual("12");
  });

  test("json", async () => {
    expect(filters.json({ a: 10 })).toEqual("{\"a\":10}");
    expect(filters.json(9)).toEqual("9");
    expect(await render("{{ var | json }}", { var: { a: 10 }})).toEqual("{\"a\":10}");
  });

  test("last", async () => {
    expect(filters.last([1, 2])).toEqual(2);
    expect(filters.last("hello")).toEqual("o");
    expect(await render("{{ 'hello' | last }}")).toEqual("o");
  });

  test("lstrip", async () => {
    expect(filters.lstrip("   hello")).toEqual("hello");
    expect(await render("{{ '   hello' | lstrip }}")).toEqual("hello");
  });

  test("map", async () => {
    expect(filters.map([{ a: 10 }, { a: 20 }], "a")).toEqual([10, 20]);
    expect(await render("{{ var | map: 'a' | join }}", {
      var: [{ a: "1" }, { a: "2" }],
    })).toEqual("12");
  });

  test("minus", async () => {
    expect(filters.minus(10, 5)).toEqual("5");
    expect(await render("{{ 10 | minus: var }}", { var: 5 })).toEqual("5");
  });

  test("modulo", async () => {
    expect(filters.modulo(11, 10)).toEqual("1");
    expect(filters.modulo(10, 10)).toEqual("0");
    expect(await render("{{ 12 | modulo: 10 }}")).toEqual("2");
  });

  test("newline_to_br", async () => {
    expect(filters.newline_to_br("hello\nworld")).toEqual("hello<br/>world");
    expect(await render("{{ var | newline_to_br }}", { var: "hello\nworld" })).toEqual("hello<br/>world");
  });

  test("plus", async () => {
    expect(filters.plus(1, 1)).toEqual("2");
    expect(filters.plus("10", "2")).toEqual("12");
    expect(await render("{{ 10 | plus: 5 }}")).toEqual("15");
  });

  test("prepend", async () => {
    expect(filters.prepend("hello", "world")).toEqual("worldhello");
    expect(await render("{{ 'world' | prepend: 'hello' }}")).toEqual("helloworld");
  });

  test("remove", async () => {
    expect(filters.remove("hihiworld", "hi")).toEqual("world");
    expect(await render("{{ 'hihiworld' | remove: 'hi' }}")).toEqual("world");
  });

  test("remove_first", async () => {
    expect(filters.remove_first("hihiworld", "hi")).toEqual("hiworld");
    expect(await render("{{ 'hihiworld' | remove_first: 'hi' }}")).toEqual("hiworld");
  });

  test("replace", async () => {
    expect(filters.replace("hihiworld", "hi", "mad")).toEqual("madmadworld");
    expect(await render("{{ var | replace: 5, other }}", { var: "5 times", other: "a" })).toEqual("a times");
  });

  test("replace_first", async () => {
    expect(filters.replace_first("hihiworld", "hi", "mad")).toEqual("madhiworld");
    expect(await render("{{ '55 times' | replace_first: 5, 'a' }}")).toEqual("a5 times");
  });

  test("reverse", async () => {
    expect(filters.reverse([1, 2])).toEqual([2, 1]);
    expect(await render("{{ var | reverse | join }}", { var: [1, 2] })).toEqual("21");
  });

  test("round", async () => {
    expect(filters.round(10.1)).toEqual(10);
    expect(filters.round(10.5)).toEqual(11);
    expect(await render("{{ 10.1 | round }}")).toEqual("10");
  });

  test("rstrip", async () => {
    expect(filters.rstrip("hello   ")).toEqual("hello");
    expect(await render("{{ 'hello ' | rstrip }}")).toEqual("hello");
  });

  test("size", async () => {
    expect(filters.size("hello")).toEqual(5);
    expect(filters.size([1, 2])).toEqual(2);
    expect(await render("{{ 'hello' | size }}")).toEqual("5");
  });

  test("slice", async () => {
    const input = [1, 2, 3, 4, 5];
    expect(filters.slice("hello", 2, 1)).toEqual("l");
    expect(filters.slice(input, 2, 2)).toEqual([3, 4]);
    expect(await render("{{ var | slice: 2, 2 | join }}", { var: input })).toEqual("34");
  });

  test("sort", async () => {
    expect(filters.sort([2, 3, 1, 4])).toEqual([1, 2, 3, 4]);
    expect(filters.sort([
      { a: 10 },
      { a: 5 },
      { a: 7 },
    ], "a")).toEqual([
      { a: 5 },
      { a: 7 },
      { a: 10 },
    ]);
    expect(await render("{{ 'hello' | sort | join }}")).toEqual("ehllo");
  });

  test("split", async () => {
    expect(filters.split("h e l l o", " ")).toEqual(["h", "e", "l", "l", "o"]);
    expect(await render("{{ 'hello,world' | split: ',' | join: '-' }}")).toEqual("hello-world");
  });

  test("strip", async () => {
    expect(filters.strip(" hello ")).toEqual("hello");
    expect(await render("{{ ' hello ' | strip }}")).toEqual("hello");
  });

  // TODO: inline html breaks parser or something
  test("strip_html", async () => {
    expect(filters.strip_html("<p>hello</p>")).toEqual("hello");
    expect(await render("{{ var | strip_html }}", { var: "<p>hello</p>" })).toEqual("hello");
  });

  test("strip_newlines", async () => {
    expect(filters.strip_newlines("hello\nworld")).toEqual("helloworld");
    expect(await render("{{ var | strip_newlines }}", { var: "hello\nworld" })).toEqual("helloworld");
  });

  test("times", async () => {
    expect(filters.times(2, 5)).toEqual(10);
    expect(await render("{{ 10 | times: 5 }}")).toEqual("50");
  });

  test("truncate", async () => {
    expect(filters.truncate("hello world", 8)).toEqual("hello...");
    expect(filters.truncate("hello", 8)).toEqual("hello");
    expect(await render("{{ 'hello world' | truncate: 8 }}")).toEqual("hello...");
  });

  test("truncatewords", async () => {
    expect(filters.truncatewords("a b c d e", 3)).toEqual("a b c...");
    expect(filters.truncatewords("a b c d e", 5)).toEqual("a b c d e");
    expect(await render("{{ 'a b c' | truncatewords: 1 }}")).toEqual("a...");
  });

  test("unescape", async () => {
    expect(filters.unescape("&amp;")).toEqual("&");
    expect(await render("{{ '&amp;' | unescape }}")).toEqual("&");
  });

  test("uniq", async () => {
    expect(filters.uniq([1, 1, 2])).toEqual([1, 2]);
    expect(await render("{{ 'aabbcc' | uniq | join }}")).toEqual("abc");
  });

  test("upcase", async () => {
    expect(filters.upcase("awesome")).toEqual("AWESOME");
    expect(await render("{{ 'abc' | upcase }}")).toEqual("ABC");
  });

  test("url_encode", async () => {
    expect(filters.url_encode("hello world")).toEqual("hello%20world");
    expect(await render("{{ 'hello world' | url_encode }}")).toEqual("hello%20world");
  });
});
