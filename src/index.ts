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

  constructor(options: Options) {
    if (options.cache) {
      this.cache = new Map();
    }
    this.options = {
      blocks: _.get(options, "blocks", {}),
      cache: _.get(options, "cache", false),
      extname: _.get(options, "extname", ".liquid"),
      root: _.get(options, "root", []),
      strictFilters: _.get(options, "strictFilters", false),
      strictVariables: _.get(options, "strictVariables", false),
    };
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
    const options = _.assign({}, this.options, opts);
    const scope = new Scope(ctx, [], options);
    const writer = new WriteBuffer();
    await this.renderer.renderTemplates(_.castArray(tpl), scope, writer);
    return writer;
  }

  public parseAndRender(html: string, ctx?: any, opts?: Options) {
    return Promise.resolve()
      .then(() => this.parse(html))
      .then(tpl => this.render(tpl, ctx, opts));
  }

  public renderFile(filepath: string, ctx: any, opts: Options) {
    opts = _.assign({}, opts);
    return this.getTemplate(filepath, opts.root).then(templates =>
      this.render(templates, ctx, opts),
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
    const paths = roots.map(root => path.resolve(root, filepath));

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

export default (opts?: Options): Engine => {
  const options = _.assign(
    {
      cache: false,
      extname: ".liquid",
      root: ["."],
      strict_filters: false,
      strict_variables: false,
      trimLeft: false,
      trimRight: false,
    },
    opts,
  );
  options.root = normalizeStringArray(options.root);

  return new Engine(options);
};

export { errors, lexical, syntax };
