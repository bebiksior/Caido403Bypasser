export const engineInfo = `Exposed variables and functions:
input - raw HTTP request string

helper.setLine(input, 0, (prev) => prev.toUpperCase())
helper.setPath(input, (prev) => prev.toUpperCase())
helper.setQuery(input, (query) => query + '&new=param')
helper.setBody(input, (body) => body.toUpperCase())
helper.setMethod(input, (prev) => prev.toUpperCase())
helper.addQueryParameter(input, "new=param")
helper.addHeader(input, "Content-Type: application/json")
helper.removeHeader(input, Content-Type")
This functions return a modified version of input string.

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
  'POST /caido/hello?caido=cool&id=123 HTTP/1.1\r\nHost: example.com\r\nAccept: application/json\r\nContent-Type: application/json\r\n\r\n{"hello": "world"}';

export const aiSystemPrompt = `You are AI 403Bypasser template generator. Your job is to generate a template that bypasses 403 Forbidden status code.
${engineInfo}
Helper functions return modified request. You can use them to modify the request. Note that every set function can take either a string or a function as an argument. Example:

const modifiedRequest = helper.setPath(input, (prev) => prev + ".json")
modifiedRequest = helper.addHeader(modifiedRequest, "Content-Type: application/json")

// This is a function that takes the body from base request and returns a modified version of it
modifiedRequest = helper.setBody(modifiedRequest, (body) => {
  const parsedBody = JSON.parse(body);
  parsedBody.hello = "world";
  return JSON.stringify(parsedBody);
})

// Second way to modify the body
modifiedRequest = helper.setBody(modifiedRequest, "hello")

Rules:
- ID must match ^[a-zA-Z0-9-]+$
- Keep description short and concise. Only describe what the template does.
- Note that helper functions only return a modified version of the input string. You must update value of modifiedRequest by yourself. Example: '... modifiedRequest = helper.setPath(...); return modifiedRequest;' instead of '... helper.setPath(...); return modifiedRequest;'.
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
