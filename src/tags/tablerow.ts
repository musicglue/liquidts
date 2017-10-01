import { slice } from "lodash";
import { Engine } from "../";
import * as lexical from "../lexical";
import { evalExp } from "../syntax";
import { Dict, Scope, Tag, TagToken, Template, Token, Writeable } from "../types";
import { assert } from "../util/assert";
import { TagFactory } from "./utils";

const re = new RegExp(
  `^(${lexical.identifier.source})\\s+in\\s+` +
    `(${lexical.value.source})` +
    `(?:\\s+${lexical.hash.source})*$`,
);

export class TableRow implements Tag {
  private liquid: Engine;
  private collection: string;
  private templates: Template[];
  private variable: string;

  constructor(liquid: Engine) {
    this.liquid = liquid;
    this.templates = [];
  }

  public parse(token: TagToken, tokens: Token[]) {
    const args = assert(token.args, "Must provide args to use Decrement");
    const match = assert(re.exec(args), `illegal identifier: ${args}`);

    this.variable = match[1];
    this.collection = match[2];

    // tslint:disable-next-line:no-let
    const stream = this.liquid.parser
      .parseStream(tokens)
      .on("tag:endtablerow", () => stream.stop())
      .on("template", (tpl: Template) => this.templates.push(tpl))
      .on("end", () => {
        throw new Error(`tag ${token.raw} not closed`);
      });

    stream.start();
  }

  public async render(writer: Writeable, scope: Scope, hash: Dict<any>) {
    const collection = (evalExp(this.collection, scope) as any[]) || []; // TODO: assert
    const offset = hash.offset || 0;
    const limit = hash.limit === undefined ? collection.length : hash.limit;
    const cols = assert(hash.cols, `illegal cols: ${hash.cols}`);

    writer.write("<table>");
    // tslint:disable:no-let
    let row: number = 0;
    let col: number;
    let idx: number = 0;
    // tslint:enable:no-let
    for (const item of slice(collection, offset, offset + limit)) {
      row = Math.floor(idx / cols) + 1;
      col = idx % cols + 1;

      if (col === 1) {
        if (row !== 1) {
          writer.write("</tr>");
        }
        writer.write(`<tr class="row${row}">`);
      }

      writer.write(`<td class="col${col}">`);
      await this.liquid.renderer.renderTemplates(
        this.templates,
        scope.push({ [this.variable]: item }),
        writer,
      );
      writer.write("</td>");
      idx++;
    }

    if (row > 0) {
      writer.write("</tr>");
    }
    writer.write("</table>");
  }
}

export const tablerow = (liquid: Engine) =>
  liquid.registerTag("tablerow", TagFactory(TableRow, liquid));
