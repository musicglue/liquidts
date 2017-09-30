import { Engine } from "../";

import { assign } from "./assign";
import { block } from "./block";
import { capture } from "./capture";
import { caseTag } from "./case";
import { comment } from "./comment";
import { cycle } from "./cycle";
import { decrement } from "./decrement";
import { forTag } from "./for";
import { ifTag } from "./if";
import { include } from "./include";
import { increment } from "./increment";
import { layout } from "./layout";
import { raw } from "./raw";
import { tablerow } from "./tablerow";
import { unless } from "./unless";

export const registerAll = (engine: Engine) => {
  assign(engine);
  block(engine);
  capture(engine);
  caseTag(engine);
  comment(engine);
  cycle(engine);
  decrement(engine);
  forTag(engine);
  ifTag(engine);
  include(engine);
  increment(engine);
  layout(engine);
  raw(engine);
  tablerow(engine);
  unless(engine);
};
