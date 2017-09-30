import { AssertionError } from "assert";
import { ControlTemplate } from "../types";

export const assert = <T>(x: T | null | undefined, message?: string): T => {
  if (x == null) {
    throw new AssertionError({ message });
  }

  return x;
};

export const typeIsControlTemplate = (x: any): ControlTemplate => {
  if (x.name === "continue" || x.name === "break") {
    return x;
  }

  throw new AssertionError({ message: "type was not control template" });
};
