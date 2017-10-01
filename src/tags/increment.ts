import { Engine } from "../";
import * as lexical from "../lexical";
import { Scope, Tag, TagToken, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";

export class Increment implements Tag {
  private variable: string;

  public parse(token: TagToken) {
    const args = assert(token.args, "Must provide args to use Decrement");
    const match = assert(args.match(lexical.identifier), `illegal identifier: ${args}`);

    this.variable = match[0];
  }

  public async render(_: Writeable, scope: Scope) {
    const v = scope.get(this.variable);
    const newV = typeof v !== "number" ? 1 : v + 1;
    scope.set(this.variable, newV);
  }
}

export const increment = (liquid: Engine) =>
  liquid.registerTag("increment", TagFactory(Increment, liquid));
