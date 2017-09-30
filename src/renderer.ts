import { evalExp } from "./syntax";
import { TagInstance } from "./tagInstance";
import { ControlTemplate, OutputTemplate, Scope, Template, Writeable } from "./types";
import { RenderBreakError, RenderError } from "./util/error";

// tslint:disable:no-this
export class Renderer {
  public async renderTemplates(
    templates: Template[],
    scope: Scope,
    writer: Writeable,
  ): Promise<void> {
    await Promise.all(
      templates.map(template =>
        this.renderTemplate(template, scope, writer).catch((err: Error) => {
          if (err instanceof RenderBreakError) {
            err.resolvedHTML = "FIXME";
            throw err;
          }
          throw new RenderError(err, template);
        }),
      ),
    );
  }

  public renderTemplate = async (
    template: Template,
    scope: Scope,
    writer: Writeable,
  ): Promise<void> => {
    switch (template.type) {
      case "tag":
        return this.renderTag(template, scope, writer);
      case "output":
        return this.evalOutput(template, scope, writer);
      case "control":
        return;
      default:
        writer.write(template.value);
    }
  };

  public async renderTag(
    template: ControlTemplate | TagInstance,
    scope: Scope,
    writer: Writeable,
  ): Promise<void> {
    if (template.type === "control") {
      return Promise.reject(new RenderBreakError(template.name));
    }
    await template.render(writer, scope);
  }

  public async evalOutput(
    template: OutputTemplate,
    scope: Scope,
    writer: Writeable,
  ): Promise<void> {
    const value = template.filters.reduce(
      (prev, filter) => filter.render(prev, scope),
      evalExp(template.initial, scope),
    );
    writer.write(value);
  }
}
