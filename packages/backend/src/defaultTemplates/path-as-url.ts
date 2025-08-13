import { type Template } from "shared";

export const pathAsUrlTemplate: Template = {
  id: "path-as-url",
  description: "Use a full URL in the HTTP path section.",
  enabled: true,
  modificationScript: `
const originalPath = helper.getPath(input);
// it's not possible to access the request host using the helper api. Using localhost host as a fallback.
const host = "localhost";
const schemes = ["foo","ftp","http","https","webdav"];
const ports = ["80","443","1080","2080","3000","4443","8000","8080","8443","9000","9080","9443","7443","99999"];

const modifiedRequests = [];

for (const scheme of schemes) {
  modifiedRequests.push(
    helper.setPath(input, () => \`\${scheme}://\${host}\${originalPath}\`),
  );
  for (const port of ports) {
    modifiedRequests.push(
      helper.setPath(input, () =>
        \`\${scheme}://\${host}:\${port}\${originalPath}\`,
      ),
    );
  }
}

return modifiedRequests;`.trim(),
};
