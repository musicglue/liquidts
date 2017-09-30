const Liquid = require("../dist").default;

const fs = require("fs");
const path = require("path");

const engine = Liquid();
const raw = fs.readFileSync(path.join(__dirname, "sample.liquid"), "utf-8");
const vars = require("./sample.json");
const tmpl = engine.parse(raw);

engine
  .render(tmpl, vars)
  .then(reader =>
    fs.writeFileSync(
      path.join(__dirname, "generated.html"),
      reader.read()
    ));