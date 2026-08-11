export function SiteHeader() {
  return (
    <header className="site-header" id="top">
      <div className="site-header__inner">
        <a className="site-brand" href="#top" aria-label="AI Ecosystem Atlas home">
          <span className="site-brand__mark" aria-hidden="true">
            AE
          </span>
          <span>AI Ecosystem Atlas</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#methodology">Methodology</a>
          <a href="#sources">Sources</a>
          <a
            href="https://github.com/aserdargun/ai-ecosystem-atlas"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
