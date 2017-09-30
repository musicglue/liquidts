import { Engine } from "../";
import { WriteBuffer } from "../buffer";
import * as lexical from "../lexical";
import { Scope, Tag, TagToken, Template, Token, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";

const re = new RegExp(`(${lexical.identifier.source})`);

export class Capture implements Tag {
  private liquid: Engine;
  private templates: Template[];
  private variable: string;

  constructor(liquid: Engine) {
    this.liquid = liquid;
    this.templates = [];
  }

  public parse(token: TagToken, tokens: Token[]) {
    const args = assert(token.args, "Must provide args to use Decrement");
    const match = assert(args.match(re), `illegal identifier: ${args}`);

    this.variable = match[1];

    const stream = this.liquid.parser
      .parseStream(tokens)
      .on("tag:endcapture", () => stream.stop())
      .on("template", (tpl: Template) => this.templates.push(tpl))
      .on("end", () => {
        throw new Error(`tag ${token.raw} not closed`);
      });

    stream.start();
  }

  public async render(_: Writeable, scope: Scope) {
    const output = new WriteBuffer();
    await this.liquid.renderer.renderTemplates(this.templates, scope, output);
    scope.set(this.variable, output.read());
  }
}

export const capture = (liquid: Engine) =>
  liquid.registerTag("capture", TagFactory(Capture, liquid));
