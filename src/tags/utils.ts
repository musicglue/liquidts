import * as crypto from "crypto";
import { WriteBuffer } from "../buffer";
import { Engine } from "../index";
import { Tag, TagConstructor } from "../types";

export const md5 = (data: string) => crypto.createHash("md5").update(data).digest("hex");

export const TagFactory = (tag: TagConstructor, liquid: Engine) => (): Tag => new tag(liquid);

export const toString = (buf: WriteBuffer) => buf.read();
