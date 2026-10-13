// Transport boundary. No AI, source data, or user content is processed before this gate.
// This file is framework-independent so it can be tested with node:test.
const JSON_HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff"
};

function denied(status, reason = "Not authorized") {
  return { accepted: false, response: new Response(JSON.stringify({ error: reason }), { status, headers: JSON_HEADERS }) };
}

export function secretMatches(given, expected) {
  if (typeof given !== "string" || typeof expected !== "string" || !expected || !given) return false;
  // Fixed loop over expected length, never early exit based on an individual character.
  let difference = given.length ^ expected.length;
  for (let i = 0; i < expected.length; i++) {
    difference |= (given.charCodeAt(i) || 0) ^ expected.charCodeAt(i);
  }
  return difference === 0;
}

export function verifiedTelegramActor(update) {
  const msg = update?.message;
  const callback = update?.callback_query;
  const entry = msg ?? callback?.message;
  const sender = msg?.from ?? callback?.from;

  if (!Number.isSafeInteger(update?.update_id) || update.update_id < 0) return null;
  if (!entry || !sender || entry.chat?.type !== "private") return null;
  if (!Number.isSafeInteger(sender.id) || !Number.isSafeInteger(entry.chat?.id)) return null;
  if (sender.id !== entry.chat.id || sender.is_bot === true) return null;
  return { userId: String(sender.id), chatId: String(entry.chat.id), updateId: String(update.update_id) };
}

export async function telegramIngressGate(request, env) {
  if (request.method !== "POST") return denied(405, "Method not allowed");

  const secret = env?.TELEGRAM_WEBHOOK_SECRET_TOKEN;
  const owner = env?.JARVIS_OWNER_TELEGRAM_ID;

  // No owner configured means NO access, not first-visitor enrollment.
  if (!secret || !/^\d{1,19}$/.test(String(owner ?? ""))) return denied(503, "Agent is not paired");

  if (!secretMatches(request.headers.get("x-telegram-bot-api-secret-token"), secret)) {
    return denied(403);
  }

  const type = request.headers.get("content-type") || "";
  if (!type.toLowerCase().startsWith("application/json")) return denied(415, "Expected JSON");

  const length = Number(request.headers.get("content-length") || 0);
  if (length > 65536) return denied(413, "Update too large");

  let update;
  try {
    const body = await request.clone().text();
    if (!body || body.length > 65536) return denied(413, "Update too large");
    update = JSON.parse(body);
  } catch {
    return denied(400, "Malformed update");
  }

  const actor = verifiedTelegramActor(update);
  if (!actor || actor.userId !== String(owner)) {
    // Acknowledge Telegram updates for unknown/private-unpaired actors.
    // They never enter the model, session or tools, and we avoid retry floods.
    return { accepted: false, response: new Response("ignored", { status: 200, headers: { "cache-control": "no-store" } }) };
  }
  return { accepted: true, actor };
}
