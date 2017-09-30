export type Operator = "!=" | "<" | "<=" | "==" | ">=" | ">" | "and" | "contains" | "or";
export type Comparison = (l: any, r: any) => boolean;

export interface Operators {
  [key: string]: Comparison;
}

export const operators: Operators = {
  "!=": (l, r) => l !== r,
  "<": (l, r) => l !== null && r !== null && l < r,
  "<=": (l, r) => l !== null && r !== null && l <= r,
  "==": (l, r) => l === r,
  ">": (l, r) => l !== null && r !== null && l > r,
  ">=": (l, r) => l !== null && r !== null && l >= r,
  and: (l, r) => l && r,
  contains: (l, r) => {
    if (!l) {
      return false;
    }
    if (typeof l.indexOf !== "function") {
      return false;
    }
    return l.indexOf(r) > -1;
  },
  or: (l, r) => l || r,
};
