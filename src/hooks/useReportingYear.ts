import { useSearchParams } from "react-router";
import { DEFAULT_YEAR, SUPPORTED_YEARS } from "../config/reportingYears";

export function useReportingYear() {
  const [searchParams, setSearchParams] = useSearchParams();

  const yearParam = Number(searchParams.get("year"));

  const year =
    SUPPORTED_YEARS.find((supportedYear) => supportedYear === yearParam) ??
    DEFAULT_YEAR;

  function setYear(year: number) {
    if (!SUPPORTED_YEARS.some((supportedYear) => supportedYear === year)) {
      return;
    }

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("year", String(year));
      return next;
    });
  }

  return { year, setYear };
}
