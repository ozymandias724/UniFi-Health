import { DEFAULT_YEAR } from "../../src/config/reportingYears.ts";

export function parseReportingYear(
  args: string[] = process.argv.slice(2),
): number {
  const index = args.indexOf("--year");

  if (index === -1) {
    return DEFAULT_YEAR;
  }

  const year = Number(args[index + 1]);

  if (
    !Number.isInteger(year) ||
    year < 1900 ||
    year > new Date().getFullYear()
  ) {
    throw new Error("Invalid reporting year. Use --year YYYY.");
  }

  return year;
}
