import { get, range } from "lodash";
import { TagToken, Template } from "../types";

// tslint:disable:no-object-mutation no-expression-statement no-this
export class TokenizationError extends Error {
  public input: any;
  public line: any;
  public file: any;

  constructor(message: string, token: TagToken, ...args: any[]) {
    super(...args);
    this.input = token.input;
    this.line = token.line;
    this.file = token.file;

    const context = mkContext(token.input, token.line);
    this.message = mkMessage(message, token);
    this.stack = `${context}\n${this.stack || this.message}`;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ParseError extends Error {
  public input: any;
  public line: any;
  public file: any;
  public originalError: Error;

  constructor(err: Error, token: TagToken, ...args: any[]) {
    super(...args);
    this.input = token.input;
    this.line = token.line;
    this.file = token.file;
    this.originalError = err;

    const context = mkContext(token.input, token.line);
    this.message = mkMessage(err.message, token);
    this.stack = `${context}\n${this.stack || this.message}`;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class RenderError extends Error {
  public input: any;
  public line: any;
  public file: any;
  public originalError: Error;

  constructor(err: Error, tpl: Template, ...args: any[]) {
    super(...args);
    this.input = get(tpl, "token.input", "");
    this.line = get(tpl, "token.line", 0);
    this.file = get(tpl, "token.file");
    this.originalError = err;

    const context = mkContext(this.input, this.line);
    this.message = mkMessage(err.message, get(tpl, "token"));
    this.stack = `${context}\n${this.stack || this.message}`;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class RenderBreakError extends Error {
  public resolvedHTML: string;

  constructor(message: string = "", ...args: any[]) {
    super(...args);
    this.message = message;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class AssertionError extends Error {
  constructor(message: string = "", ...args: any[]) {
    super(...args);
    this.message = message;
  }
}
// tslint:enable:no-object-mutation no-expression-statement no-thi

const mkContext = (input: string, line: number): string => {
  const lines = input.split("\n");
  const begin = Math.max(line - 2, 1);
  const end = Math.min(line + 3, lines.length);

  return range(begin, end + 1)
    .map(l => [l === line ? ">> " : "   ", align(l, end), "| ", lines[l - 1]].join(""))
    .join("\n");
};

const align = (n: any, max: any): string => {
  const length = (max + "").length;
  const str = n + "";
  const blank = Array(length - str.length).join(" ");
  return `${blank}${str}`;
};

const mkMessage = (msg: string = "", token?: TagToken): string => {
  if (token && token.file) {
    return `${msg}, file: ${token.file}`;
  }
  if (token && token.line) {
    return `${msg}, line: ${token.line}`;
  }

  return msg;
};
