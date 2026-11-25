function decodeMetadataText(text: string): string {
  return text
    .replace(/&mdash;|&#8212;/g, "—")
    .replace(/&ndash;|&#8211;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

// Metadata values use Python-dict-like syntax, not JSON.
// Read numeric keys and quoted labels without evaluating code.
export function getCodeLabel(
  values: string | undefined,
  value: number,
): string | undefined {
  if (!values) return undefined;

  const pattern = /(-?\d+)\s*:\s*'((?:\\'|[^'])*)'/g;

  for (const match of values.matchAll(pattern)) {
    if (Number(match[1]) === value) {
      return decodeMetadataText(match[2].replace(/\\'/g, "'"))
        .replace(/^\s*-?\d+\s*-\s*/, "")
        .trim();
    }
  }

  return undefined;
}
