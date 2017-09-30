import { FilterInstance } from "./filterInstance";
import { Filter, FilterSet, Options } from "./types";

export class FilterContext {
  public readonly options: Options;
  private filters: FilterSet;

  constructor(options: Options) {
    this.filters = new Map();
    this.options = options;
  }

  public get(name: string) {
    return this.filters.get(name);
  }

  public clear(): void {
    this.filters.clear();
  }

  public construct(input: string): FilterInstance {
    return new FilterInstance(input, this);
  }

  public register(name: string, fn: Filter) {
    this.filters.set(name, fn);
  }
}
