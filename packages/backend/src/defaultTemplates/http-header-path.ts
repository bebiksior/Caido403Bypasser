import { type Template } from "shared";

export const httpHeaderPathTemplate: Template = {
  id: "http-header-path",
  description:
    "Sends the request using a different HTTP path using HTTP headers.",
  enabled: true,
  modificationScript: `
const headerKeys=["Base-URL","Http-URL","Original-Path","Original-URL","Path","Proxy-Request-FullURI","Proxy-URL","Referer","Request-URI","URI","URL","X-Accel-Redirect","X-Cf-URL","X-Envoy-Original-Path","X-Flx-Redirect-URL","X-Forwarded-Path","X-Forwarded-URI","X-Forwarded-URL","X-HTTP-DestinationURL","X-HTTP-Path-Override","X-MS-Endpoint-Absolute-Path","X-Ning-Request-URI","X-Original-Path","X-Original-URI","X-Original-URL","X-Override-URL","X-Path","X-Proxy-Request","X-Proxy-URL","X-Referer","X-Referrer","X-Rewrite-URI","X-Rewrite-URL","X-Route-Request","X-Sendfile","X-URI","X-URL","X-Wap-Profile","X-Waws-Unencoded-URL"];

const originalPath=helper.getPath(input);
const parts=originalPath.split("/").filter(Boolean);
const modifiedRequests=[];

// Build prefix and suffix parts of the path
for(let i=0;i<=parts.length;i++){
  const prefix=i===0?"/":"/"+parts.slice(0,i).join("/");
  const suffix="/"+parts.slice(i).join("/");
  const newPath=suffix==="/" ? "/" : suffix;

  // For each header, set path and add header with prefix value
  for(const header of headerKeys){
    let req=helper.setPath(input,()=>newPath);
    req=helper.addHeader(req,header+": "+prefix);
    modifiedRequests.push(req);
  }
}

return modifiedRequests;`.trim(),
};
