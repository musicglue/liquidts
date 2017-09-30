const { Suite } = require("benchmark");
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
  .add("rendering", {
    defer: true,
    fn(deferred) {
      engine.render(tmpl, vars).then(res => res.read()).then(() => deferred.resolve());
    }
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
