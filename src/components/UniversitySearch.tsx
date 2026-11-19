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
import { useMemo, useState } from "react";
import type { University } from "../services/ipeds";

interface UniversitySearchProps {
  universities: University[];
  onSelect: (university: University) => void;
}

function UniversitySearch({ universities, onSelect }: UniversitySearchProps) {
  const [search, setSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);

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
      }),
    [universities],
  );

  const results = search.trim()
    ? fuse.search(search.trim(), { limit: 10 }).map((result) => result.item)
    : [];

  return (
    <div className="container">
      <input
        id="university-search"
        type="search"
        placeholder="Search universities..."
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setSelectedUniversity(null);
        }}
      />

      {search.trim() && !selectedUniversity && (
        <ul>
          {results.map((university) => (
            <li key={university.unitid}>
              <button
                type="button"
                onClick={() => {
                  setSelectedUniversity(university);
                  setSearch(university.inst_name);
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
  );
}

export default UniversitySearch;
