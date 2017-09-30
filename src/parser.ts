import { FilterContext } from "./filterContext";
import * as lexical from "./lexical";
import { ParsingStream } from "./parsingStream";
import { TagContext } from "./tagContext";
import { OutputTemplate, OutputToken, TagToken, Template, Token } from "./types";
import { assert, typeIsControlTemplate } from "./util/assert";

export class Parser {
  private tags: TagContext;
  private filters: FilterContext;

  constructor(tags: TagContext, filters: FilterContext) {
    this.tags = tags;
    this.filters = filters;
  }

  // tslint:disable:no-let no-conditional-assignment
  public parseOutput(input: string, token?: OutputToken): OutputTemplate {
    let str = input;
    let match: RegExpExecArray | null;
    match = assert(lexical.matchValue(str), `Illegal output string: ${str}`);

    const [initial] = match;
    str = str.substr(match.index + match[0].length);

    const filters = [];
    while ((match = lexical.filter.exec(str))) {
      filters.push(match[0].trim()); // TODO: Why did this take an array rather than a string?
    }

    return {
      filters: filters.map(filter => this.filters.construct(filter)),
      initial,
      token,
      type: "output",
    };
  }
  // tslint:enable:no-let no-conditional-assignment

  public parseTag(token: TagToken, tokens: Token[]): Template {
    if (token.name === "continue" || token.name === "break") {
      return typeIsControlTemplate({ ...token, token, type: "control" });
    }
    return this.tags.construct(token, tokens);
  }

  public parseToken(token: Token, tokens: Token[]): Template {
    switch (token.type) {
      case "tag":
        return this.parseTag(token, tokens);
      case "output":
        return this.parseOutput(token.value, token);
      default:
        return { ...token, token };
    }
  }

  // tslint:disable:no-let no-conditional-assignment
  public parse(tokens: Token[]): Template[] {
    let token: Token | undefined;
    const templates: Template[] = [];
    while ((token = tokens.shift())) {
      templates.push(this.parseToken(token, tokens));
    }
    return templates;
  }
  // tslint:enable:no-let no-conditional-assignment

  public parseStream(tokens: Token[]) {
    return new ParsingStream(tokens, this);
  }
}
