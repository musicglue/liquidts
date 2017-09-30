import * as fs from "fs";
import { promisify } from "util";

export const readFileAsync = promisify(fs.readFile);
export const statAsync = promisify(fs.stat);

export const statFileAsync = (f: string) =>
  statAsync(f)
    .then(() => true)
    .catch(() => false);
