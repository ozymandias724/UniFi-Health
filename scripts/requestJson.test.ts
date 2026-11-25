import assert from "node:assert/strict";
import { test } from "node:test";

import { requestJson } from "./utils/requestJson.ts";

const URL = "https://example.com/api";

test("returns parsed JSON and counts requests", async (t) => {
  const data = { results: [1, 2, 3] };
  let attempts = 0;

  const fetch = t.mock.method(globalThis, "fetch", async () =>
    Response.json(data),
  );

  const result = await requestJson(URL, {
    onAttempt: () => {
      attempts++;
    },
  });

  assert.deepEqual(result, data);
  assert.equal(attempts, 1);
  assert.equal(fetch.mock.callCount(), 1);
});

test("retries transient HTTP errors", async (t) => {
  let attempts = 0;

  t.mock.method(globalThis, "fetch", async () => {
    attempts++;

    if (attempts === 1) {
      return new Response(null, { status: 429 });
    }

    if (attempts === 2) {
      return new Response(null, { status: 503 });
    }

    return Response.json({ success: true });
  });

  const result = await requestJson(URL, {
    retryDelayMs: 0,
  });

  assert.deepEqual(result, { success: true });
  assert.equal(attempts, 3);
});

test("retries network failures", async (t) => {
  let attempts = 0;

  t.mock.method(globalThis, "fetch", async () => {
    attempts++;

    if (attempts === 1) {
      throw new TypeError("Network failure");
    }

    return Response.json({ success: true });
  });

  const result = await requestJson(URL, {
    retryDelayMs: 0,
  });

  assert.deepEqual(result, { success: true });
  assert.equal(attempts, 2);
});

test("does not retry permanent HTTP errors", async (t) => {
  const fetch = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 404 }),
  );

  await assert.rejects(requestJson(URL, { retryDelayMs: 0 }), /API error: 404/);

  assert.equal(fetch.mock.callCount(), 1);
});

test("does not retry malformed JSON", async (t) => {
  const fetch = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("invalid json", { status: 200 }),
  );

  await assert.rejects(
    requestJson(URL, { retryDelayMs: 0 }),
    /returned invalid JSON/,
  );

  assert.equal(fetch.mock.callCount(), 1);
});

test("stops after the maximum number of attempts", async (t) => {
  const fetch = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 503 }),
  );

  await assert.rejects(
    requestJson(URL, {
      maxAttempts: 3,
      retryDelayMs: 0,
    }),
    /API error: 503/,
  );

  assert.equal(fetch.mock.callCount(), 3);
});

test("rejects invalid retry configuration", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () =>
    Response.json({}),
  );

  await assert.rejects(
    requestJson(URL, { maxAttempts: 0 }),
    /maxAttempts must be a positive integer/,
  );

  assert.equal(fetch.mock.callCount(), 0);
});
