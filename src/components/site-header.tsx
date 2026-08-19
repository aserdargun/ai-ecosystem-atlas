export function SiteHeader() {
  return (
    <header className="site-header" id="top">
      <div className="site-header__inner">
        <a className="site-brand" href="#top" aria-label="AI Ecosystem Atlas home">
          <span className="site-brand__mark" aria-hidden="true">
            +
          </span>
          <span className="site-brand__copy">
            <strong>AI Ecosystem Atlas</strong>
            <small>Research Console</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a
            href="https://github.com/aserdargun/ai-ecosystem-atlas"
            target="_blank"
            rel="noreferrer"
          >
            <span className="github-link__prefix">View on </span>GitHub ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
