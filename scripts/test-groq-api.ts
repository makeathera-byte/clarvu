/**
 * Test script to verify Groq API is working
 * Run with: npx tsx scripts/test-groq-api.ts
 */

import Groq from "groq-sdk";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error("❌ GROQ_API_KEY not found in .env.local");
  console.log("\nPlease add GROQ_API_KEY to your .env.local file:");
  console.log("GROQ_API_KEY=your_api_key_here");
  process.exit(1);
}

console.log("✅ GROQ_API_KEY found");
console.log(`   Key starts with: ${apiKey.substring(0, 10)}...`);

const groq = new Groq({
  apiKey,
});

async function testGroqAPI() {
  console.log("\n🧪 Testing Groq API connection...\n");

  try {
    // Simple test request
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say 'Hello, DayFlow!' if you can read this.",
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 50,
    });

    const response = completion.choices[0]?.message?.content;

    if (response) {
      console.log("✅ Groq API is working!");
      console.log(`   Response: ${response}`);
      return true;
    } else {
      console.error("❌ No response received from Groq API");
      return false;
    }
  } catch (error: any) {
    console.error("❌ Groq API error:");
    console.error(`   ${error.message}`);
    
    if (error.message?.includes("401") || error.message?.includes("unauthorized")) {
      console.error("\n⚠️  API key might be invalid or expired");
    } else if (error.message?.includes("429")) {
      console.error("\n⚠️  Rate limit exceeded - try again later");
    }
    
    return false;
  }
}

async function testJSONMode() {
  console.log("\n🧪 Testing JSON mode...\n");

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You must respond with valid JSON only.",
        },
        {
          role: "user",
          content: 'Return a JSON object with key "status" and value "ok"',
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 50,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;

    if (response) {
      try {
        const parsed = JSON.parse(response);
        console.log("✅ JSON mode is working!");
        console.log(`   Parsed JSON: ${JSON.stringify(parsed)}`);
        return true;
      } catch (e) {
        console.error("❌ JSON parsing failed:");
        console.error(`   Response: ${response}`);
        return false;
      }
    } else {
      console.error("❌ No response received");
      return false;
    }
  } catch (error: any) {
    console.error("❌ JSON mode test error:");
    console.error(`   ${error.message}`);
    return false;
  }
}

// Run tests
async function main() {
  const basicTest = await testGroqAPI();
  const jsonTest = await testJSONMode();

  console.log("\n" + "=".repeat(50));
  if (basicTest && jsonTest) {
    console.log("✅ All tests passed! Groq API is fully functional.");
    process.exit(0);
  } else {
    console.log("❌ Some tests failed. Please check the errors above.");
    process.exit(1);
  }
}

main();

