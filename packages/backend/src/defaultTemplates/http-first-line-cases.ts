import { type Template } from "shared";

export const httpFirstLineCasesTemplate: Template = {
  id: "http-first-line-cases",
  description:
    "Converts the first line of the HTTP request to different cases.",
  enabled: true,
  modificationScript: `
const firstLine = input.split("\\n")[0];
const [method, path, version] = firstLine.trim().split(" ");

const modifiedRequests = [];

for (const m of [method.toLowerCase(), method.toUpperCase()]) {
  for (const p of [path.toLowerCase(), path.toUpperCase()]) {
    for (const v of [version.toLowerCase(), version.toUpperCase()]) {
      modifiedRequests.push(
        helper.setLine(input, 0, () => \`\${m} \${p} \${v}\`),
      );
    }
  }
}

return modifiedRequests;`.trim(),
};
