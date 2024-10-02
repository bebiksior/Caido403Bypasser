import add8KBBody from "@/defaultTemplates/add-8kb-body.yaml";
import addDotSemicolonPath from "@/defaultTemplates/add-dot-semicolon-path.yaml";
import basicAddJSONExt from "@/defaultTemplates/basic-add-json-ext.yaml";
import basicAddSlashDot from "@/defaultTemplates/basic-add-slash-dot.yaml";
import basicDoubleSlashBefore from "@/defaultTemplates/basic-double-slash-before.yaml";
import basicUppercase from "@/defaultTemplates/basic-uppercase.yaml";
import lastCharDoubleURLEncode from "@/defaultTemplates/last-char-double-url-encode.yaml";
import lastCharURLEncode from "@/defaultTemplates/last-char-url-encode.yaml";
import makeFirstLineUppercase from "@/defaultTemplates/make-first-line-uppercase.yaml";
import makeLastLetterUppercase from "@/defaultTemplates/make-last-letter-uppercase.yaml";
import nginxFlaskBypass from "@/defaultTemplates/nginx-flask-bypass.yaml";
import nginxSpringBootBypass from "@/defaultTemplates/nginx-spring-boot-bypass.yaml";
import nginxTrimInconsistencies from "@/defaultTemplates/nginx-trim-inconsistencies.yaml";
import sendAllHTTPMethods from "@/defaultTemplates/send-all-http-methods.yaml";
import unicodeBypassAddEFBC8F from "@/defaultTemplates/unicode-bypass-add-efbc8f.yaml";
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
  addDotSemicolonPath,
  basicAddJSONExt,
  basicAddSlashDot,
  basicDoubleSlashBefore,
  basicUppercase,
  lastCharDoubleURLEncode,
  lastCharURLEncode,
  makeFirstLineUppercase,
  makeLastLetterUppercase,
  nginxFlaskBypass,
  nginxSpringBootBypass,
  nginxTrimInconsistencies,
  sendAllHTTPMethods,
  unicodeBypassAddEFBC8F,
].map(convertToTemplate);

export default defaultTemplates;
