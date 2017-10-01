import { fromNullable } from "fp-ts/lib/Option";
import * as _ from "lodash";
import * as path from "path";
import { WriteBuffer } from "./buffer";
import { FilterContext } from "./filterContext";
import * as filters from "./filters";
import * as lexical from "./lexical";
import { Parser } from "./parser";
import { Renderer } from "./renderer";
import { Scope } from "./scope";
import * as syntax from "./syntax";
import { TagContext } from "./tagContext";
import * as tags from "./tags";
import * as tokenizer from "./tokenizer";
import { Dict, EnginePrototype, Options, ResolvedOptions, Template } from "./types";
import * as errors from "./util/error";
import { readFileAsync, statFileAsync } from "./util/fs";

export class Engine implements EnginePrototype {
  public cache?: Dict<any>;
  public options: ResolvedOptions;
  public tag: TagContext;
  public filter: FilterContext;
  public parser: Parser;
  public renderer: Renderer;

  constructor(options: ResolvedOptions) {
    if (options.cache) {
      this.cache = new Map();
    }
    this.options = options;
    this.tag = new TagContext();
    this.filter = new FilterContext(options);
    this.parser = new Parser(this.tag, this.filter);
    this.renderer = new Renderer();

    tags.registerAll(this);
    filters.registerAll(this);
  }

  public parse(html: string, filepath?: string) {
    const tokens = tokenizer.parse(html, filepath, this.options);
    return this.parser.parse(tokens);
  }

  public async render(tpl: Template | Template[], ctx?: any, opts?: Options) {
    const options = Object.assign({}, this.options, opts);
    const registers = fromNullable(options.registers).getOrElse(() => new Map());

    const scope = new Scope(Object.assign({}, ctx), [], { ...options, registers });

    const writer = fromNullable(options.writer).getOrElse(() => new WriteBuffer());
    await this.renderer.renderTemplates(_.castArray(tpl), scope, writer);
    return writer;
  }

  public parseAndRender(html: string, ctx?: any, opts?: Options) {
    const tpls = this.parse(html);
    return this.render(tpls, ctx, opts);
  }

  public renderFile(filepath: string, ctx: any, opts: Options) {
    const options = Object.assign({}, opts);
    return this.getTemplate(filepath, opts.root).then(templates =>
      this.render(templates, ctx, options),
    );
  }

  public async evalOutput(str: string, scope: any) {
    const tpl = this.parser.parseOutput(str.trim());
    const buf = new WriteBuffer();
    await this.renderer.evalOutput(tpl, scope, buf);
    return buf.read();
  }

  // tslint:disable-next-line:ban-types
  public registerFilter(name: string, filter: Function) {
    return this.filter.register(name, filter);
  }

  public registerTag(name: string, tag: any) {
    return this.tag.register(name, tag);
  }

  public async lookup(filepath: string, extraRoots: string[] = []): Promise<string> {
    const roots = _.uniq(this.options.root.concat(extraRoots));
    const paths = _.map(roots, root => path.resolve(root, filepath));

    for (const p in paths) {
      if (await statFileAsync(p)) {
        return p;
      }
    }

    throw new Error(`Failed to lookup ${filepath}`);
  }

  public getTemplate(filepath: string, root: string[] = []): Promise<Template[]> {
    if (!path.extname(filepath)) {
      filepath += this.options.extname;
    }
    return this.lookup(filepath, root).then(resolved => {
      if (this.cache) {
        const cache = this.cache;
        const tpl = cache[resolved];
        if (tpl) {
          return Promise.resolve(tpl);
        }

        return readFileAsync(filepath)
          .then(buf => buf.toString("utf-8"))
          .then(str => this.parse(str))
          .then(tmpl => {
            cache.set(filepath, tmpl);
            return tmpl;
          });
      } else {
        return readFileAsync(filepath)
          .then(buf => buf.toString("utf-8"))
          .then(str => this.parse(str, filepath));
      }
    });
  }
}

const normalizeStringArray = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (_.isString(value)) {
    return [value];
  }
  return [];
};

export const resolveOptions = (opts?: Options): ResolvedOptions => ({
  blocks: _.get(opts, "blocks", {}),
  cache: _.get(opts, "cache", false),
  extname: _.get(opts, "extname", ".liquid"),
  registers: _.get(opts, "registers", new Map()),
  root: normalizeStringArray(_.get(opts, "root", [])),
  strictFilters: _.get(opts, "strictFilters", false),
  strictVariables: _.get(opts, "strictVariables", false),
});

export default (opts?: Options): Engine => new Engine(resolveOptions(opts));

export { errors, lexical, syntax };
