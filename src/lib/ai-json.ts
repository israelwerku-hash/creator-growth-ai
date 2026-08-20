export function parseAIJson<T = any>(rawContent: string): T {
  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleanContent = rawContent.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  let parsedJson;
  try {
    parsedJson = JSON.parse(cleanContent);
  } catch (parseErr) {
    console.warn("[AI_JSON] Initial JSON.parse failed, attempting extraction. Raw:", cleanContent);
    // 2. Try to extract JSON object from surrounding text
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedJson = JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        console.error("[AI_JSON] JSON extraction also failed:", innerErr);
        throw new Error("AI returned malformed JSON. Please try again.");
      }
    } else {
      throw new Error("AI returned non-JSON response. Please try again.");
    }
  }

  return parsedJson;
}
