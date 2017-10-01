import { Engine } from "../index";
import * as lexical from "../lexical";
import { evalValue } from "../syntax";
import { Scope, Tag, TagToken, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";

const groupRE = new RegExp(`^(?:(${lexical.value.source})\\s*:\\s*)?(.*)$`);
const candidatesRE = new RegExp(lexical.value.source, "g");

export class Cycle implements Tag {
  private liquid: Engine;
  private candidateCount: number;
  private candidates: string[];
  private group: string | undefined;

  constructor(liquid: Engine) {
    this.liquid = liquid;
    this.candidates = [];
  }

  public parse(tagToken: TagToken) {
    const args = assert(tagToken.args, "must provide args to use Cycle");
    // tslint:disable-next-line:no-let
    let match: RegExpExecArray | null;
    match = assert(groupRE.exec(args), `illegal tag: ${tagToken.raw}`);

    this.group = match[1] || undefined;
    const candidates = match[2];

    // tslint:disable-next-line:no-conditional-assignment
    while ((match = candidatesRE.exec(candidates))) {
      this.candidates.push(match[0]);
    }

    const length = this.candidates.length;
    assert(length, `empty candidates: ${tagToken.raw}`);
    this.candidateCount = length;
  }

  public async render(writer: Writeable, scope: Scope) {
    const key = this.group !== undefined ? scope.evaluate(this.group) : this.candidates.toString();

    const register = scope.registers.get("cycles") || {};

    // tslint:disable-next-line:no-let
    let idx = register[key];

    if (idx === undefined) {
      idx = register[key] = 0;
    }

    const candidate = this.candidates[idx];
    idx = (idx + 1) % this.candidateCount;
    register[key] = idx;

    scope.registers.set("cycles", register);

    writer.write(evalValue(candidate, scope));
  }
}

export const cycle = (liquid: Engine) => liquid.registerTag("cycle", TagFactory(Cycle, liquid));
