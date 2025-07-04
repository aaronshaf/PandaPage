import { Effect, Schema } from "effect";
import { Ollama } from "ollama";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configuration schema
const AiConfig = Schema.Struct({
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
  const config = {
    host: process.env.OLLAMA_HOST || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama2",
    apiKey: process.env.OLLAMA_API_KEY,
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

// AI-powered evaluation
const evaluateWithAi = (
  expected: string,
  actual: string,
  config: Schema.Schema.Type<typeof AiConfig>
): Effect.Effect<EvaluationResult, Error> =>
  Effect.gen(function* () {
    const ollama = new Ollama({ host: config.host });
    
    const prompt = `You are a test evaluator comparing extracted text from documents.

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

Respond in the following JSON format:
{
  "score": <number between 0 and 100>,
  "description": "<A brief 1-2 sentence description of the main differences>"
}`;

    try {
      const response = yield* Effect.tryPromise({
        try: () => ollama.generate({
          model: config.model,
          prompt,
          format: "json",
          stream: false,
          options: {
            temperature: 0.1,  // Lower temperature for more consistent results
            top_p: 0.9,
            num_predict: 200   // Limit response length
          }
        }),
        catch: (error) => new Error(`Ollama API error: ${error}`)
      });
      
      const result = JSON.parse(response.response);
      
      return {
        score: Math.max(0, Math.min(100, result.score)),
        description: result.description || "No description provided",
        passed: result.score >= (config.minExactMatchScore * 100)
      };
    } catch (error) {
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
    
    // Check for exact match first
    if (expected === actual) {
      return {
        score: 100,
        description: "Perfect match",
        passed: true
      };
    }
    
    // Check basic similarity
    const basicSimilarity = calculateBasicSimilarity(expected, actual);
    
    // If very close match or AI evaluation disabled, use basic similarity
    if (basicSimilarity >= config.minExactMatchScore || !config.aiEvaluationEnabled) {
      return {
        score: Math.round(basicSimilarity * 100),
        description: basicSimilarity >= config.minExactMatchScore 
          ? "Near perfect match with minor whitespace differences"
          : "Basic similarity check failed",
        passed: basicSimilarity >= config.minExactMatchScore
      };
    }
    
    // Use AI evaluation for more detailed analysis
    return yield* evaluateWithAi(expected, actual, config);
  });

// Test helper for Bun tests
export const expectTextMatch = async (
  actual: string,
  expected: string,
  testName?: string
): Promise<void> => {
  const result = await Effect.runPromise(evaluateTextExtraction(expected, actual));
  
  if (!result.passed) {
    const message = `${testName ? `${testName}: ` : ""}Text extraction mismatch
Score: ${result.score}%
${result.description}`;
    
    throw new Error(message);
  }
};