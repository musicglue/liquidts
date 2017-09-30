import { FilterContext } from "./filterContext";
import * as lexical from "./lexical";
import { evalValue } from "./syntax";
import * as t from "./types";

const valueRE = new RegExp(`${lexical.value.source}`, "g");

// tslint:disable:no-class no-this no-object-mutation no-expression-statement ban-types
export class FilterInstance implements t.FilterInstance {
  public name: string;
  public filter: Function;
  public args: any[];

  constructor(str: string, context: FilterContext) {
    const match = lexical.filterLine.exec(str);
    if (!match) {
      throw new Error(`illegal filter: ${str}`);
    }

    const name = match[1];
    const argList = match[2] || "";
    const filter = context.get(name);
    if (typeof filter !== "function") {
      if (context.options.strictFilters) {
        throw new TypeError(`undefined filter: ${name}`);
      }

      this.name = name;
      this.filter = (x: any) => x;
      this.args = [];

      return;
    }

    const args: any[] = [];
    // tslint:disable-next-line:no-let
    let argMatch: RegExpMatchArray | null;
    // tslint:disable-next-line:no-conditional-assignment
    while ((argMatch = valueRE.exec(argList.trim()))) {
      const v = match[0];
      const re = new RegExp(`${v}\\s*:`, "g");
      re.test(match.input) ? args.push(`'${v}'`) : args.push(v);
    }

    this.name = name;
    this.filter = filter;
    this.args = args;
  }

  public render(output: any, scope: any) {
    const args = this.args.map(arg => evalValue(arg, scope));
    args.unshift(output);
    return this.filter.call(null, ...args);
  }
}
// tslint:enable:no-class no-this no-object-mutation no-expression-statement ban-types
