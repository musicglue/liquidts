import { fromNullable } from "fp-ts/lib/Option";
import * as _ from "lodash";
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
import * as types from "./types";
import { Options, ResolvedOptions } from "./types";
import * as errors from "./util/error";

export { FileSystem } from "./lib/filesystem";
export { tagUtils } from "./tags";

export class Engine implements types.EnginePrototype {
  public fileSystem: types.FileSystem | undefined;
  public options: types.ResolvedOptions;
  public tag: TagContext;
  public filter: FilterContext;
  public parser: Parser;
  public renderer: Renderer;

  constructor(options: types.ResolvedOptions) {
    if (options.fileSystem) {
      this.fileSystem = options.fileSystem;
    }
    this.options = options;
    this.tag = new TagContext();
    this.filter = new FilterContext(options);
    this.parser = new Parser(this.tag, this.filter);
    this.renderer = new Renderer();

    tags.registerAll(this);
    filters.registerAll(this);
  }

  public parse = (html: string, filepath?: string) => {
    const tokens = tokenizer.parse(html, filepath, this.options);
    return this.parser.parse(tokens);
  };

  public async render(tpl: types.Template | types.Template[], ctx?: any, opts?: types.Options) {
    const options = Object.assign({}, this.options, opts);
    const registers = fromNullable(options.registers).getOrElse(() => new Map());

    const scope = new Scope(Object.assign({}, ctx), [], { ...options, registers });

    const writer = fromNullable(options.writer).getOrElse(() => new WriteBuffer());
    await this.renderer.renderTemplates(_.castArray(tpl), scope, writer);
    return writer;
  }

  public parseAndRender(html: string, ctx?: any, opts?: types.Options) {
    const tpls = this.parse(html);
    return this.render(tpls, ctx, opts);
  }

  public renderFile(filepath: string, ctx?: any, opts?: types.Options) {
    const options = Object.assign({}, opts);
    return this.getTemplate(filepath).then(templates => this.render(templates, ctx, options));
  }

  public async evalOutput(str: string, scope: any): Promise<string> {
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

  public getTemplate(filepath: string): Promise<types.Template[]> {
    if (this.fileSystem === undefined) {
      return Promise.reject("fileSystem not enabled in this engine");
    }

    return this.fileSystem.get(filepath, this.parse);
  }
}

export const resolveOptions = (opts?: Options): ResolvedOptions => ({
  fileSystem: _.get(opts, "fileSystem"),
  registers: _.get(opts, "registers", new Map()),
  strictFilters: _.get(opts, "strictFilters", false),
  strictVariables: _.get(opts, "strictVariables", false),
});

export default (opts?: Options): Engine => new Engine(resolveOptions(opts));

export { errors, lexical, syntax, types };
