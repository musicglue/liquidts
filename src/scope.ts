import { get, set } from "lodash";
import { evalExp } from "./syntax";
import * as t from "./types";
import { assert } from "./util/assert";

const standardisePath = (path: string) => path.replace(/\[/g, ".").replace(/\]/g, "");

export class Scope implements t.Scope {
  public readonly registers: Map<string | number, any>;
  private readonly scopes: Scope[];
  private options: t.ResolvedOptions;
  private vars: t.Dict<any>;

  constructor(vars: t.Dict<any>, scopes: Scope[] = [], options: t.ResolvedOptions) {
    this.scopes = scopes;
    this.options = options;
    this.vars = vars;
    this.registers = options.registers;
  }

  public evaluate(expr: string): any {
    return evalExp(expr, this);
  }

  public get(str: string, standardise: boolean = true): any | undefined {
    const path = standardise ? standardisePath(str) : str;

    // tslint:disable-next-line:no-let
    let val = get(this.vars, path);
    if (val != null) {
      return val;
    }

    // tslint:disable-next-line:no-let
    let scope: Scope;
    for (scope of this.scopes) {
      if (scope !== undefined) {
        val = scope.get(path, false);
        if (val != null) {
          return val;
        }
      }
    }

    if (this.options.strictVariables) {
      assert(val, `Failed to lookup: ${str}`);
    }
  }

  public getRoot(str: string): any | undefined {
    assert(str.startsWith("private"), "Can only get private variables on root scope");
    const root = this._getRootScope();
    const val = root.get(str);
    if (this.options.strictVariables) {
      assert(val, `Failed to lookup: ${str}`);
    }
    return val;
  }

  public set(key: string, value: any): Scope {
    set(this.vars, standardisePath(key), value);
    return this;
  }

  public setRoot(str: string, value: any) {
    assert(str.startsWith("private"), "Can only set private variables on root scope");
    const root = this._getRootScope();
    root.set(str, value);
    return this;
  }

  public push(ctx: t.Dict<any>): Scope {
    assert(ctx, `cannot push null scope`);
    return new Scope(ctx, [this, ...this.scopes], this.options);
  }

  private _getRootScope(): Scope {
    return this.scopes.length ? this.scopes[this.scopes.length - 1] : this;
  }
}
