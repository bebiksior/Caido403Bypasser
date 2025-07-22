import add8KBBody from "@/defaultTemplates/add-8kb-body.yaml";
import httpFirstLineCases from "@/defaultTemplates/http-first-line-cases.yaml";
import httpHeaderPath from "@/defaultTemplates/http-header-path.yaml";
import httpHeaderUrl from "@/defaultTemplates/http-header-url.yaml";
import httpHeadersIp from "@/defaultTemplates/http-headers-ip.yaml";
import httpHeadersMethods from "@/defaultTemplates/http-headers-methods.yaml";
import httpHeadersPort from "@/defaultTemplates/http-headers-port.yaml";
import httpHeadersScheme from "@/defaultTemplates/http-headers-scheme.yaml";
import httpMethods from "@/defaultTemplates/http-methods.yaml";
import httpVersion from "@/defaultTemplates/http-version.yaml";
import miscEndPath from "@/defaultTemplates/misc-end-path.yaml";
import miscMiddlePath from "@/defaultTemplates/misc-middle-path.yaml";
import pathAsUrl from "@/defaultTemplates/path-as-url.yaml";
import pathExtension from "@/defaultTemplates/path-extension.yaml";
import pathSingleCharDoubleUrlEncode from "@/defaultTemplates/path-single-char-double-url-encode.yaml";
import pathSingleCharUppercase from "@/defaultTemplates/path-single-char-uppercase.yaml";
import pathSingleCharUrlEncode from "@/defaultTemplates/path-single-char-url-encode.yaml";
import singleCharTripleUrlEncode from "@/defaultTemplates/single-char-triple-url-encode.yaml";
import trimInconsistencies from "@/defaultTemplates/trim-inconsistencies.yaml";
import unicodeBypassAddEfbc8f from "@/defaultTemplates/unicode-bypass-add-efbc8f.yaml";
import userAgent from "@/defaultTemplates/user-agent.yaml";
import { Template } from "shared";

const convertToTemplate = (input: Record<string, any>): Template => {
  return {
    id: input.id,
    description: input.description,
    enabled: input.enabled,
    modificationScript: input.modificationScript,
  };
};

const defaultTemplates = [
  add8KBBody,
  httpFirstLineCases,
  httpHeaderPath,
  httpHeaderUrl,
  httpHeadersIp,
  httpHeadersMethods,
  httpHeadersPort,
  httpHeadersScheme,
  httpMethods,
  httpVersion,
  miscEndPath,
  miscMiddlePath,
  pathAsUrl,
  pathExtension,
  pathSingleCharDoubleUrlEncode,
  pathSingleCharUppercase,
  pathSingleCharUrlEncode,
  singleCharTripleUrlEncode,
  trimInconsistencies,
  unicodeBypassAddEfbc8f,
  userAgent,
].map(convertToTemplate);

export default defaultTemplates;
