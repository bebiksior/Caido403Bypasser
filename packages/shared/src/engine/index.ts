import { helpers } from "./helpers";
import { type TemplateOutput } from "./types";

export const runScript = (
  initialInput: string,
  script: string,
): TemplateOutput => {
  try {
    const userFunction = new Function("helper", "input", script);
    const result = userFunction(helpers, initialInput);
    const results = Array.isArray(result) ? result : [result];
    return {
      success: true,
      requests: results,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

export * from "./types";
