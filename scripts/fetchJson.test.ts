import assert from "node:assert/strict";
import { test } from "node:test";

import { fetchJson } from "../src/utils/fetchJson.ts";

const URL = "https://example.com/data.json";

test("returns parsed JSON", async (t) => {
  const data = { unitid: 123 };

  t.mock.method(globalThis, "fetch", async () => Response.json(data));

  assert.deepEqual(await fetchJson(URL, "Test"), data);
});

test("throws descriptive HTTP errors", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 404 }),
  );

  await assert.rejects(
    fetchJson(URL, "Failed to load directory"),
    /Failed to load directory: 404/,
  );
});

test("forwards the abort signal", async (t) => {
  const controller = new AbortController();

  const fetch = t.mock.method(globalThis, "fetch", async () =>
    Response.json({}),
  );

  await fetchJson(URL, "Test", controller.signal);

  assert.deepEqual(fetch.mock.calls[0].arguments, [
    URL,
    { signal: controller.signal },
  ]);
});

test("rejects malformed JSON", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("invalid json"));

  await assert.rejects(fetchJson(URL, "Test"), SyntaxError);
});
