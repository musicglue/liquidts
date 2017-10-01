import { Template } from "./index";

export type ParseFn = (str: string, path?: string) => Template[];
