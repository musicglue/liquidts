import { Engine, lexical } from "../";
import { evalValue } from "../syntax";
import { Dict, Scope, Tag, TagToken, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";

const withRE = new RegExp(`with\\s+(${lexical.value.source})`);

export class Include implements Tag {
  public value: string;
  public with: string;
  private liquid: Engine;

  constructor(liquid: Engine) {
    this.liquid = liquid;
  }

  public parse(token: TagToken): void {
    const args = token.args || "";
    const match = assert(lexical.value.exec(args));
    this.value = match[0];

    const additional = withRE.exec(args);
    if (additional) {
      this.with = additional[1];
    }
  }

  public async render(writer: Writeable, scope: Scope, hash: Dict<any>) {
    const filepath = evalValue(this.value, scope);
    const register = this.liquid.options;

    if (this.with) {
      hash[filepath] = evalValue(this.with, scope);
    }

    await this.liquid
      .getTemplate(filepath, register.root)
      .then(templates => this.liquid.renderer.renderTemplates(templates, scope.push(hash), writer));
  }
}

export const include = (liquid: Engine) =>
  liquid.registerTag("include", TagFactory(Include, liquid));
