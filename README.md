# 403Bypasser

403Bypasser is a simple plugin that lets you bypass 403 status code by transforming HTTP requests with custom templates. You can run these templates on any request by right-clicking -> **Plugins** -> **403Bypasser: Scan**.

![Screen Recording 2024-09-18 at 22 08 01](https://github.com/user-attachments/assets/121888fb-b6ba-4c80-8840-808ae43afeb0)

## Installation
You can install 403Bypasser directly from the **Caido Community Store** by navigating in your Caido to **Plugins** -> **Community Store**.

## Features
- **Templates**: Templates are YAML files containing:
  - `ID`
  - `Description`
  - `Modification Script`
- **Modification Script**: The script runs JavaScript on the original request and allows you to send a modified request. You can even return an array of modified requests if you want to send multiple requests from a single template.
- **AI Generate**: You can also use the built-in AI Generate tool! Just provide your OpenAI API key in the settings, and by clicking the AI Generate button, it will create a template for you :D

![Screen Recording 2024-09-18 at 22 05 14](https://github.com/user-attachments/assets/751eff8a-ad16-4e88-ae78-2910cb7684dc)

## Modification Script: Exposed Variables & Functions
- `input`: The raw HTTP request string.
- Helper functions to modify the request:
  - `helper.setLine(input, 0, (prev) => prev.toUpperCase())`
  - `helper.setPath(input, (prev) => prev.toUpperCase())`
  - `helper.setQuery(input, (query) => query + '&new=param')`
  - `helper.addQueryParameter(input, "new=param")`
  - `helper.setMethod(input, (prev) => prev.toUpperCase())`
  - `helper.addHeader(input, "Content-Type: application/json")`
  - `helper.removeHeader(input, "Content-Type")`
  - `helper.setBody(input, "hello")`

  Other helper functions:
  - `helper.getMethod(input)`
  - `helper.getPath(input)`
  - `helper.getQuery(input)`
  - `helper.hasHeader(input, "Content-Type")`

## Example Template

```yaml
id: basic-add-json-ext
description: Appends .json to the path
enabled: true
modificationScript: |-
  const newRequest = helper.setPath(input, (prev) => prev + ".json") 
  return newRequest;
```

![Screenshot 2024-09-18 at 22 15 06](https://github.com/user-attachments/assets/b82ffb33-6830-4728-9f45-463d26ea698d)



## Contribution

Feel free to request features, suggest improvements, or report bugs via GitHub Issues.
