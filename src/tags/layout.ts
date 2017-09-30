import { Engine } from "../index";
import * as lexical from "../lexical";
import { evalValue } from "../syntax";
import { Dict, Scope, Tag, TagToken, Template, Token, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";

export class Layout implements Tag {
  private liquid: Engine;
  private layout: string;
  private tpls: Template[];

  constructor(liquid: Engine) {
    this.liquid = liquid;
  }

  public parse(tagToken: TagToken, tokens: Token[]) {
    const args = assert(tagToken.args, "must provide args for Layout");
    const match = assert(lexical.value.exec(args), `illegal token ${tagToken.raw}`);
    this.layout = match[0];
    this.tpls = this.liquid.parser.parse(tokens);
  }

  // TODO: This doesn't look right. At all. As we are treating rendering in a stream
  // this will write the contents, then they layout after it, which seems whack.
  public async render(writer: Writeable, scope: Scope, hash: Dict<any>) {
    const resolved = evalValue(this.layout, scope);
    await this.liquid.renderer.renderTemplates(this.tpls, scope, writer);
    const tmpls = await this.liquid.getTemplate(resolved);
    await this.liquid.renderer.renderTemplates(tmpls, scope.push(hash), writer);
  }
}

export const layout = (liquid: Engine) => liquid.registerTag("layout", TagFactory(Layout, liquid));
