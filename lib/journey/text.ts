/**
 * Removes clauses where the person says what they ALREADY know, so topic
 * matching focuses on what they want to learn.
 * "I understand stocks and mutual funds, but I don't know how limit orders work"
 *   -> " but I don't know how limit orders work"
 */
export function stripKnownClauses(text: string): string {
  return text.replace(
    /\b(?:i\s+(?:already\s+)?(?:understand|know(?:\s+about)?|get)|i'?m\s+(?:already\s+)?familiar\s+with|i\s+am\s+(?:already\s+)?familiar\s+with)\b(?!\s+(?:how|what|why|where|when|which|if|whether))[^,.;!?]*?(?=,|\.|;|!|\?|\bbut\b|$)/gi,
    ' '
  );
}
