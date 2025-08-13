import { type Template } from "shared";

export const pathExtensionTemplate: Template = {
  id: "path-extension",
  description: "Add an extension at the end of the path.",
  enabled: true,
  modificationScript: `
const extensions=[".css",".png",".jpg",".jpeg",".gif",".html",".js",".json",".random",".svc",".wsdl"];
const path = helper.getPath(input);
const modifiedRequests = [];

for (const ext of extensions) {
  let newPath = path + ext;
  modifiedRequests.push(helper.setPath(input, () => newPath));

  newPath = path + ext + "/";
  modifiedRequests.push(helper.setPath(input, () => newPath));

  // Add extension after a semicolon (used as query separator for some backends)
  newPath = path + ";" + ext;
  modifiedRequests.push(helper.setPath(input, () => newPath));

  // Add extension after a comma (less common, taken from https://github.com/laluka/bypass-url-parser/blob/a75a72de352b27f0f4647b0037afbf4c08e8f50d/tests-history/bup-payloads-2024-10-23.lst#L79)
  newPath = path + "," + ext;
  modifiedRequests.push(helper.setPath(input, () => newPath));
}

return modifiedRequests;`.trim(),
};
