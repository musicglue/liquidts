import { isObject, isString } from "lodash";
import { Engine } from "../";
import * as lexical from "../lexical";
import { evalExp } from "../syntax";
import { Dict, Scope, Tag, TagToken, Template, Token, Writeable } from "../types";
import { assert } from "../util/assert";
import { RenderBreakError } from "../util/error";
import { TagFactory } from "./utils";

const re = new RegExp(
  `^(${lexical.identifier.source})\\s+in\\s+` +
    `(${lexical.value.source})` +
    `(?:\\s+${lexical.hash.source})*` +
    `(?:\\s+(reversed))?` +
    `(?:\\s+${lexical.hash.source})*$`,
);

export class For implements Tag {
  private liquid: Engine;

  private variable: string;
  private collection: string;
  private reversed: boolean;

  private templates: Template[];
  private elseTemplates: Template[];

  constructor(liquid: Engine) {
    this.liquid = liquid;
    this.templates = [];
    this.elseTemplates = [];
  }

  public parse(tagToken: TagToken, tokens: Token[]) {
    const args = assert(tagToken.args, "Must provide args to For");
    const match = assert(re.exec(args), `illegal tag: ${tagToken.raw}`);

    this.variable = match[1];
    this.collection = match[2];
    this.reversed = !!match[3];

    // tslint:disable-next-line:no-let
    let p: Template[];
    const stream = this.liquid.parser
      .parseStream(tokens)
      .on("start", () => (p = this.templates))
      .on("tag:else", () => (p = this.elseTemplates))
      .on("tag:endfor", () => stream.stop())
      .on("template", (tpl: Template) => p.push(tpl))
      .on("end", () => {
        throw new Error(`tag ${tagToken.raw} not closed`);
      });

    stream.start();
  }

  public async render(writer: Writeable, scope: Scope, hash: Dict<any>) {
    // tslint:disable-next-line:no-let
    let collection = evalExp(this.collection, scope);

    if (!Array.isArray(collection)) {
      if (isString(collection) && collection.length) {
        collection = [collection];
      } else if (isObject(collection)) {
        collection = Object.keys(collection);
      }
    }

    if (!Array.isArray(collection) || !collection.length) {
      await this.liquid.renderer.renderTemplates(this.elseTemplates, scope, writer);
      return;
    }

    const length = collection.length;
    const offset = hash.offset || 0;
    const limit = hash.limit === undefined ? length : hash.limit;

    collection = collection.slice(offset, offset + limit);
    if (this.reversed) {
      collection.reverse();
    }

    const contexts = collection.map((item, i) => ({
      [this.variable]: item,
      forloop: {
        first: i === 0,
        index: i + 1,
        index0: i,
        last: i === length - 1,
        length,
        rindex: length - i,
        rindex0: length - i - 1,
      },
    }));

    const render = (ctx: Dict<any>) =>
      this.liquid.renderer
        .renderTemplates(this.templates, scope.push(ctx), writer)
        .catch((e: Error) => {
          if (e instanceof RenderBreakError) {
            writer.write(e.resolvedHTML);
            if (e.message === "continue") {
              return;
            }
          }
          throw e;
        });

    await Promise.all(contexts.map(render)).catch(e => {
      if (e instanceof RenderBreakError && e.message === "break") {
        return;
      }
      throw e;
    });
  }
}

export const forTag = (liquid: Engine) => liquid.registerTag("for", TagFactory(For, liquid));
