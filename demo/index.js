const fs = require("fs");
const path = require("path");
const Express = require("express");
const { PassThrough } = require("stream");
const Liquid = require("../dist").default;

const engine = Liquid();
const raw = fs.readFileSync(path.join(__dirname, "..", "benchmarks", "sample.liquid"), "utf-8");
const vars = require("../benchmarks/sample.json");
const tmpl = engine.parse(raw);

const app = new Express();

app
  .get("/stream", (req, res) => {
    engine
      .render(tmpl, vars, { writer: res })
      .then(() => res.end());
  })
  .get("/simple", async (req, res) => {
    const output = await engine.render(tmpl, vars);
    res.send(output.read());
  })
  .listen(3000, () => {
    console.log("Listening on port 3000");
  });
