// Wonkite question service: turns the last few answers into one short follow-up question.
const MODEL = "@cf/meta/llama-3.2-3b-instruct";

const SYSTEM = [
  "You are a quiet, curious interviewer helping someone get their thoughts down for a journal or blog entry.",
  "Ask exactly ONE question, under 15 words.",
  "Make it open: begin with What, How, Where, Who, or Tell me. Never ask a yes/no question. Avoid Why; ask How or What instead.",
  "Keep it neutral: add no adjectives or assumptions of your own. If a describing word is needed, use the one they used.",
  "Build it on a specific word, name, place or detail from their most recent answer.",
  "Ask for the story and its concrete details before asking what it meant to them.",
  "Never make statements, comment, praise, summarise, give advice, or answer for them.",
  "Output only the question, nothing else."
].join(" ");

const HINTS = {
  tour: "Ask them to walk you through what they just mentioned.",
  detail: "Ask for a concrete detail.",
  context: "Ask them to put themselves back in the scene: what they saw, heard or smelled.",
  example: "Ask for one particular instance.",
  people: "Ask about someone else who was there.",
  sequence: "Ask what happened next, or just before.",
  perspective: "Ask how someone else who was there would tell it.",
  words: "Hand back a describing word they used and ask what they mean by it.",
  feeling: "Ask what was going on in their head at the time.",
  expand: "Ask them to say more.",
  reflect: "They have told the story; now ask what they make of it, looking back.",
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
    if (url.pathname === "/feedback" && request.method === "POST") return saveFeedback(request, env, headers);
    if (url.pathname === "/feedback/summary" && request.method === "GET") return feedbackSummary(request, env, headers);
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

// ---------- question ratings ----------
const clip = (v, n) => String(v || "").slice(0, n);

async function saveFeedback(request, env, headers) {
  if (!env.DB) return Response.json({ error: "feedback_not_configured" }, { status: 501, headers });
  let r;
  try { r = await request.json(); } catch { return new Response("Bad JSON", { status: 400, headers }); }
  const vote = Number(r.vote);
  if (vote !== 1 && vote !== -1 || !r.template) return new Response("Bad rating", { status: 400, headers });
  await env.DB.prepare(
    "INSERT INTO feedback (ts, mode, kind, template, question, vote, answer) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(Date.now(), clip(r.mode, 20), clip(r.kind, 20), clip(r.template, 300), clip(r.question, 300), vote, clip(r.answer, 600)).run();
  return new Response(null, { status: 204, headers });
}

// GET /feedback/summary with "Authorization: Bearer <ADMIN_TOKEN>"
async function feedbackSummary(request, env, headers) {
  if (!env.DB) return Response.json({ error: "feedback_not_configured" }, { status: 501, headers });
  if (!env.ADMIN_TOKEN || request.headers.get("Authorization") !== "Bearer " + env.ADMIN_TOKEN) {
    return new Response("Unauthorized", { status: 401, headers });
  }
  const { results } = await env.DB.prepare(
    `SELECT template, kind,
            SUM(vote = 1) AS up, SUM(vote = -1) AS down, COUNT(*) AS total,
            (SELECT question || '  <-  ' || answer FROM feedback f2
              WHERE f2.template = f.template AND f2.vote = -1 AND f2.answer != ''
              ORDER BY ts DESC LIMIT 1) AS latest_down_example
       FROM feedback f
      GROUP BY template, kind
      ORDER BY (SUM(vote = -1) - SUM(vote = 1)) DESC, total DESC`
  ).all();
  return Response.json(results, { headers });
}
