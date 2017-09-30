import * as lexical from "./lexical";
import * as syntax from "./syntax";
import { TagContext } from "./tagContext";
import * as t from "./types";

const hash = (markup: string, scope: t.Scope): t.Dict<any> => {
  const obj: t.Dict<any> = {};
  // tslint:disable-next-line:no-let
  let match;
  lexical.hashCapture.lastIndex = 0;
  // tslint:disable-next-line:no-conditional-assignment
  while ((match = lexical.hashCapture.exec(markup))) {
    const [, key, value] = match;
    obj[key] = syntax.evalValue(value, scope);
  }
  return obj;
};

export class TagInstance implements t.TagInstance {
  public tagImpl: t.Tag;
  public type: "tag" = "tag";
  public token: t.TagToken;
  public name: string;

  constructor(token: t.TagToken, tokens: t.Token[], tags: TagContext) {
    this.token = token;
    this.name = token.name || "";

    this.tagImpl = tags.build(this.name);
    if (this.tagImpl.parse) {
      this.tagImpl.parse(token, tokens);
    }
  }

  public async render(writer: t.Writeable, scope: t.Scope) {
    const obj = hash(this.token.args || "", scope);
    const impl = this.tagImpl;

    return await impl.render(writer, scope, obj);
  }
}
