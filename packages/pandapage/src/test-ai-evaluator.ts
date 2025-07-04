import { Effect, Schema } from "effect";
import { Ollama } from "ollama";
import * as dotenv from "dotenv";
import { debug } from './debug';
import * as yaml from "js-yaml";

// Load environment variables
dotenv.config();

// Configuration schema
const AiConfig = Schema.Struct({
  provider: Schema.Literal("ollama", "openrouter"),
  host: Schema.String,
  model: Schema.String,
  apiKey: Schema.optional(Schema.String),
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
  // Determine provider based on environment variables
  const provider = process.env.AI_PROVIDER || 
    (process.env.OPENROUTER_API_KEY ? "openrouter" : "ollama");
  
  const config = {
    provider: provider as "ollama" | "openrouter",
    host: provider === "openrouter" 
      ? "https://openrouter.ai/api/v1"
      : (process.env.OLLAMA_HOST || "http://localhost:11434"),
    model: process.env.AI_MODEL || 
      process.env.OLLAMA_MODEL || 
      process.env.OPENROUTER_MODEL || 
      "llama2",
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OLLAMA_API_KEY,
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
      let response: any;
      
      if (config.provider === "openrouter") {
        // Use OpenRouter API
        const apiResponse = yield* Effect.tryPromise({
          try: () => fetch(`${config.host}/chat/completions`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${config.apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://github.com/aaronshaf/PandaPage",
              "X-Title": "PandaPage PDF Test Evaluator"
            },
            body: JSON.stringify({
              model: config.model,
              messages: [{
                role: "user",
                content: prompt
              }],
              temperature: 0.1,
              max_tokens: 400
            })
          }),
          catch: (error) => new Error(`OpenRouter API error: ${error}`)
        });
        
        const jsonResponse = yield* Effect.tryPromise({
          try: () => apiResponse.json(),
          catch: () => new Error("Failed to parse OpenRouter response")
        });
        
        response = { response: jsonResponse.choices[0].message.content };
      } else {
        // Use Ollama API
        const ollama = new Ollama({ host: config.host });
        response = yield* Effect.tryPromise({
          try: () => ollama.generate({
            model: config.model,
            prompt,
            stream: false,
            options: {
              temperature: 0.1,
              top_p: 0.9,
              num_predict: 400
            }
          }),
          catch: (error) => new Error(`Ollama API error: ${error}`)
        });
      }
      
      // Parse the YAML response
      let responseText = response.response.trim();
      
      // Remove markdown code blocks if present
      responseText = responseText.replace(/^```(?:yaml|yml)?\n?/i, '').replace(/\n?```$/i, '');
      
      // Remove --- delimiters if present
      responseText = responseText.replace(/^---\n?/m, '').replace(/\n?---$/m, '');
      
      try {
        // Parse YAML response
        const parsedYaml = yaml.load(responseText) as any;
        
        if (typeof parsedYaml.score !== 'number' || !parsedYaml.description) {
          throw new Error("Invalid YAML structure");
        }
        
        return {
          score: Math.max(0, Math.min(100, parsedYaml.score)),
          description: parsedYaml.description.trim(),
          passed: parsedYaml.score >= (config.minExactMatchScore * 100)
        };
      } catch (parseError) {
        debug.error("Failed to parse YAML response:", responseText);
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