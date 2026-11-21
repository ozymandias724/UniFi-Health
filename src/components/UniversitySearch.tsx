/*
 * Shared university search for Explorer and Map View.
 * Fuse.js searches name, city, and state, returning up to ten result buttons.
 * The input and dropdown state stay local; onSelect passes the chosen record
 * to the page, which decides whether to fetch finances or navigate the map.
 *
 * Editing the input clears this component's selected result, but does not
 * notify the parent until another result is chosen. Escape closes the list,
 * and pointer/blur handling allows a result click to complete before closing.
 * Potential follow-ups include a no-results message, arrow-key navigation,
 * debouncing, and prebuilding the Fuse index.
 *
 * Fuse.js reference: https://www.fusejs.io/articles/using-fuse-with-react.html
*/
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { University } from "../services/ipeds";

interface UniversitySearchProps {
  universities: University[];
  onSelect: (university: University) => void;
}

function UniversitySearch({ universities, onSelect }: UniversitySearchProps) {
  const [search, setSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pointerDownInside = useRef(false);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      pointerDownInside.current =
        event.target instanceof Node &&
        (searchRef.current?.contains(event.target) ?? false);
      if (!pointerDownInside.current) {
        setIsOpen(false);
      }
    }

    function handlePointerEnd() {
      pointerDownInside.current = false;
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerEnd);
    document.addEventListener("pointercancel", handlePointerEnd);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerEnd);
      document.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(universities, {
        keys: [
          { name: "inst_name", weight: 0.8 },
          { name: "city", weight: 0.15 },
          { name: "state_abbr", weight: 0.05 },
        ],
        threshold: 0.3,
        ignoreLocation: true,
        useTokenSearch: true,
        tokenMatch: "all",
      }),
    [universities],
  );

  const results = search.trim()
    ? fuse.search(search.trim(), { limit: 10 }).map((result) => result.item)
    : [];

  return (
    <section className="university-search">
      <div
        ref={searchRef}
        className="container university-search-control"
        onBlur={(event) => {
          // A clicked result may blur the input without receiving focus.
          if (
            !event.currentTarget.contains(event.relatedTarget) &&
            !pointerDownInside.current
          ) {
            setIsOpen(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && isOpen) {
            event.preventDefault();
            inputRef.current?.focus();
            setIsOpen(false);
          }
        }}
      >
        <input
          ref={inputRef}
          id="university-search-input"
          type="search"
          aria-label="Search universities"
          placeholder="Search universities..."
          value={search}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value);
            setSelectedUniversity(null);
            setIsOpen(true);
          }}
        />

        {isOpen && search.trim() && !selectedUniversity && (
          <ul>
            {results.map((university) => (
              <li key={university.unitid}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUniversity(university);
                    setSearch(university.inst_name);
                    setIsOpen(false);
                    onSelect(university);
                  }}
                >
                  {university.inst_name} — {university.city},{" "}
                  {university.state_abbr}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default UniversitySearch;
