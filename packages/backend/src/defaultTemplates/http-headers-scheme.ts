import { type Template } from "shared";

export const httpHeadersSchemeTemplate: Template = {
  id: "http-headers-scheme",
  description:
    "Sends the request using a different HTTP schemes using HTTP headers.",
  enabled: true,
  modificationScript: `
const headers = ["CloudFront-Forwarded-Proto","Forwarded","Front-End-Https","X-Forwarded-HTTPS","X-Forwarded-Proto","X-Forwarded-SSL","X-Forwarded-Scheme","X-Protocol-Scheme","X-Sp-Edge-Scheme","X-Url-Scheme"];
const values = ["foo","ftp","http","https","webdav"];
const modifiedRequests = [];

headers.forEach(header => {
  if (header === "Forwarded") {
    values.forEach(value => {
      const req = helper.removeHeader(input, header);
      const newReq = helper.addHeader(req, \`\${header}: proto=\${value}\`);
      modifiedRequests.push(newReq);
    });

  } else if (header === "Front-End-Https" || header === "X-Forwarded-HTTPS" || header === "X-Forwarded-SSL") {
    const req = helper.removeHeader(input, header);
    const newReq = helper.addHeader(req, \`\${header}: on\`);
    modifiedRequests.push(newReq);

  } else {
    values.forEach(value => {
      const req = helper.removeHeader(input, header);
      const newReq = helper.addHeader(req, \`\${header}: \${value}\`);
      modifiedRequests.push(newReq);
    });
  }
});

return modifiedRequests;`.trim(),
};
