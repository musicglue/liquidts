import { get, set } from "lodash";
import * as t from "./types";
import { assert } from "./util/assert";

const standardisePath = (path: string) => path.replace(/\[/g, ".").replace(/\]/g, "");

export class Scope implements t.Scope {
  private scopes: Scope[];
  private options: t.Options;
  private vars: t.Dict<any>;

  constructor(vars: t.Dict<any>, scopes: Scope[] = [], options: t.Options = {}) {
    this.scopes = scopes;
    this.options = options;
    this.vars = vars;
  }

  public get(str: string, standardise: boolean = true): any | undefined {
    const path = standardise ? standardisePath(str) : str;

    // tslint:disable-next-line:no-let
    let val = get(this.vars, path);
    if (val != null) {
      return val;
    }

    for (const scope of this.scopes) {
      val = scope.get(path);
      if (val != null) {
        return val;
      }
    }

    if (this.options.strictVariables) {
      assert(val, `Failed to lookup: ${str}`);
    }
  }

  public set(key: string, value: any): Scope {
    set(this.vars, standardisePath(key), value);
    return this;
  }

  public push(ctx: t.Dict<any>): Scope {
    assert(ctx, `cannot push null scope`);
    return new Scope(ctx, this.scopes, this.options);
  }
}
