/*
 * Shared header and responsive navigation. A native modal dialog provides the
 * menu on every screen size; CSS makes it full-screen on mobile and a drawer
 * on desktop. Navigation, Escape, the close button, and backdrop clicks close
 * it. While open, page scrolling is locked and restored on cleanup.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

function Header() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const explorerLink = {
    pathname: "/",
    search: location.search,
  };

  const mapLink = {
    pathname: "/map-view",
    search: location.search,
  };

  // Also close the menu when browser history changes the current route.
  useEffect(() => {
    dialogRef.current?.close();
  }, [location]);

  useEffect(() => {
    if (!isOpen) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  function openMenu() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setIsOpen(true);
  }

  function closeMenu() {
    dialogRef.current?.close();
  }

  return (
    <header className="site-header">
      <div className="container">
        <Link className="site-brand" to={explorerLink}>
          Financial Explorer
        </Link>
        <button
          className="nav-icon-button"
          type="button"
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
          aria-controls="site-navigation"
          aria-expanded={isOpen}
          onClick={openMenu}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        id="site-navigation"
        className="site-nav-dialog"
        aria-label="Navigation menu"
        onClose={() => setIsOpen(dialogRef.current?.open ?? false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeMenu();
          }
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          ) {
            closeMenu();
          }
        }}
      >
        <button
          className="nav-icon-button site-nav-close"
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          autoFocus
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <nav aria-label="Main navigation">
          <Link to={explorerLink} onClick={closeMenu}>
            Financial Explorer
          </Link>
          <Link to="/kitchen-sink" onClick={closeMenu}>
            Kitchen Sink
          </Link>
          <Link to={mapLink} onClick={closeMenu}>
            Map View
          </Link>
        </nav>
      </dialog>
    </header>
  );
}

export default Header;
