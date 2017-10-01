import * as crypto from "crypto";
import { WriteBuffer } from "../buffer";
import { Engine } from "../index";
import { Tag, TagConstructor, Writeable } from "../types";
import { RenderBreakError } from "../util/error";

export const renderBreakCatchAll = (e: Error) => {
  if (e instanceof RenderBreakError && e.message === "break") {
    return;
  }
  throw e;
};

export const renderBreakCatcher = (w: Writeable) => (e: Error) => {
  if (e instanceof RenderBreakError) {
    w.write(e.resolvedHTML);
    if (e.message === "continue") {
      return;
    }
  }
  throw e;
};

export const md5 = (data: string) =>
  crypto
    .createHash("md5")
    .update(data)
    .digest("hex");

export const TagFactory = (tag: TagConstructor, liquid: Engine) => (): Tag => new tag(liquid);

export const toString = (buf: WriteBuffer) => buf.read();
