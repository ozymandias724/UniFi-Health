/* 
  Developer Notes:
  ? Functionality:
  - Implements a search input for universities with fuzzy search using Fuse.js
  - Displays search results as a list of buttons
  - Calls onSelect callback when a university is selected
  - Clears selection when search input changes
  - Limits search results to 10 items

  ? Still Needs:
  - Styling for the search input and results list
  - Handling no results found
  - Accessibility improvements (e.g., keyboard navigation)
  - Debouncing the search input to reduce unnecessary searches
  - Pre-build the Fuse.js index for faster searches

  ? Resources:
  - https://www.fusejs.io/articles/using-fuse-with-react.html
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
