import { isString } from "lodash";
import * as lexical from "./lexical";
import { HtmlToken, OutputToken, TagToken, Token, WhiteSpaceOpts } from "./types";
import { assert } from "./util/assert";
import { TokenizationError } from "./util/error";

const htmlTokenFactory = (htmlFragment: string): HtmlToken => ({
  raw: htmlFragment,
  type: "html",
  value: htmlFragment,
});

export const parse = (rawHtml: string, filepath?: string, options?: any) => {
  assert(isString(rawHtml), "illegal input type");

  const html = whiteSpaceCtrl(rawHtml, options);

  const tokens: Token[] = [];
  const syntax = /({%-?([\s\S]*?)-?%})|({{-?([\s\S]*?)-?}})/g;
  // tslint:disable:no-let
  let result;
  let htmlFragment;
  let token;
  let lastMatchEnd = 0;
  let lastMatchBegin = -1;
  let parsedLinesCount = 0;
  // tslint:enable:no-let

  // tslint:disable-next-line:no-conditional-assignment
  while ((result = syntax.exec(html)) !== null) {
    // passed html fragments
    if (result.index > lastMatchEnd) {
      htmlFragment = html.slice(lastMatchEnd, result.index);
      tokens.push(htmlTokenFactory(htmlFragment));
    }
    if (result[1]) {
      // tag appeared
      token = tagTokenFactory(1, result);

      const match = token.value.match(lexical.tagLine);
      if (!match) {
        throw new TokenizationError(`illegal tag syntax`, token);
      }
      token.name = match[1];
      token.args = match[2];

      // get last line indentation
      const lineStart = (htmlFragment || "").split("\n");
      token.indent = lineStart[lineStart.length - 1].length;

      tokens.push(token);
    } else {
      // output
      token = outputTokenFactory(3, result);
      tokens.push(token);
    }
    lastMatchEnd = syntax.lastIndex;
  }

  // remaining html
  if (html.length > lastMatchEnd) {
    htmlFragment = html.slice(lastMatchEnd, html.length);
    tokens.push(htmlTokenFactory(htmlFragment));
  }
  return tokens;

  function tagTokenFactory(offset: number, match: RegExpExecArray): TagToken {
    return {
      file: filepath,
      input: html,
      line: getLineNum(match),
      raw: match[offset],
      type: "tag",
      value: match[offset + 1].trim(),
    };
  }

  function outputTokenFactory(offset: number, match: RegExpExecArray): OutputToken {
    return {
      file: filepath,
      input: html,
      line: getLineNum(match),
      raw: match[offset],
      type: "output",
      value: match[offset + 1].trim(),
    };
  }

  function getLineNum(match: RegExpExecArray) {
    const lines = match.input.slice(lastMatchBegin + 1, match.index).split("\n");
    parsedLinesCount += lines.length - 1;
    lastMatchBegin = match.index;
    return parsedLinesCount + 1;
  }
};

const replaceGreedyLeft = /\s+({[{%]-)/g;
const replaceGreedyRight = /(-[%}]})\s+/g;
const greedyReplacers = [replaceGreedyLeft, replaceGreedyRight];
const replaceLaxLeft = /[\t\r ]*({[{%]-)/g;
const replaceLaxRight = /(-[%}]})[\t\r ]*\n?/g;
const laxReplacers = [replaceLaxLeft, replaceLaxRight];

const trimLeft = /({[{%])-?/g;
const trimRight = /-?([%}]})/g;

// tslint:disable:no-expression-statement
export const whiteSpaceCtrl = (html: string, options: WhiteSpaceOpts = {}): string => {
  if (options.trimLeft) {
    html = html.replace(trimLeft, "$1-");
  }
  if (options.trimRight) {
    html = html.replace(trimRight, "-$1");
  }
  const [rLeft, rRight] = options.greedy ? greedyReplacers : laxReplacers;

  return html.replace(rLeft, "$1").replace(rRight, "$1");
};
// tslint:enable:no-expression-statement
