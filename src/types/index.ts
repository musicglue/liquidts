export * from "./filesystem";
export * from "./options";
export * from "./parsing";

import { Engine } from "../";
import { Options } from "./options";

export interface Dict<T> {
  [key: string]: T;
}
export type Literal = number | boolean | string | any[];
export type Nil = null | undefined;

export interface Writeable {
  read: () => string;
  write: (content: string) => number | void;
}

export type StringChecker = (str: string) => boolean;

export interface EnginePrototype {
  cache?: Dict<any>;
  options: Options;
  tag: any;
  filter: any;
  parser: any;
  renderer: any;

  parse: (html: string, filepath: string) => void;
  render: (tpl: Template, ctx: any, options: Options) => void;
  parseAndRender: (html: string, ctx: any, options: Options) => void;
  renderFile: (filepath: string, ctx: any, options: Options) => void;
  evalOutput: (str: string, scope: any) => Promise<string>;
  // tslint:disable-next-line:ban-types
  registerFilter: (name: string, filter: Function) => void;
  registerTag: (name: string, tag: any) => void;
  getTemplate: (filepath: string) => Promise<Template[]>;
}

// tslint:disable-next-line:ban-types
export type Filter = Function;
export type FilterSet = Map<string, Filter>;

export interface FilterInstance {
  args: any[];
  // tslint:disable-next-line:ban-types
  filter: Function;
  name: string;

  render: (output: any, scope: Scope) => any;
}

export interface FilterCtrl {
  clear: () => void;
  construct: (str: string) => FilterInstance;
  // tslint:disable-next-line:ban-types
  register: (name: string, fn: Function) => FilterSet;
}

export interface TagInstance {
  type: "tag";
  token: TagToken;
  name: string;
  tagImpl: Tag;

  render: (writer: Writeable, scope: Scope) => Promise<void>;
}

export interface LiquidError extends Error {
  file: string;
  input: any;
  line: number;
  originalError: Error;
}

export interface Scope {
  evaluate: (expr: string) => any;
  get: (str: string) => any;
  set: (str: string, val: any) => Scope;
  push: (ctx: Dict<any>) => Scope;

  registers: Map<string | number, any>;
}

export type TokenType = "output" | "tag";

export interface BaseToken {
  token?: Token;
  name?: string;
}

export interface HtmlToken {
  raw: string;
  type: "html";
  value: string;
}

export interface TagToken extends BaseToken {
  file?: string;
  indent?: number;
  input: string;
  raw?: string;
  line: number;
  name?: string;
  args?: string;
  token?: Token;
  type: "tag";
  value: string;
}

export interface OutputToken extends BaseToken {
  file?: string;
  filters?: FilterInstance[];
  initial?: string;
  input: string;
  line: number;
  name?: undefined;
  raw?: string;
  type: "output";
  value: string;
}

export type Token = HtmlToken | OutputToken | TagToken;

export interface TagConstructor {
  new (engine: Engine): Tag;
}

export type TagFactory = () => Tag;

export interface Tag {
  parse?: (token: Token, tokens: Token[]) => void;
  render: (writer: Writeable, scope: Scope, obj: Dict<any>) => Promise<void>;
}

// export interface LiquidTemplate {
//   name?: string;
//   filters: FilterInstance[];
//   initial: string;
//   render?: (scope: Scope) => Promise<string>;
//   token: TagToken;
//   type: "tag";
//   value?: string;
// }

export interface OutputTemplate {
  filters: FilterInstance[];
  initial: string;
  type: "output";
  token?: OutputToken;
}

export interface HtmlTemplate {
  raw: string;
  token: HtmlToken;
  type: "html";
  value: string;
}

export interface ControlTemplate {
  name: "continue" | "break";
  type: "control";
}

export type Template = ControlTemplate | OutputTemplate | HtmlTemplate | TagInstance;

export interface WhiteSpaceOpts {
  greedy?: boolean;
  trimLeft?: boolean;
  trimRight?: boolean;
}
