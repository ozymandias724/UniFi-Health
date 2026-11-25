/*
 * Application shell: keep the header and footer shared across routes while
 * loading each page on demand. BASE_URL keeps routes aligned with Vite's
 * deployment base when the app is hosted under a subpath.
 */
import { BrowserRouter, Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import Header from "./components/Header";

const MapView = lazy(() => import("./pages/MapView"));
const Explorer = lazy(() => import("./pages/Explorer"));
const KitchenSink = lazy(() => import("./pages/KitchenSink"));

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Header />

      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Explorer />} />
          <Route path="/kitchen-sink" element={<KitchenSink />} />
          <Route path="/map-view" element={<MapView />} />
        </Routes>
      </Suspense>

      <footer className="site-footer">
        <div className="container">
          <p>Site Footer</p>
        </div>
      </footer>
    </BrowserRouter>
  );
}

export default App;
