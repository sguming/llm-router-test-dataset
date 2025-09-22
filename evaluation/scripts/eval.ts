import { evaluate } from "langsmith/evaluation";
import { classifyIntent } from "../../src/intent_classifier/index.js";
import { strictEqualEvaluator } from "./evaluator.js";

await evaluate(
  async (inputs) => {
    const { intent } = await classifyIntent({
      user_query: inputs.input,
      chat_history: "N/A",
      most_recent_intent: "N/A",
    });

    return intent;
  },
  {
    data: "small-testset-loose",
    evaluators: [strictEqualEvaluator],
    experimentPrefix: "intent-classifier, gpt-4o-mini, baseline", // optional, experiment name prefix
    maxConcurrency: 5, // optional, add concurrency
  }
);
