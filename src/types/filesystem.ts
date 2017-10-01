import { Template } from "./index";
import { ParseFn } from "./parsing";

export interface FileSystemOpts {
  cache?: boolean;
  extname?: string;
}

export interface FileSystem {
  get(tmplPath: string, parser: ParseFn): Promise<Template[]>;
}
