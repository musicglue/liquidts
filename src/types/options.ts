import { FileSystem } from "./filesystem";
import { Writeable } from "./index";

export interface Options {
  fileSystem?: FileSystem;
  registers?: Map<string | number, any>;
  strictFilters?: boolean;
  strictVariables?: boolean;
  writer?: Writeable;
}

export interface ResolvedOptions extends Options {
  registers: Map<string | number, any>;
  strictFilters: boolean;
  strictVariables: boolean;
}
