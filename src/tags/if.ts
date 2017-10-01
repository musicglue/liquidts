import { Engine } from "../index";
import { evalExp, isTruthy } from "../syntax";
import { Scope, Tag, TagToken, Template, Token, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";

interface Branch {
  cond: string;
  templates: Template[];
}

export class If implements Tag {
  private branches: Branch[];
  private elseTemplates: Template[];
  private liquid: Engine;

  constructor(liquid: Engine) {
    this.liquid = liquid;
    this.branches = [];
    this.elseTemplates = [];
  }

  public parse(tagToken: TagToken, tokens: Token[]) {
    // tslint:disable-next-line:no-let
    let p: Template[];
    const stream = this.liquid.parser
      .parseStream(tokens)
      .on("start", () =>
        this.branches.push({
          cond: assert(tagToken.args, "must provide args to If"),
          templates: (p = []),
        }),
      )
      .on("tag:elsif", (token: TagToken) =>
        this.branches.push({
          cond: assert(token.args, "must provide args to ElsIf"),
          templates: (p = []),
        }),
      )
      .on("tag:else", () => (p = this.elseTemplates))
      .on("tag:endif", () => stream.stop())
      .on("template", (tpl: Template) => p.push(tpl))
      .on("end", () => {
        throw new Error(`tag ${tagToken.raw} not closed`);
      });

    stream.start();
  }

  public async render(writer: Writeable, scope: Scope) {
    const { renderTemplates } = this.liquid.renderer;
    // tslint:disable-next-line:no-let
    let branch: Branch;
    for (branch of this.branches) {
      if (isTruthy(evalExp(branch.cond, scope))) {
        await renderTemplates(branch.templates, scope, writer);
        return;
      }
    }

    await renderTemplates(this.elseTemplates, scope, writer);
  }
}

export const ifTag = (liquid: Engine) => liquid.registerTag("if", TagFactory(If, liquid));
