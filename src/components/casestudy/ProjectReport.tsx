import { ArchitectureFigure } from "@/components/sams/ArchitectureFigure";
import { LabLink } from "@/components/shell/LabLink";
import type { ProjectReport as Report, ReportBlock } from "@/content/reports";

function Block({ block }: { block: ReportBlock }) {
  switch (block.kind) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "code":
      return <pre className="report-code" tabIndex={0}><code>{block.text}</code></pre>;
    case "table":
      return (
        <div className="report-table" role="region" aria-label={block.caption} tabIndex={0}>
          <p className="report-table-hint">Swipe or scroll to see every column.</p>
          <table>
            <caption>{block.caption}</caption>
            <thead><tr>{block.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
            <tbody>{block.rows.map((row) => (
              <tr key={row[0]}>{row.map((cell, index) => index === 0
                ? <th scope="row" key={index}>{cell}</th>
                : <td key={index}>{cell}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      );
    case "figure":
      return (
        <figure className="report-figure">
          {/* A static exported SVG; the full numerical alternative is in the preceding table. */}
          <img src={block.src} alt={block.alt} width={640} height={400} loading="lazy" />
          <figcaption>{block.caption}</figcaption>
        </figure>
      );
    case "architecture":
      return <div className="cs-figure"><ArchitectureFigure fig="1" /></div>;
    case "links":
      return <ul className="report-downloads">{block.links.map((link) => <li key={link.href}><a href={link.href} download={link.download || undefined}>{link.label}</a></li>)}</ul>;
  }
}

/** Static editorial content, using the project's existing shell and design tokens. */
export function ProjectReport({ report }: { report: Report }) {
  return (
    <article className={`case-study case-study--${report.accent} project-report`}>
      <header className="cs-header">
        <p className="cs-header__kicker mono"><span>Case study · {report.name}</span><span>Project notes</span></p>
        <h1 className="cs-header__title">{report.name}<span className="cs-header__full">{report.title}</span></h1>
        <p className="cs-header__one">{report.intro}</p>
        <p className="report-checked">Evidence checked {report.checked}</p>
        <div className="report-actions">
          <a className={`btn btn--sm${report.accent === "research" ? " btn--research" : ""}`} href={report.repository.href}>{report.repository.label} ↗</a>
          <LabLink className="btn btn--ghost btn--sm" href={report.labHref}>Open interactive lab</LabLink>
        </div>
      </header>

      <section className="glance report-glance" aria-labelledby="report-glance-title">
        <h2 id="report-glance-title" className="glance__title">At a glance</h2>
        <dl className="glance__grid">
          <div className="glance__cell"><dt>My role</dt><dd>{report.role}</dd></div>
          <div className="glance__cell"><dt>Project</dt><dd>{report.project}</dd></div>
          <div className="glance__cell"><dt>Status</dt><dd>{report.status}</dd></div>
        </dl>
      </section>

      <div className="cs-layout">
        <nav className="cs-toc" aria-label="Case study sections">
          <details className="cs-toc__details" open>
            <summary>Contents</summary>
            <ol>{report.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
          </details>
        </nav>
        <div className="cs-body">
          {report.sections.map((section, index) => (
            <section className="cs-section" id={section.id} aria-labelledby={`${section.id}-title`} key={section.id}>
              <h2 id={`${section.id}-title`}><span className="cs-section__n mono" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{section.title}</h2>
              {section.blocks.map((block, blockIndex) => <Block block={block} key={`${section.id}-${blockIndex}`} />)}
              {section.sources ? <p className="report-sources">Sources: {section.sources.map((source, sourceIndex) => (
                <span key={source.href}>{sourceIndex > 0 ? " · " : ""}<a href={source.href}>{source.label} ↗</a></span>
              ))}</p> : null}
            </section>
          ))}
          <footer className="cs-end">
            <LabLink className="btn" href={report.name === "FinanceIQ" ? "/sams/case-study/" : "/financeiq/case-study/"}>Read the other case study</LabLink>
            <LabLink className="btn btn--ghost" href="/case-studies/">All case studies</LabLink>
          </footer>
        </div>
      </div>
    </article>
  );
}
