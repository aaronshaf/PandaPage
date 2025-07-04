import { Effect, Schema } from "effect";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import * as dotenv from "dotenv";
import { debug } from './debug';
import * as yaml from "js-yaml";

// Load environment variables
dotenv.config();

// Configuration schema
const AiConfig = Schema.Struct({
  baseUrl: Schema.String,
  apiKey: Schema.String,
  model: Schema.String,
  minExactMatchScore: Schema.Number.pipe(
    Schema.between(0, 1)
  ),
  aiEvaluationEnabled: Schema.Boolean
});

// Evaluation result schema
const EvaluationResult = Schema.Struct({
  score: Schema.Number.pipe(
    Schema.between(0, 100)
  ),
  description: Schema.String,
  passed: Schema.Boolean
});

type EvaluationResult = Schema.Schema.Type<typeof EvaluationResult>;

// Load configuration from environment
const loadConfig = () => Effect.gen(function* () {
  const config = {
    baseUrl: process.env.AI_BASE_URL || "http://localhost:11434/v1",
    apiKey: process.env.AI_API_KEY || "ollama", // Ollama doesn't need a real key
    model: process.env.AI_MODEL || "gemma3n:latest",
    minExactMatchScore: parseFloat(process.env.TEST_MIN_EXACT_MATCH_SCORE || "0.95"),
    aiEvaluationEnabled: process.env.TEST_AI_EVALUATION_ENABLED !== "false"
  };
  
  return yield* Schema.decode(AiConfig)(config);
});

// Simple text similarity check (before using AI)
const calculateBasicSimilarity = (expected: string, actual: string): number => {
  if (expected === actual) return 1;
  
  // Normalize whitespace for comparison
  const normalizedExpected = expected.trim().replace(/\s+/g, " ");
  const normalizedActual = actual.trim().replace(/\s+/g, " ");
  
  if (normalizedExpected === normalizedActual) return 0.99;
  
  // Calculate character-level similarity
  const maxLength = Math.max(normalizedExpected.length, normalizedActual.length);
  if (maxLength === 0) return 1;
  
  let matches = 0;
  const minLength = Math.min(normalizedExpected.length, normalizedActual.length);
  
  for (let i = 0; i < minLength; i++) {
    if (normalizedExpected[i] === normalizedActual[i]) {
      matches++;
    }
  }
  
  return matches / maxLength;
};

// Evaluate text extraction using AI
const evaluateWithAi = (expected: string, actual: string, config: Schema.Schema.Type<typeof AiConfig>) =>
  Effect.gen(function* () {
    const prompt = `Compare these two text extractions from a PDF document.

Expected text:
"""
${expected}
"""

Actual extracted text:
"""
${actual}
"""

Please evaluate how well the actual text matches the expected text on a scale of 0-100%, where:
- 100% = Perfect match (identical or only trivial whitespace differences)
- 90-99% = Excellent match (minor formatting differences, same content)
- 70-89% = Good match (most content present, some formatting issues)
- 50-69% = Fair match (significant content present but with issues)
- Below 50% = Poor match (missing significant content or major errors)

Respond ONLY with valid YAML in the following format:
---
score: <number between 0 and 100>
description: |
  <A detailed paragraph explaining the differences between the texts,
   including content differences, formatting issues, structural differences,
   and any character encoding problems. Be specific about what is missing,
   extra, or different between the expected and actual text.>`;

    try {
      // Create OpenAI-compatible provider
      const provider = createOpenAICompatible({
        baseURL: config.baseUrl,
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
        }
      });

      // Generate text using AI SDK
      const { text: responseText } = yield* Effect.tryPromise({
        try: () => generateText({
          model: provider(config.model),
          prompt,
          temperature: 0.1,
          maxTokens: 800,
        }),
        catch: (error) => new Error(`AI generation error: ${error}`)
      });
      
      // Parse the YAML response
      let yamlText = responseText.trim();
      
      if (process.env.AI_DEBUG === "true") {
        debug.log("Raw AI response:", responseText);
      }
      
      // Remove markdown code blocks if present
      yamlText = yamlText.replace(/^```(?:yaml|yml)?\n?/i, '').replace(/\n?```$/i, '');
      
      // Remove --- delimiters if present
      yamlText = yamlText.replace(/^---\n?/m, '').replace(/\n?---$/m, '');
      
      if (process.env.AI_DEBUG === "true") {
        debug.log("Cleaned YAML text:", yamlText);
      }
      
      try {
        // Parse YAML response
        const parsedYaml = yaml.load(yamlText) as any;
        
        if (typeof parsedYaml.score !== 'number' || !parsedYaml.description) {
          throw new Error("Invalid YAML structure");
        }
        
        return {
          score: Math.max(0, Math.min(100, parsedYaml.score)),
          description: parsedYaml.description.trim(),
          passed: parsedYaml.score >= (config.minExactMatchScore * 100)
        };
      } catch (parseError) {
        debug.error("Failed to parse YAML response:", yamlText);
        debug.error("Parse error:", parseError);
        throw new Error(`Failed to parse YAML response: ${parseError}`);
      }
    } catch (error) {
      // Log error in debug mode
      if (process.env.AI_DEBUG === "true") {
        debug.error("AI evaluation error:", error);
      }
      
      // Fallback to basic similarity if AI fails
      const basicScore = calculateBasicSimilarity(expected, actual) * 100;
      return {
        score: basicScore,
        description: "AI evaluation failed, using basic character similarity",
        passed: basicScore >= (config.minExactMatchScore * 100)
      };
    }
  });

// Main evaluation function
export const evaluateTextExtraction = (
  expected: string,
  actual: string
): Effect.Effect<EvaluationResult, Error> =>
  Effect.gen(function* () {
    const config = yield* loadConfig();
    
    // First check for exact match
    if (expected === actual) {
      return {
        score: 100,
        description: "Perfect match",
        passed: true
      };
    }
    
    // Check if AI evaluation is enabled
    if (!config.aiEvaluationEnabled) {
      const basicScore = calculateBasicSimilarity(expected, actual) * 100;
      return {
        score: basicScore,
        description: "AI evaluation disabled, using basic similarity",
        passed: basicScore >= (config.minExactMatchScore * 100)
      };
    }
    
    // Use AI evaluation for more detailed analysis
    return yield* evaluateWithAi(expected, actual, config);
  });

// Test helper for Bun tests with configurable threshold
export const expectTextMatch = async (
  actual: string,
  expected: string,
  options?: {
    testName?: string;
    threshold?: number; // Custom threshold (0-100), defaults to config
  }
): Promise<void> => {
  const result = await Effect.runPromise(evaluateTextExtraction(expected, actual));
  
  // Use custom threshold if provided, otherwise use the configured minimum
  const threshold = options?.threshold ?? 
    (await Effect.runPromise(loadConfig()).then(c => c.minExactMatchScore * 100));
  
  const passed = result.score >= threshold;
  
  if (!passed) {
    throw new Error(`Score: ${result.score}% (need ${threshold}%) - ${result.description}`);
  }
  
  // Silent on pass - tests will show their own output
};