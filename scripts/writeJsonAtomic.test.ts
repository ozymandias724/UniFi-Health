import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, readdir, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { writeJsonAtomic } from "./utils/writeJsonAtomic.ts";

test("creates directories and writes compact JSON", async () => {
  const root = await mkdtemp(join(tmpdir(), "atomic-json-"));

  try {
    const path = join(root, "nested", "data.json");
    const data = { name: "University", revenue: 100 };
    const expected = JSON.stringify(data);

    const bytes = await writeJsonAtomic(path, data);

    assert.equal(await readFile(path, "utf8"), expected);
    assert.equal(bytes, Buffer.byteLength(expected));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("replaces existing JSON and supports indentation", async () => {
  const root = await mkdtemp(join(tmpdir(), "atomic-json-"));

  try {
    const path = join(root, "data.json");

    await writeJsonAtomic(path, { original: true });

    const data = { updated: true };
    await writeJsonAtomic(path, data, 2);

    assert.equal(await readFile(path, "utf8"), JSON.stringify(data, null, 2));

    assert.deepEqual(await readdir(root), ["data.json"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("preserves existing files when serialization fails", async () => {
  const root = await mkdtemp(join(tmpdir(), "atomic-json-"));

  try {
    const path = join(root, "data.json");
    const original = { original: true };

    await writeJsonAtomic(path, original);

    await assert.rejects(
      writeJsonAtomic(path, undefined),
      /Cannot serialize data to JSON/,
    );

    assert.equal(await readFile(path, "utf8"), JSON.stringify(original));

    assert.deepEqual(await readdir(root), ["data.json"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("removes temporary files when renaming fails", async () => {
  const root = await mkdtemp(join(tmpdir(), "atomic-json-"));

  try {
    const path = join(root, "data.json");

    // A directory cannot be replaced by renaming a regular file.
    await mkdir(path);

    await assert.rejects(writeJsonAtomic(path, { value: 100 }));

    assert.deepEqual(await readdir(root), ["data.json"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
