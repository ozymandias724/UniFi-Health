import { randomUUID } from "node:crypto";
import { mkdir, open, rename, unlink } from "node:fs/promises";
import { dirname } from "node:path";

export async function writeJsonAtomic(
  outputPath: string,
  data: unknown,
  space?: number,
): Promise<number> {
  const json = JSON.stringify(data, null, space);

  if (json === undefined) {
    throw new Error("Cannot serialize data to JSON.");
  }

  await mkdir(dirname(outputPath), { recursive: true });

  const temporaryPath = `${outputPath}.${randomUUID()}.tmp`;
  const file = await open(temporaryPath, "wx");

  let renamed = false;

  try {
    await file.writeFile(json, "utf8");
    await file.close();
    await rename(temporaryPath, outputPath);
    renamed = true;
  } finally {
    await file.close();

    if (!renamed) {
      await unlink(temporaryPath);
    }
  }

  return Buffer.byteLength(json);
}
