import { get, join, map } from "lodash";
import { Engine } from "../index";
import { Tag, TagToken, Token, Writeable } from "../types";
import { TagFactory } from "./utils";

export class Raw implements Tag {
  private liquid: Engine;
  private tokens: Token[];

  constructor(liquid: Engine) {
    this.liquid = liquid;
    this.tokens = [];
  }

  public parse(tagToken: TagToken, tokens: Token[]) {
    const stream = this.liquid.parser
      .parseStream(tokens)
      .on("token", (token: Token) => {
        if (get(token, "name") === "endraw") {
          stream.stop();
        } else {
          this.tokens.push(token);
        }
      })
      .on("end", () => {
        throw new Error(`tag ${tagToken.raw} not closed`);
      });

    stream.start();
  }

  public async render(writer: Writeable) {
    writer.write(join(map(this.tokens, t => t.raw), ""));
  }
}

export const raw = (liquid: Engine) => liquid.registerTag("raw", TagFactory(Raw, liquid));
