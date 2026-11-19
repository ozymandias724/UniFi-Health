import "./App.css";
import {
  getUniversities,
  getUniversityFinances,
  getVariables,
  type FinanceRecord,
  type VariableMetadata,
  type University,
} from "./services/ipeds";
import UniversitySearch from "./components/UniversitySearch";
import UniversityFinances from "./components/UniversityFinances";
import FinancialOverview from "./components/financial-overview/FinancialOverview";
import { useEffect, useState } from "react";

function App() {
  // University directory
  const [universities, setUniversities] = useState<University[]>([]);

  // Selected university
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);

  const [finances, setFinances] = useState<FinanceRecord | null>(null);

  const [variables, setVariables] = useState<Record<string, VariableMetadata>>(
    {},
  );

  // Load university directory
  useEffect(() => {
    getUniversities().then(setUniversities).catch(console.error);
  }, []);

  // Load financial data for the selected university
  useEffect(() => {
    if (!selectedUniversity) {
      setFinances(null);
      return;
    }

    setFinances(null);

    //
    getUniversityFinances(selectedUniversity.unitid, 2023)
      .then(setFinances)
      .catch(console.error);
  }, [selectedUniversity]);

  // Load variable metadata
  useEffect(() => {
    getVariables().then(setVariables).catch(console.error);
  }, []);

  return (
    <>
      <header className="site-header">
        <div>
          <p>Site Header</p>
        </div>
      </header>

      <main className="main">

        <section className="intro">
          <div className="container">
            <h1>University Financial Explorer</h1>
          </div>
        </section>
        
        <section className="university-search">
            <UniversitySearch
              universities={universities}
              onSelect={setSelectedUniversity}
            />
          <p>Loaded {universities.length} universities.</p>


          {selectedUniversity && (
            <div>
              <h2>{selectedUniversity.inst_name}</h2>
              <p>
                {selectedUniversity.city}, {selectedUniversity.state_abbr}
              </p>
              <p>IPEDS ID: {selectedUniversity.unitid}</p>
            </div>
          )}

          {/* Display financial data for the selected university */}
          {finances && (
            <>
              <FinancialOverview finances={finances} variables={variables} />
              <UniversityFinances finances={finances} variables={variables} />
            </>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <p>Site Footer</p>
        </div>
      </footer>
    </>
  );
}

export default App;
