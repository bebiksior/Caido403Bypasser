import { type Template } from "shared";

export const unicodeBypassAddEfbc8fTemplate: Template = {
  id: "unicode-bypass-add-efbc8f",
  description: "Adds %ef%bc%8f before the last segment of the path",
  enabled: true,
  modificationScript: `
const newRequest = helper.setPath(input, (prev) => {
  const segments = prev.split('/');
  if (segments.length > 1) {
    segments[segments.length - 1] = '%ef%bc%8f' + segments[segments.length - 1];
  }
  return segments.join('/');
});

return newRequest;`.trim(),
};
