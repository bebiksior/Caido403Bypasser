import { useSDKStore } from "@/stores/sdkStore";
import { Result } from "shared";

export async function handleBackendCall<T>(
  promise: Promise<Result<T>>,
  sdk: ReturnType<typeof useSDKStore.getState>["sdk"]
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
  handleContent: (content: string) => void
): Promise<void> {
  const apiEndpoint = "https://api.openai.com/v1/chat/completions";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const data = {
    model: "gpt-4o-mini",
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
    controller: ReadableStreamDefaultController<Uint8Array>
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
      if (!trimmedLine || trimmedLine === "[DONE]") return;
      if (!trimmedLine.startsWith("{")) return;

      try {
        const jsonObject = JSON.parse(trimmedLine);
        const content = jsonObject.choices[0]?.delta?.content;
        if (content) {
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
