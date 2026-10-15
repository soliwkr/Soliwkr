import test from "node:test";
import assert from "node:assert/strict";
import { telegramIngressGate, secretMatches, verifiedTelegramActor } from "../src/telegram-guard.mjs";

const ENDPOINT = "https://jarvis.test/messengers/telegram/webhook";
const config = { TELEGRAM_WEBHOOK_SECRET_TOKEN: "long-audited-random-secret", JARVIS_OWNER_TELEGRAM_ID: "123456789" };
const valid = {
  update_id: 110,
  message: {
    message_id: 4,
    from: { id: 123456789, is_bot: false, username: "untrusted-display-name" },
    chat: { id: 123456789, type: "private" },
    text: "/stato"
  }
};
const request = (payload = valid, options = {}) => new Request(ENDPOINT, {
  method: options.method || "POST",
  ...(options.method === "GET" ? {} : { body: options.body || JSON.stringify(payload) }),
  headers: {
    "content-type": "application/json",
    "x-telegram-bot-api-secret-token": config.TELEGRAM_WEBHOOK_SECRET_TOKEN,
    ...options.headers
  }
});

test("secret matching is exact, not prefix, case-insensitive, or missing", () => {
  assert.equal(secretMatches("abc", "abc"), true);
  for (const value of ["ABC", "abc1", "ab", "", null, undefined]) {
    assert.equal(secretMatches(value, "abc"), false);
  }
  assert.equal(secretMatches("abc", ""), false);
});

test("only a configured owner and Telegram webhook secret can enter Think", async () => {
  let gate = await telegramIngressGate(request(), config);
  assert.equal(gate.accepted, true);
  assert.equal(gate.actor.userId, "123456789");

  gate = await telegramIngressGate(request(), { ...config, JARVIS_OWNER_TELEGRAM_ID: "" });
  assert.equal(gate.accepted, false);
  assert.equal(gate.response.status, 503);

  gate = await telegramIngressGate(request(), { ...config, TELEGRAM_WEBHOOK_SECRET_TOKEN: "" });
  assert.equal(gate.response.status, 503);

  for (const token of ["x", "", "wrong", "long-audited-random-secret-suffix"]) {
    gate = await telegramIngressGate(request(valid, { headers: { "x-telegram-bot-api-secret-token": token } }), config);
    assert.equal(gate.accepted, false);
    assert.equal(gate.response.status, 403);
  }
});

test("Telegram group, wrong actor, bot, forwarded mismatch and unknown updates cannot access model", async () => {
  const modifications = [
    { message: { ...valid.message, from: { id: 44 }, chat: { id: 44, type: "private" } } },
    { message: { ...valid.message, chat: { id: -9000, type: "supergroup" } } },
    { message: { ...valid.message, chat: { id: 333, type: "private" } } },
    { message: { ...valid.message, from: { ...valid.message.from, is_bot: true } } },
    { message: { ...valid.message, from: { id: "123456789" } } },
    { edited_message: valid.message },
    { callback_query: { from: { id: 123456789 }, inline_message_id: "zzz" } }
  ];
  for (const patch of modifications) {
    const gate = await telegramIngressGate(request({ update_id: 999, ...patch }), config);
    assert.equal(gate.accepted, false, JSON.stringify(patch));
    assert.equal(gate.response.status, 200);
  }
  assert.equal(verifiedTelegramActor({ update_id: 1, callback_query: { from: { id: 123456789 }, message: { chat: { id: 123456789, type: "private" } } } }).userId, "123456789");
});

test("reject malicious or invalid request before LLM work", async () => {
  for (const c of [
    { req: request(valid, { method: "GET" }), status: 405 },
    { req: request(valid, { headers: { "content-type": "text/plain" } }), status: 415 },
    { req: request(valid, { body: "{bad-json" }), status: 400 },
    { req: request(valid, { body: " ".repeat(70000) }), status: 413 },
    { req: request(valid, { headers: { "content-length": "99999999" } }), status: 413 },
  ]) {
    const gate = await telegramIngressGate(c.req, config);
    assert.equal(gate.accepted, false);
    assert.equal(gate.response.status, c.status);
  }
});
