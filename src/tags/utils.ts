import { WriteBuffer } from "../buffer";
import { Engine } from "../index";
import { Tag, TagConstructor } from "../types";

export const TagFactory = (tag: TagConstructor, liquid: Engine) => (): Tag => new tag(liquid);

export const toString = (buf: WriteBuffer) => buf.read();
