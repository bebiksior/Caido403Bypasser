import { type Result } from "shared";

import { FrontendSDK } from "@/types/types";

export async function handleBackendCall<T>(
  promise: Promise<Result<T>> | Result<T>,
  sdk: FrontendSDK,
) {
  const result = await promise;

  if (result.kind === "Error") {
    sdk?.window.showToast(result.error, {
      variant: "error",
    });
    throw new Error(result.error);
  }

  return result.value;
}

export async function fetchOpenAIStream(
  apiKey: string,
  userPrompt: string,
  systemPrompt: string,
  handleContent: (content: string) => void,
): Promise<void> {
  const apiEndpoint = "https://api.openai.com/v1/chat/completions";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const data = {
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    stream: true,
  };

  async function processStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    controller: ReadableStreamDefaultController<Uint8Array>,
  ): Promise<void> {
    const { done, value } = await reader.read();

    if (done) {
      controller.close();
      return;
    }

    controller.enqueue(value);

    const decodedText = new TextDecoder().decode(value);
    const lines = decodedText.split("data:");

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine === "[DONE]") {return;}
      if (!trimmedLine.startsWith("{")) {return;}

      try {
        const jsonObject = JSON.parse(trimmedLine);
        const content = jsonObject.choices[0]?.delta?.content;
        if (content !== undefined) {
          handleContent(content);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });

    return processStream(reader, controller);
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    const reader = response.body?.getReader();
    if (reader) {
      const stream = new ReadableStream({
        start(controller) {
          processStream(reader, controller);
        },
      });

      await new Response(stream).text();
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

export function formatDate(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function getSelectedRequest() {
  function getPortAndTLS(url: string) {
    const isSecure = url.startsWith("https://");
    let portNumber = isSecure ? 443 : 80;

    try {
      const urlObj = new URL(url);
      if (urlObj.port) {
        portNumber = parseInt(urlObj.port);
      }
    } catch {
      // Ignore
    }

    return {
      isTLS: isSecure,
      port: portNumber,
    };
  }

  function getHost(url: string) {
    const urlObj = new URL(url);
    return urlObj.host.split(":")[0];
  }

  switch (location.hash) {
    case "#/automate":
    case "#/http-history": {
      const { innerText: historyRaw } = document.querySelector(
        "[data-language='http-request']",
      ) as HTMLElement;
      let historyUrl: string;
      const historyUrlElement = document.querySelector(
        ".c-request-header__label",
      );
      const automateUrlElement = document.querySelector(
        ".c-automate-session-toolbar__connection-info input",
      ) as HTMLInputElement;

      if (historyUrlElement !== null) {
        historyUrl = (historyUrlElement as HTMLElement).innerText;
      } else if (automateUrlElement !== null) {
        historyUrl = automateUrlElement.value;
      } else {
        throw new Error("Could not find URL element");
      }

      const newHistoryRaw = historyRaw.replace(/\n/g, "\r\n");

      const { isTLS, port } = getPortAndTLS(historyUrl);

      return {
        raw: newHistoryRaw,
        isTLS,
        port,
        host: getHost(historyUrl),
      };
    }

    case "#/replay": {
      const { value: replayUrl } = document.querySelector(
        ".c-replay-session-toolbar__connection-info input",
      ) as HTMLInputElement;

      const { innerText: replayRaw } = document.querySelector(
        "[data-language='http-request']",
      ) as HTMLElement;

      const newReplayRaw = replayRaw.replace(/\n/g, "\r\n");

      const { isTLS, port } = getPortAndTLS(replayUrl);

      return {
        raw: newReplayRaw,
        isTLS,
        port,
        host: getHost(replayUrl),
      };
    }

    default:
      console.error(`Can't obtain selected request from ${location.hash}`);
      throw new Error("Can't obtain selected request");
  }
}
