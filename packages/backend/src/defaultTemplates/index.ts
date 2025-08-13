import { type Template } from "shared";

import { add8kbBodyTemplate } from "./add-8kb-body";
import { httpFirstLineCasesTemplate } from "./http-first-line-cases";
import { httpHeaderPathTemplate } from "./http-header-path";
import { httpHeaderUrlTemplate } from "./http-header-url";
import { httpHeadersIpTemplate } from "./http-headers-ip";
import { httpHeadersMethodsTemplate } from "./http-headers-methods";
import { httpHeadersPortTemplate } from "./http-headers-port";
import { httpHeadersSchemeTemplate } from "./http-headers-scheme";
import { httpMethodsTemplate } from "./http-methods";
import { httpVersionTemplate } from "./http-version";
import { miscEndPathTemplate } from "./misc-end-path";
import { miscMiddlePathTemplate } from "./misc-middle-path";
import { pathAsUrlTemplate } from "./path-as-url";
import { pathExtensionTemplate } from "./path-extension";
import { pathSingleCharDoubleUrlEncodeTemplate } from "./path-single-char-double-url-encode";
import { pathSingleCharUppercaseTemplate } from "./path-single-char-uppercase";
import { pathSingleCharUrlEncodeTemplate } from "./path-single-char-url-encode";
import { singleCharTripleUrlEncodeTemplate } from "./single-char-triple-url-encode";
import { trimInconsistenciesTemplate } from "./trim-inconsistencies";
import { unicodeBypassAddEfbc8fTemplate } from "./unicode-bypass-add-efbc8f";
import { userAgentTemplate } from "./user-agent";

const defaultTemplates: Template[] = [
  add8kbBodyTemplate,
  httpFirstLineCasesTemplate,
  httpHeaderPathTemplate,
  httpHeaderUrlTemplate,
  httpHeadersIpTemplate,
  httpHeadersMethodsTemplate,
  httpHeadersPortTemplate,
  httpHeadersSchemeTemplate,
  httpMethodsTemplate,
  httpVersionTemplate,
  miscEndPathTemplate,
  miscMiddlePathTemplate,
  pathAsUrlTemplate,
  pathExtensionTemplate,
  pathSingleCharDoubleUrlEncodeTemplate,
  pathSingleCharUppercaseTemplate,
  pathSingleCharUrlEncodeTemplate,
  singleCharTripleUrlEncodeTemplate,
  trimInconsistenciesTemplate,
  unicodeBypassAddEfbc8fTemplate,
  userAgentTemplate,
];

export default defaultTemplates;
