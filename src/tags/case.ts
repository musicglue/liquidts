import { Engine } from "../";
import { evalExp } from "../syntax";
import { Scope, Tag, TagToken, Template, Token, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";

interface CaseWhen {
  val: string;
  templates: Template[];
}

export class Case implements Tag {
  private liquid: Engine;

  private cond: string;
  private cases: CaseWhen[];
  private elseTemplates: Template[];

  constructor(liquid: Engine) {
    this.liquid = liquid;
    this.cases = [];
    this.elseTemplates = [];
  }

  public parse(tagToken: TagToken, tokens: Token[]) {
    this.cond = assert(tagToken.args, "must provide args to use Case");
    // tslint:disable-next-line:no-let
    let p: Template[] = [];
    const stream = this.liquid.parser
      .parseStream(tokens)
      .on("tag:when", (token: TagToken) =>
        this.cases.push({
          templates: (p = []),
          val: assert(token.args, "must provide args to use When"),
        }),
      )
      .on("tag:else", () => (p = this.elseTemplates))
      .on("tag:endcase", () => stream.stop())
      .on("template", (tpl: Template) => p.push(tpl))
      .on("end", () => {
        throw new Error(`tag ${tagToken.raw} not closed`);
      });

    stream.start();
  }

  public async render(writer: Writeable, scope: Scope) {
    const cond = evalExp(this.cond, scope);
    for (const branch of this.cases) {
      const val = evalExp(branch.val, scope);
      if (val === cond) {
        await this.liquid.renderer.renderTemplates(branch.templates, scope, writer);
        return;
      }
    }
    await this.liquid.renderer.renderTemplates(this.elseTemplates, scope, writer);
  }
}

export const caseTag = (liquid: Engine) => liquid.registerTag("case", TagFactory(Case, liquid));
