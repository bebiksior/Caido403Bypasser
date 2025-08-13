import { type Template } from "shared";

export const add8kbBodyTemplate: Template = {
  id: "add-8kb-body",
  description: "Adds an 8KB body to the request",
  enabled: true,
  modificationScript: `
const modifiedRequest = helper.setBody(input, 'A'.repeat(8192));

const methodModifiedRequest = helper.getMethod(input) === 'GET' ?
helper.setMethod(modifiedRequest, (prev) => 'POST') : modifiedRequest;

return [methodModifiedRequest];`.trim(),
};
