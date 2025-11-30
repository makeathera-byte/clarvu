import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api/responses";
import { getGroqClient, runGroqChat } from "@/lib/ai/groq";

/**
 * GET /api/test-ai
 * Test endpoint to verify Groq API is working
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const user = await getUserOrThrow();

    // Check if GROQ_API_KEY is configured
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return errorResponse(
        "GROQ_API_KEY environment variable is not configured. Please add it to your .env.local file.",
        500
      );
    }

    // Test 1: Basic API connectivity
    let basicTestResult: any = null;
    try {
      basicTestResult = await runGroqChat<string>(
        "Say 'Hello, DayFlow!' if you can read this. Only respond with the greeting.",
        false,
        "llama-3.1-8b-instant"
      );
    } catch (error: any) {
      return errorResponse(
        `Basic API test failed: ${error.message || "Unknown error"}`,
        500
      );
    }

    // Test 2: JSON mode
    let jsonTestResult: any = null;
    try {
      jsonTestResult = await runGroqChat<{ status: string; message: string }>(
        'Return a JSON object with "status" set to "ok" and "message" set to "JSON mode working"',
        true,
        "llama-3.1-8b-instant"
      );
    } catch (error: any) {
      return errorResponse(
        `JSON mode test failed: ${error.message || "Unknown error"}`,
        500
      );
    }

    return successResponse({
      apiKeyConfigured: true,
      apiKeyPrefix: apiKey.substring(0, 10) + "...",
      basicTest: {
        success: !!basicTestResult,
        response: basicTestResult?.substring(0, 100) || null,
      },
      jsonTest: {
        success: !!jsonTestResult,
        parsed: jsonTestResult,
      },
      summary: "All AI API tests passed! ✅",
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

