const { Suite } = require("benchmark");
const { PassThrough } = require("stream");
const Liquid = require("../dist").default;

const fs = require("fs");
const path = require("path");

const suite = new Suite();

const engine = Liquid();
const raw = fs.readFileSync(path.join(__dirname, "sample.liquid"), "utf-8");
const vars = require("./sample.json");
const tmpl = engine.parse(raw);

suite
  .add("parsing", () => engine.parse(raw))
  .add("render:writebuffer", {
    defer: true,
    fn(deferred) {
      engine.render(tmpl, vars).then(() => deferred.resolve());
    },
  })
  .add("render:passthrough", {
    defer: true,
    fn(deferred) {
      const writer = new PassThrough();
      engine.render(tmpl, vars, { writer }).then(() => deferred.resolve());
    },
  })
  .on("cycle", event => {
    // tslint:disable-next-line:no-console
    console.log(String(event.target));
  })
  .on("complete", function() {
    // tslint:disable-next-line:no-this no-console
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  // run async
  .run({ async: true });
