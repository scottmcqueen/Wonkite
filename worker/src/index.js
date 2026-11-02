// Wonkite question service: turns the last few answers into one short follow-up question.
const MODEL = "@cf/meta/llama-3.2-3b-instruct";

const SYSTEM = [
  "You are a quiet, curious interviewer helping someone get their thoughts down for a journal or blog entry.",
  "Ask exactly ONE question, under 20 words.",
  "Ground it in a specific word, person, place or detail from their most recent answer.",
  "Never comment, praise, summarise, give advice, or answer for them.",
  "Output only the question, nothing else."
].join(" ");

const HINTS = {
  detail: "Ask for a concrete detail.",
  sensory: "Ask what they saw, heard or smelled.",
  why: "Ask why it mattered to them.",
  example: "Ask for one specific moment.",
  contrast: "Ask how it differed from what they expected.",
  people: "Ask about someone else who was involved.",
  outsider: "Ask what an outsider would misunderstand.",
  next: "Ask what happened next.",
  feeling: "Ask how it felt.",
  expand: "Ask them to say more.",
  zoom: "Step back from this thread and ask about another part of the subject."
};

function cors(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

export default {
  async fetch(request, env) {
    const headers = cors(env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/question") {
      return new Response("Not found", { status: 404, headers });
    }

    let body;
    try { body = await request.json(); } catch { return new Response("Bad JSON", { status: 400, headers }); }

    const turns = Array.isArray(body.turns) ? body.turns.slice(-6) : [];
    if (!turns.length) return new Response("No turns", { status: 400, headers });

    const subject = body.mode === "day" ? "their day" : body.mode === "you" ? "themselves, in a friendly getting-to-know-you conversation" : (String(body.topic || "").slice(0, 80) || "a subject of their choosing");
    const hint = HINTS[body.hint] ? " " + HINTS[body.hint] : "";

    const messages = [{ role: "system", content: `${SYSTEM} They are talking about ${subject}.${hint}` }];
    for (const t of turns) {
      messages.push({ role: "assistant", content: String(t.q || "").slice(0, 300) });
      messages.push({ role: "user", content: String(t.a || "").slice(0, 1500) });
    }

    try {
      const out = await env.AI.run(MODEL, { messages, max_tokens: 60, temperature: 0.7 });
      let q = String(out.response || "").trim().split("\n")[0].replace(/^["“']|["”']$/g, "").trim();
      return Response.json({ question: q }, { headers });
    } catch (e) {
      return Response.json({ error: "model_unavailable" }, { status: 502, headers });
    }
  }
};
