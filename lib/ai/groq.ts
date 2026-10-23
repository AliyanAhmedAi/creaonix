import type { AIProvider, DraftRequest } from "@/lib/ai/provider";

export class GroqProvider implements AIProvider {
  async draft(input: DraftRequest): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL;
    if (!apiKey || !model) throw new Error("AI_NOT_CONFIGURED");

    const voice = input.brandVoice?.trim() || input.tone;
    const system = input.task === "ideas"
      ? "You are a careful creator strategist. Suggest exactly five distinct, practical content ideas. Do not claim performance data or invent facts. Keep each idea concise and include a possible hook."
      : "You are a creator's writing partner. Draft a clear, original short-form script with a hook, body, and closing CTA. Do not invent factual claims; mark any facts needing verification.";
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, temperature: 0.7, max_tokens: 1200, messages: [
        { role: "system", content: `${system}\nVoice guidance: ${voice}.` },
        { role: "user", content: `Topic: ${input.topic}\nAudience: ${input.audience}\nTask: ${input.task === "ideas" ? "Generate ideas" : "Write a draft script"}.` }
      ] }),
      signal: AbortSignal.timeout(30_000)
    });
    if (!response.ok) throw new Error("AI_REQUEST_FAILED");
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("choices" in payload)) throw new Error("AI_RESPONSE_INVALID");
    const choices = (payload as { choices?: Array<{ message?: { content?: unknown } }> }).choices;
    const text = choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) throw new Error("AI_RESPONSE_INVALID");
    return text.trim();
  }
}
