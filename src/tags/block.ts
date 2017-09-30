import { WriteBuffer } from "../buffer";
import { Engine } from "../index";
import { Scope, Tag, TagToken, Template, Token, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";

export class Block implements Tag {
  private liquid: Engine;
  private block: string;
  private tpls: Template[];

  constructor(liquid: Engine) {
    this.liquid = liquid;
    this.tpls = [];
  }

  public parse(tagToken: TagToken, tokens: Token[]) {
    const args = assert(tagToken.args, "must provide args for Layout");
    const match = /\w+/.exec(args);
    this.block = match ? match[0] : "anonymous";
    const stream = this.liquid.parser
      .parseStream(tokens)
      .on("tag:endblock", () => stream.stop())
      .on("template", (tpl: Template) => this.tpls.push(tpl))
      .on("end", () => {
        throw new Error(`tag ${tagToken.raw} not closed`);
      });

    stream.start();
  }

  public async render(writer: Writeable, scope: Scope) {
    // tslint:disable-next-line:no-let
    let html = scope.get(`__private.blocks.${this.block}`);
    if (html === undefined || html.read === undefined) {
      const cacher = new WriteBuffer();
      await this.liquid.renderer.renderTemplates(this.tpls, scope, cacher);
      scope.set(`__private.blocks.${this.block}`, cacher);
      html = cacher;
    }

    writer.write(html.read());
  }
}

export const block = (liquid: Engine) => liquid.registerTag("block", TagFactory(Block, liquid));
