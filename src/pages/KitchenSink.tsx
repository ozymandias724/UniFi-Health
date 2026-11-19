function KitchenSink() {
  return (
    <main className="main">
      <section>
        <div className="container">
          <h1>Kitchen Sink</h1>
          <p>A reference page for UI elements and styles.</p>
        </div>
      </section>

      <section>
        <div className="container">
          <h2>Buttons</h2>

          <div className="button-examples">
            <button className="btn">Default</button>
            <button data-variant="secondary" className="btn">
              Secondary
            </button>
            <button data-variant="ghost" className="btn">
              Ghost
            </button>
            <button data-variant="danger" className="btn">
              Danger
            </button>
            <button className="btn" disabled>
              Disabled
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default KitchenSink;
