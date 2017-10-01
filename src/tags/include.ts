import * as path from "path";
import { Engine, lexical } from "../";
import { evalValue } from "../syntax";
import { Dict, Scope, Tag, TagToken, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";

const forRE = new RegExp(`for\\s+(${lexical.value.source})`);
const withRE = new RegExp(`with\\s+(${lexical.value.source})`);

export class Include implements Tag {
  public forVal: string | undefined;
  public value: string;
  public with: string | undefined;
  private liquid: Engine;

  constructor(liquid: Engine) {
    this.liquid = liquid;
  }

  public parse(token: TagToken): void {
    const args = token.args || "";
    const match = assert(lexical.value.exec(args));
    this.value = match[0];

    const withVar = withRE.exec(args);
    if (withVar) {
      this.with = withVar[1];
    }

    const forVar = forRE.exec(args);
    if (forVar && this.with === undefined) {
      this.forVal = forVar[1];
    }
  }

  public async render(writer: Writeable, scope: Scope, hash: Dict<any>) {
    const filepath = scope.evaluate(this.value);
    const varName = path.basename(filepath);

    if (this.with) {
      hash[varName] = evalValue(this.with, scope);
    }

    const templates = await this.liquid.getTemplate(filepath);

    if (this.forVal) {
      const resolved = scope.evaluate(this.forVal);
      if (Array.isArray(resolved)) {
        // tslint:disable-next-line:no-let
        let item: any;
        for (item of resolved) {
          hash[varName] = item;
          await this.liquid.renderer.renderTemplates(templates, scope.push(hash), writer);
        }
        return;
      } else {
        hash[varName] = resolved;
      }
    }

    await this.liquid.renderer.renderTemplates(templates, scope.push(hash), writer);
  }
}

export const include = (liquid: Engine) =>
  liquid.registerTag("include", TagFactory(Include, liquid));
