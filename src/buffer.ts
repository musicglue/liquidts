import { join } from "lodash";

export class WriteBuffer {
  private bufs: string[];

  constructor() {
    this.bufs = [];
  }

  public write(str: string) {
    // tslint:disable-next-line:no-console
    return this.bufs.push(str);
  }

  public read(): string {
    return join(this.bufs, "");
  }

  public toString(): string {
    return this.read();
  }

  public close() {
    this.bufs = [];
  }
}
