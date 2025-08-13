import { type Template } from "shared";

export const httpHeadersMethodsTemplate: Template = {
  id: "http-headers-methods",
  description:
    "Sends the request using all possible HTTP methods using HTTP headers.",
  enabled: true,
  modificationScript: `
const methods = ["ACL","BIND","BPROPFIND","CHECKIN","CHECKOUT","CONNECT","COPY","DELETE","GET","HEAD","LABEL","LINK","LOCK","MERGE","MKCOL","MOVE","OPTIONS","ORDERPATCH","PATCH","POST","POUET","PRI","PROPFIND","PROPPATCH","PUT","QUERY","REBIND","REPORT","SEARCH","TRACE","TRACK","UNCHECKOUT","UNLOCK","UPDATE","UPDATEREDIRECTREF","VERSION-CONTROL"];
const overrideHeaders = ["X-HTTP-Method-Override","X-Method-Override","X-Method","X-HTTP-Method"];
const modifiedRequests = [];

methods.forEach(method => {
  modifiedRequests.push(helper.setMethod(input, () => method));

  overrideHeaders.forEach(headerName => {
    let reqWithHeader = helper.addHeader(input, \`\${headerName}: \${method}\`);
    modifiedRequests.push(reqWithHeader);
  });
});

return modifiedRequests;`.trim(),
};
