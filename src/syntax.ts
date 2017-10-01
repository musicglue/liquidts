import * as assert from "assert";
import * as lexical from "./lexical";
import { operators } from "./operators";
import { Literal, Scope } from "./types";

export const evalExp = (exp: string, scope: Scope): Literal => {
  // tslint:disable-next-line:no-expression-statement
  assert(scope, "unable to evalExp: scope undefined");
  // tslint:disable-next-line:no-let
  let match: RegExpMatchArray | null;

  for (const regexp of lexical.quoteBalancedOperators) {
    // tslint:disable-next-line:no-conditional-assignment
    if ((match = exp.match(regexp))) {
      const l = evalExp(match[1], scope);
      const op = operators[match[2].trim()];
      const r = evalExp(match[3], scope);
      return op(l, r);
    }
  }

  // tslint:disable-next-line:no-conditional-assignment
  if ((match = exp.match(lexical.rangeLine))) {
    const low = evalValue(match[1], scope);
    const high = evalValue(match[2], scope);
    const range = [];
    // tslint:disable-next-line:no-let
    for (let j = low; j <= high; j++) {
      // tslint:disable-next-line:no-expression-statement
      range.push(j);
    }
    return range;
  }

  return evalValue(exp, scope);
};

export const evalValue = (str: string, scope: Scope): any => {
  // tslint:disable-next-line:no-expression-statement
  str = str && str.trim();
  if (!str) {
    return undefined;
  }

  if (lexical.isLiteral(str)) {
    return lexical.parseLiteral(str);
  }
  if (lexical.isVariable(str)) {
    return scope.get(str);
  }
  throw new TypeError(`cannot eval '${str}' as value`);
};

export const isFalsy = (val: any): boolean => val === false || val === undefined || val === null;

export const isTruthy = (val: any): boolean => !isFalsy(val);
