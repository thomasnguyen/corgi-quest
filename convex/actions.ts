import { action } from "./_generated/server";

/**
 * Generate OpenAI Realtime API Session Token
 *
 * Creates an ephemeral session token for client-side WebSocket connections
 * to the OpenAI Realtime API. This token is used to establish secure
 * audio-to-audio voice conversations with function calling capabilities.
 *
 * @returns {string} Session token (client_secret.value)
 * @throws {Error} If OPENAI_API_KEY is not configured or API request fails
 */
export const generateSessionToken = action(async () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY not configured. Please add it to your Convex environment variables."
    );
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-10-01",
          voice: "alloy",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to generate session token: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.client_secret?.value) {
      throw new Error(
        "Invalid response from OpenAI: missing client_secret.value"
      );
    }

    return data.client_secret.value;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `OpenAI session token generation failed: ${error.message}`
      );
    }
    throw new Error("OpenAI session token generation failed: Unknown error");
  }
});
