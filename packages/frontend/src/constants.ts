export const engineInfo = `Exposed variables and functions:
input - raw HTTP request string

helper.setLine(input, 0, (prev) => prev.toUpperCase())
helper.setPath(input, (prev) => prev.toUpperCase())
helper.setQuery(input, (query) => query + '&new=param')
helper.addQueryParameter(input, "new=param")
helper.setMethod(input, (prev) => prev.toUpperCase())
helper.addHeader(input, "Content-Type: application/json")
helper.removeHeader(input, Content-Type")
helper.setBody(input, "hello")

helper.getMethod(input), helper.getPath(input), helper.getQuery(input), helper.hasHeader(input, "Content-Type")

You can return an array of modified requests to send multiple requests.`;

export const baseTemplate = {
  id: "new-template",
  description: "New template!",
  enabled: true,
  modificationScript: `/*\n${engineInfo}\n*/

return input;`,
};

export const defaultTest =
  'POST /hello?caido=awesome HTTP/1.1\r\nHost: example.com\r\nAccept: application/json\r\nContent-Type: application/json\r\n\r\n{"hello": "world"}';

export const aiSystemPrompt = `You are AI 403Bypasser template generator. Your job is to generate a template that bypasses 403 Forbidden status code.
${engineInfo}
Helper functions return modified request. You can use them to modify the request. Example:
const modifiedRequest = helper.setPath(input, (prev) => prev + ".json") 
Rules:
- ID must match ^[a-zA-Z0-9-]+$
- Keep description short and concise. Only describe what the template does.
- Reply in this format, nothing else:
---ID
template-id
---DESCRIPTION
Description of the template
---SCRIPT
Modification script

Example input and output:
# Input:
add /. before last segment of the path
# Output:
---ID
basic-add-slash-dot
---DESCRIPTION
Adds slash and a dot to the end of path
---SCRIPT
const modifiedRequest = helper.setPath(input, (prev) => {
  const segments = prev.split('/');
  if (segments.length > 1) {
    segments.splice(segments.length - 1, 0, '.');
  }
  return segments.join('/');
});

return [modifiedRequest];
`;
