interface RequestJsonOptions {
  label?: string;
  maxAttempts?: number;
  timeoutMs?: number;
  retryDelayMs?: number;
  onAttempt?: () => void;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.urban.org/",
};

export async function requestJson(
  url: string | URL,
  {
    label = "Urban Institute API",
    maxAttempts = 3,
    timeoutMs = 60_000,
    retryDelayMs = 500,
    onAttempt,
  }: RequestJsonOptions = {},
): Promise<unknown> {
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error("maxAttempts must be a positive integer.");
  }

  async function retry(attempt: number, reason: string): Promise<void> {
    console.warn(
      `${label} ${reason}; retrying (attempt ${attempt + 1}/${maxAttempts}).`,
    );

    await new Promise((resolve) =>
      setTimeout(resolve, retryDelayMs * 2 ** (attempt - 1)),
    );
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    onAttempt?.();

    let response: Response;

    try {
      response = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(`${label} request failed after ${attempt} attempts`, {
          cause: error,
        });
      }

      await retry(attempt, "request failed");
      continue;
    }

    if (response.ok) {
      try {
        return await response.json();
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error(`${label} returned invalid JSON.`, {
            cause: error,
          });
        }

        if (attempt === maxAttempts) {
          throw new Error(
            `${label} response failed after ${attempt} attempts`,
            { cause: error },
          );
        }

        await retry(attempt, "response failed");
        continue;
      }
    }

    if (
      (response.status === 429 || response.status >= 500) &&
      attempt < maxAttempts
    ) {
      await retry(attempt, `returned ${response.status}`);
      continue;
    }

    throw new Error(
      `${label} error: ${response.status} ${response.statusText}`,
    );
  }

  throw new Error(`${label} request exhausted its retries.`);
}
