import { Token } from "./types";

// tslint:disable:no-this ban-types
export class ParsingStream {
  public tokens: Token[];
  public handlers: any;
  public stopRequested: boolean = false;
  public parseOpts: any;

  constructor(tokens: Token[], parseOpts: any) {
    this.tokens = tokens;
    this.handlers = {};
    this.parseOpts = parseOpts;
  }

  public on(name: string, cb: Function) {
    this.handlers[name] = cb;
    return this;
  }

  public trigger(event: string, arg?: any) {
    const h = this.handlers[event];
    if (typeof h === "function") {
      h(arg);
      return true;
    }
  }

  public start(): ParsingStream {
    this.trigger("start");
    // tslint:disable-next-line:no-let
    let token: Token | undefined;
    // tslint:disable-next-line:no-conditional-assignment
    while (!this.stopRequested && (token = this.tokens.shift())) {
      if (this.trigger("token", token)) {
        continue;
      }
      if (token.type === "tag" && this.trigger(`tag:${token.name}`, token)) {
        continue;
      }
      this.trigger("template", this.parseOpts.parseToken(token, this.tokens));
    }
    if (!this.stopRequested) {
      this.trigger("end");
    }
    return this;
  }

  public stop(): boolean {
    this.stopRequested = true;
    return true;
  }
}
// tslint:enable:ban-types no-this
