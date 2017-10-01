import { Engine } from "../index";
import { evalExp, isFalsy } from "../syntax";
import { Scope, Tag, TagToken, Template, Token, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";

export class Unless implements Tag {
  private cond: string;
  private templates: Template[];
  private elseTemplates: Template[];
  private liquid: Engine;

  constructor(liquid: Engine) {
    this.liquid = liquid;
    this.templates = [];
    this.elseTemplates = [];
  }

  public parse(tagToken: TagToken, tokens: Token[]) {
    // tslint:disable-next-line:no-let
    let p: Template[];
    const stream = this.liquid.parser
      .parseStream(tokens)
      .on("start", () => {
        p = this.templates;
        this.cond = assert(tagToken.args, "must provide args to use Unless");
      })
      .on("tag:else", () => (p = this.elseTemplates))
      .on("tag:endunless", () => stream.stop())
      .on("template", (tpl: Template) => p.push(tpl))
      .on("end", () => {
        throw new Error(`tag ${tagToken.raw} not closed`);
      });

    stream.start();
  }

  public async render(writer: Writeable, scope: Scope) {
    const cond = evalExp(this.cond, scope);
    const tmpls = isFalsy(cond) ? this.templates : this.elseTemplates;
    await this.liquid.renderer.renderTemplates(tmpls, scope, writer);
  }
}

export const unless = (liquid: Engine) =>
  liquid.registerTag("unless", TagFactory(Unless, liquid));
