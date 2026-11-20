import { BrowserRouter, Routes, Route, Link } from "react-router";
import { lazy, Suspense } from "react";
const MapView = lazy(() => import("./pages/MapView"));

const Explorer = lazy(() => import("./pages/Explorer"));
const KitchenSink = lazy(() => import("./pages/KitchenSink"));

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* Site Header */}
      <header className="site-header">
        <div className="container">
          <nav>
            <Link to="/">Financial Explorer</Link>
            <Link to="/kitchen-sink">Kitchen Sink</Link>
            <Link to="/map-view">Map View</Link>
          </nav>
        </div>
      </header>

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
