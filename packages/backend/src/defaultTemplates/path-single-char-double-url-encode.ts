import { type Template } from "shared";

export const pathSingleCharDoubleUrlEncodeTemplate: Template = {
  id: "path-single-char-double-url-encode",
  description:
    "Replaces character (1 at time) of the path with its double encoded ASCII URL encode representation.",
  enabled: true,
  modificationScript: `
const path = helper.getPath(input);
const modifiedRequests = [];

for (let i = 1; i < path.length; i++) {
  const encodedChar = "%25" + path.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
  const newPath = path.slice(0, i) + encodedChar + path.slice(i + 1);
  modifiedRequests.push(helper.setPath(input, () => newPath));
}

return modifiedRequests;`.trim(),
};
