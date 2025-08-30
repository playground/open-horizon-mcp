import { ToolResponse } from "../models/model.js";

export function getErrorMessage(err: any): ToolResponse {
  console.log('Show error message:', err);
  if (err instanceof Error) {
    console.error("[ERROR]", err.message);
    return {
      content: [
        {
          type: "text",
          text: `Error fetching data: ${err.message}`,
        },
      ],
    };
  }

  console.error("[UNKNOWN ERROR]", err);
  return {
    content: [
      {
        type: "text",
        text: "An unknown error occurred.",
      },
    ],
  };
}

export async function makeHttpRequest<T = any>(url: string, headers: Record<string, string> = {}): Promise<T | ToolResponse> {
    const finalHeaders = {
      "Accept": "application/json",
      ...headers
    };

    try {
      const response = await fetch(url, { headers: finalHeaders });

      if (!response.ok) {
        return getErrorMessage(`Error fetching data: ${response.status} ${response.statusText}`);
      }
      return (await response.json()) as T;

    } catch (err: any) {
      console.log(`Error making request to ${url}:`, err);
      return getErrorMessage(`Error fetching data: ${err.message || "Unknown error"}`);
    }
  }
