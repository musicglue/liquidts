import { get } from "lodash";
import * as path from "path";
import * as t from "../types";
import { readFileAsync } from "../util/fs";

export class FileSystem implements t.FileSystem {
  private readonly cache: Map<string, t.Template[]>;
  private readonly cacheEnabled: boolean;
  private readonly extname: string | undefined;
  private readonly root: string;

  constructor(root: string, opts?: t.FileSystemOpts) {
    this.cacheEnabled = get(opts, "cache", false);
    this.extname = get(opts, "extname");
    if (this.cacheEnabled) {
      this.cache = new Map();
    }
    this.root = path.normalize(root);
  }

  public async get(tmplPath: string, parser: t.ParseFn): Promise<t.Template[]> {
    if (this.cacheEnabled === true) {
      const cached = this.cache.get(tmplPath);
      if (cached !== undefined) { return cached; }
    }

    const sanitised = tmplPath.replace(/\.\./, "");
    const resolved = path.normalize(
      this.extname !== undefined ? `${sanitised}.${this.extname}` : tmplPath,
    );

    const tmpl = await readFileAsync(path.join(this.root, resolved))
      .then(buf => buf.toString("utf-8"))
      .then(str => parser(str, resolved));

    if (this.cacheEnabled === true) {
      this.cache.set(tmplPath, tmpl);
    }

    return tmpl;
  }
}
