import { Engine } from "../index";
import { identifier } from "../lexical";
import { Scope } from "../scope";
import { Tag, TagToken, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";
const re = new RegExp(`(${identifier.source})\\s*=(.*)`);

// tslint:disable:no-class no-expression-statement no-object-mutation no-this
class Assign implements Tag {
  public key: string;
  public value: string;
  private liquid: Engine;

  constructor(liquid: Engine) {
    this.liquid = liquid;
  }

  public parse(token: TagToken) {
    const match = assert((token.args || "").match(re), `illegal token ${token.raw}`);
    this.key = match[1];
    this.value = match[2];
  }

  public async render(_: Writeable, scope: Scope) {
    scope.set(this.key, await this.liquid.evalOutput(this.value, scope));
  }
}

export const assign = (liquid: Engine) => liquid.registerTag("assign", TagFactory(Assign, liquid));
