import { TagInstance } from "./tagInstance";
import { Tag, TagFactory, TagToken, Token } from "./types";
import { assert } from "./util/assert";

export class TagContext {
  public tags: Map<string, TagFactory>;

  constructor() {
    this.tags = new Map();
  }

  public get(name: string): TagFactory {
    return assert(this.tags.get(name), `Could not find tag with name: ${name}`);
  }

  public build(name: string): Tag {
    return this.get(name)();
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
