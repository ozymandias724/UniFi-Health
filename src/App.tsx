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

      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Explorer />
            </Suspense>
          }
        />
        <Route
          path="/kitchen-sink"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <KitchenSink />
            </Suspense>
          }
        />
        <Route
          path="/map-view"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <MapView />
            </Suspense>
          }
        />
      </Routes>

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="container">
          <p>Site Footer</p>
        </div>
      </footer>
    </BrowserRouter>
  );
}

export default App;
