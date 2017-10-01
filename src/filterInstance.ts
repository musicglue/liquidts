import { FilterContext } from "./filterContext";
import * as lexical from "./lexical";
import { evalValue } from "./syntax";
import * as t from "./types";
import { map } from "lodash";
import { assert } from "./util/assert";

const valueRE = new RegExp(`${lexical.value.source}`, "g");

// tslint:disable:no-class no-this no-object-mutation no-expression-statement ban-types
export class FilterInstance implements t.FilterInstance {
  public name: string;
  public filter: Function;
  public args: any[];

  constructor(str: string, context: FilterContext) {
    // tslint:disable-next-line:no-let
    let match: RegExpExecArray | null;
    match = assert(lexical.filterLine.exec(str), `illegal filter: ${str}`);

    const name = match[1];
    const argList = match[2] || "";
    const filter = context.get(name);

    this.args = [];

    if (typeof filter !== "function") {
      assert(!context.options.strictFilters, `undefined filter: ${name}`);

      this.name = name;
      this.filter = (x: any) => x;

      return;
    }

    // tslint:disable-next-line:no-conditional-assignment
    while ((match = valueRE.exec(argList.trim()))) {
      const v = match[0];
      const re = new RegExp(`${v}\\s*:`, "g");
      re.test(match.input) ? this.args.push(`'${v}'`) : this.args.push(v);
    }

    this.name = name;
    this.filter = filter;
  }

  public render(output: any, scope: any) {
    const args = map(this.args, arg => evalValue(arg, scope));
    return this.filter.call(null, output, ...args);
  }
}
// tslint:enable:no-class no-this no-object-mutation no-expression-statement ban-types
