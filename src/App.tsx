/*
 * Application shell: keep the header and footer shared across routes while
 * loading each page on demand. BASE_URL keeps routes aligned with Vite's
 * deployment base when the app is hosted under a subpath.
 */
import { BrowserRouter, Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import Header from "./components/Header";
import { ComparisonProvider } from "./context/ComparisonProvider";

const MapView = lazy(() => import("./pages/MapView"));
const Explorer = lazy(() => import("./pages/Explorer"));
const KitchenSink = lazy(() => import("./pages/KitchenSink"));
const Compare = lazy(() => import("./pages/Compare"));

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ComparisonProvider>
        <Header />

        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Explorer />} />
            <Route path="/kitchen-sink" element={<KitchenSink />} />
            <Route path="/map-view" element={<MapView />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </Suspense>

        <footer className="site-footer">
          <div className="container">
            <p>Site Footer</p>
          </div>
        </footer>
      </ComparisonProvider>
    </BrowserRouter>
  );
}

export default App;