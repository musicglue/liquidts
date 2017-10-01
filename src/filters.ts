import { capitalize, join, map, round, slice, sortBy, split, uniq, zipObject } from "lodash";
import * as strftime from "strftime";
import { Engine } from ".";
import { isTruthy } from "./syntax";
import { Dict } from "./types";

const escapeMap: Dict<string> = {
  '"': "&#34;",
  "&": "&amp;",
  "'": "&#39;",
  "<": "&lt;",
  ">": "&gt;",
};

const unescapeMap: Dict<string> = zipObject(Object.values(escapeMap), Object.keys(escapeMap));

const stringify = (obj: any): string => obj + "";

const escape = (str: any) => stringify(str).replace(/&|<|>|"|'/g, m => escapeMap[m]);

const unescape = (str: any): string =>
  stringify(str).replace(/&(amp|lt|gt|#34|#39);/g, m => unescapeMap[m]);

const getFixed = (v: number): number => {
  const p = stringify(v).split(".");
  return p.length > 1 ? p[1].length : 0;
};

const getMaxFixed = (l: number, r: number) => Math.max(getFixed(l), getFixed(r));

const bindFixed = (cb: (l: number, r: number) => number) => (l: number, r: number) =>
  cb(l, r).toFixed(getMaxFixed(l, r));

// tslint:disable-next-line:ban-types
export const filters: Dict<Function> = {
  abs: (v: number) => Math.abs(v),
  append: (v: string, arg: string) => `${v}${arg}`,
  capitalize,
  ceil: (v: number) => Math.ceil(v),
  date: (v: string | Date, arg: string): string => {
    const d = v === "now" ? new Date() : v;
    return d instanceof Date ? strftime(d, arg) : "";
  },
  default: (v: any, arg: any) => (isTruthy(v) ? v : arg),
  divided_by: (v: number, arg: number) => Math.floor(v / arg),
  downcase: (v: string) => v.toLowerCase(),
  escape,
  escape_once: (str: string) => escape(unescape(str)),
  first: ([v]: any[]) => v,
  floor: (v: number) => Math.floor(v),
  join: (arr: any[], delim: string = "") => join(arr, delim),
  json: (obj: any): string => JSON.stringify(obj),
  last: (v: any[]) => v[v.length - 1],
  lstrip: (v: any) => stringify(v).replace(/^\s+/, ""),
  map: (arr: any[], arg: string | number) => map(arr, (v: any) => v[arg]), // check this one
  minus: bindFixed((v: number, arg: number) => v - arg),
  modulo: bindFixed((v: number, arg: number) => v % arg),
  newline_to_br: (v: string) => v.replace(/\n/g, "<br/>"),
  plus: bindFixed((v: number, arg: number) => Number(v) + Number(arg)),
  prepend: (v: string, arg: string) => `${arg}${v}`,
  remove: (v: string, arg: string) => join(split(v, arg), ""),
  remove_first: (v: string, l: string) => v.replace(l, ""),
  replace: (v: any, pattern: string, replacement: string) =>
    stringify(v)
      .split(pattern)
      .join(replacement),
  replace_first: (v: any, arg1: string, arg2: string) => stringify(v).replace(arg1, arg2),
  reverse: (v: any[]) => v.reverse(),
  round: (v: number, arg: number = 0) => {
    const amp = Math.pow(10, arg);
    return round(v * amp, arg) / amp;
  },
  rstrip: (str: string) => stringify(str).replace(/\s+$/, ""),
  size: (v: string | any[]) => v.length,
  slice: (v: string | any[], begin: number, length: number = 1) => {
    return typeof v === "string" ? v.substr(begin, length) : slice(v, begin, begin + length);
  },
  sort: (v: any[], property?: string | number) => (property ? sortBy(v, property) : sortBy(v)),
  split: (v: any, arg: string) => stringify(v).split(arg),
  strip: (v: any) => stringify(v).trim(),
  strip_html: (v: any) => stringify(v).replace(/<\/?\s*\w+\s*\/?>/g, ""),
  strip_newlines: (v: any) => stringify(v).replace(/\n/g, ""),
  times: (v: number, arg: number) => v * arg,
  truncate: (v: any, l: number = 16, o: string = "...") => {
    const str = stringify(v);
    if (str.length <= l) {
      return str;
    }
    return `${str.substr(0, l - o.length)}${o}`;
  },
  truncatewords: (v: string, l: number, o = "...") => {
    const arr = v.split(" ");
    return arr.length > l ? `${arr.slice(0, l).join(" ")}${o}` : arr.slice(0, l).join(" ");
  },
  unescape,
  uniq,
  upcase: (str: any) => stringify(str).toUpperCase(),
  url_encode: encodeURIComponent,
};

export const registerAll = (liquid: Engine) =>
  Object.keys(filters).forEach(filter => liquid.registerFilter(filter, filters[filter]));
