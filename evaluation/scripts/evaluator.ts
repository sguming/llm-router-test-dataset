import { CORRECTNESS_PROMPT, createLLMAsJudge } from "openevals";
import type { EvaluationResult } from "langsmith/evaluation";

export const correctnessEvaluator = createLLMAsJudge({
  prompt: CORRECTNESS_PROMPT,
  feedbackKey: "correctness",
  model: "openai:gpt-5-mini",
});

// strict equal evaluator
type StrictEqualEvaluatorParams = {
  outputs: Record<string, any>;
  referenceOutputs?: Record<string, any>;
};

export function strictEqualEvaluator(
  params: StrictEqualEvaluatorParams
): EvaluationResult {
  const { outputs, referenceOutputs } = params;

  // outputs: { outputs: '<intent>' }
  // referenceOutputs: { intent: '<intent>' }

  const score = outputs.outputs === referenceOutputs?.intent;

  return {
    key: "strict_equal",
    score,
  };
}
