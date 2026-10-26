import { GLOSSARY } from './glossary';

interface SearchProps {
  query: string;
  onQuery: (q: string) => void;
  onClose: () => void;
}

/** Search row rendered inside the sticky top bar while the glossary is open. */
export function GlossarySearch({ query, onQuery, onClose }: SearchProps) {
  return (
    <div className="glossary-head">
      <input
        type="search"
        className="search"
        placeholder="Search (MOA, BC, zero…)"
        aria-label="Search glossary"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      <button type="button" onClick={onClose}>
        Done
      </button>
    </div>
  );
}

export function Glossary({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
  const sections = GLOSSARY.map((s) => ({
    ...s,
    entries: s.entries.filter(
      (e) => !q || `${e.term} ${e.aka ?? ''} ${e.definition}`.toLowerCase().includes(q),
    ),
  })).filter((s) => s.entries.length);

  return (
    <div className="stack">
      {sections.length === 0 && <p className="hint">No matches for “{query}”.</p>}
      {sections.map((s) => (
        <section key={s.title} className="card">
          <h3>{s.title}</h3>
          <dl className="glossary">
            {s.entries.map((e) => (
              <div key={e.term}>
                <dt>
                  {e.term}
                  {e.aka && <span className="muted"> · {e.aka}</span>}
                </dt>
                <dd>{e.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
