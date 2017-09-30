import { TagInstance } from "./tagInstance";
import { Tag, TagFactory, TagToken, Token } from "./types";

export class TagContext {
  public tags: Map<string, TagFactory>;

  constructor() {
    this.tags = new Map();
  }

  public get(name: string): TagFactory {
    const tag = this.tags.get(name);
    if (!tag) {
      // tslint:disable-next-line:no-console
      this.tags.forEach((_, key) => console.log(key));
      throw new Error(`Could not find tag with name: ${name}`);
    }
    return tag;
  }

  public build(name: string): Tag {
    const tag = this.get(name);
    return tag();
  }

  public register(name: string, tag: TagFactory): void {
    this.tags.set(name, tag);
  }

  public construct(token: TagToken, tokens: Token[]): TagInstance {
    return new TagInstance(token, tokens, this);
  }

  public clear(): void {
    this.tags.clear();
  }
}
