import Groq from "groq-sdk";

let groqClient: Groq | null = null;

/**
 * Get or create a Groq client instance
 * Uses GROQ_API_KEY environment variable
 */
export function getGroqClient(): Groq {
  if (groqClient) {
    return groqClient;
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY environment variable is required. Please add it to your .env.local file."
    );
  }

  groqClient = new Groq({
    apiKey,
  });

  return groqClient;
}

/**
 * Make a chat completion request to Groq
 * Defaults to Llama3-8B for cost efficiency
 */
export async function groqChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  model: "llama-3.1-8b-instant" | "mixtral-8x7b-32768" = "llama-3.1-8b-instant"
) {
  const groq = getGroqClient();

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error: any) {
    console.error("Groq API error:", error);
    
    // Handle rate limit (429) errors gracefully - return null instead of crashing
    if (error?.status === 429 || error?.code === 429 || error?.message?.includes("429")) {
      console.warn("Groq API rate limit exceeded - returning null to allow fallback");
      return null;
    }
    
    throw new Error(`Groq API error: ${error.message || "Unknown error"}`);
  }
}

/**
 * Parse JSON response from Groq, with fallback
 */
export function parseGroqJSON<T>(response: string | null): T | null {
  if (!response) return null;

  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response.trim();

    // Try to extract JSON object from text
    const objectMatch = jsonString.match(/\{[\s\S]*\}/);
    const finalJson = objectMatch ? objectMatch[0] : jsonString;

    return JSON.parse(finalJson) as T;
  } catch (error) {
    console.error("Failed to parse Groq JSON response:", error);
    console.error("Response was:", response);
    return null;
  }
}

/**
 * Run Groq chat completion with JSON mode support
 * @param prompt - The prompt string or messages array
 * @param jsonMode - Whether to request JSON response format
 * @param model - Model to use (default: mixtral-8x7b)
 * @returns Parsed JSON response or raw string
 */
export async function runGroqChat<T = any>(
  prompt: string | Array<{ role: "system" | "user" | "assistant"; content: string }>,
  jsonMode: boolean = true,
  model: "mixtral-8x7b-32768" | "llama-3.1-8b-instant" = "mixtral-8x7b-32768"
): Promise<T | null> {
  const groq = getGroqClient();

  try {
    // Convert string prompt to messages array
    const messages = typeof prompt === "string"
      ? [{ role: "user" as const, content: prompt }]
      : prompt;

    // Add JSON mode instruction if enabled
    const systemMessage = jsonMode
      ? "You must respond with valid JSON only. No markdown, no code blocks, no extra text."
      : "";

    const messagesWithSystem = systemMessage
      ? [{ role: "system" as const, content: systemMessage }, ...messages]
      : messages;

    const completion = await groq.chat.completions.create({
      messages: messagesWithSystem,
      model,
      temperature: 0.3,
      max_tokens: 1000,
      response_format: jsonMode ? { type: "json_object" } : undefined,
    });

    const response = completion.choices[0]?.message?.content || null;

    if (!response) {
      return null;
    }

    if (jsonMode) {
      return parseGroqJSON<T>(response);
    }

    return response as T;
  } catch (error: any) {
    console.error("Groq API error:", error);
    
    // Handle rate limit (429) errors gracefully - return null instead of crashing
    if (error?.status === 429 || error?.code === 429 || error?.message?.includes("429")) {
      console.warn("Groq API rate limit exceeded - returning null to allow fallback");
      return null;
    }
    
    throw new Error(`Groq API error: ${error.message || "Unknown error"}`);
  }
}

