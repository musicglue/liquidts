import { toString } from "lodash";
import { Engine } from "../index";
import * as lexical from "../lexical";
import { evalValue } from "../syntax";
import { Scope, Tag, TagToken, Writeable } from "../types";
import { assert } from "../util/assert";
import { md5, TagFactory } from "./utils";

const groupRE = new RegExp(`^(?:(${lexical.value.source})\\s*:\\s*)?(.*)$`);
const candidatesRE = new RegExp(lexical.value.source, "g");

export class Cycle implements Tag {
  private liquid: Engine;
  private candidateCount: number;
  private candidates: string[];
  private group: any;

  constructor(liquid: Engine) {
    this.liquid = liquid;
    this.candidates = [];
  }

  public parse(tagToken: TagToken) {
    const args = assert(tagToken.args, "must provide args to use Cycle");
    // tslint:disable-next-line:no-let
    let match: RegExpExecArray | null;
    match = assert(groupRE.exec(args), `illegal tag: ${tagToken.raw}`);

    this.group = match[1] || "";
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
    const group = evalValue(this.group, scope);
    const fingerprint = md5(`cycle:${toString(group)}:${this.candidates.join(":")}`);
    const register = scope.get("private.cycles") || {};

    // tslint:disable-next-line:no-let
    let idx = register[fingerprint];

    if (idx === undefined) {
      idx = register[fingerprint] = 0;
    }

    const candidate = this.candidates[idx];
    idx = (idx + 1) % this.candidateCount;
    register[fingerprint] = idx;

    scope.set("private.cycles", register);

    writer.write(evalValue(candidate, scope));
  }
}

export const cycle = (liquid: Engine) =>
  liquid.registerTag("cycle", TagFactory(Cycle, liquid));
