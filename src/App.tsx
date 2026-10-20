import { FormEvent, useState } from "react";

type Country = {
  names?: { common?: string; official?: string; alternates?: string[] };
  codes?: { alpha_2?: string; alpha_3?: string };
  flag?: { emoji?: string; url_svg?: string };
  region?: string;
  subregion?: string;
  capitals?: Array<{ name?: string; primary?: boolean; attributes?: { primary?: boolean } }>;
  population?: number;
  area?: { kilometers?: number };
  currencies?: { code?: string; name?: string; symbol?: string } | Array<{ code?: string; name?: string; symbol?: string }>;
  languages?: { name?: string } | Array<{ name?: string }>;
  timezones?: string[] | string;
  borders?: string[] | string;
  calling_codes?: string[] | string;
  tlds?: string[];
};

const exampleCountries = ["Japan", "India", "Singapore", "Thailand"];
const asianCountries = [
  { name: "Azerbaijan", code: "AZ", emoji: "🇦🇿" },
  { name: "Armenia", code: "AM", emoji: "🇦🇲" },
  { name: "Afghanistan", code: "AF", emoji: "🇦🇫" },
  { name: "Georgia", code: "GE", emoji: "🇬🇪" },
  { name: "Bangladesh", code: "BD", emoji: "🇧🇩" },
  { name: "Bahrain", code: "BH", emoji: "🇧🇭" },
  { name: "Brunei", code: "BN", emoji: "🇧🇳" },
  { name: "Bhutan", code: "BT", emoji: "🇧🇹" },
  { name: "Timor-Leste", code: "TL", emoji: "🇹🇱" },
  { name: "Vietnam", code: "VN", emoji: "🇻🇳" },
  { name: "Hong Kong", code: "HK", emoji: "🇭🇰" },
  { name: "India", code: "IN", emoji: "🇮🇳" },
  { name: "Indonesia", code: "ID", emoji: "🇮🇩" },
  { name: "Jordan", code: "JO", emoji: "🇯🇴" },
  { name: "Iraq", code: "IQ", emoji: "🇮🇶" },
  { name: "Iran", code: "IR", emoji: "🇮🇷" },
  { name: "Yemen", code: "YE", emoji: "🇾🇪" },
  { name: "Kazakhstan", code: "KZ", emoji: "🇰🇿" },
  { name: "Kyrgyzstan", code: "KG", emoji: "🇰🇬" },
  { name: "Cambodia", code: "KH", emoji: "🇰🇭" },
  { name: "Cyprus", code: "CY", emoji: "🇨🇾" },
  { name: "Laos", code: "LA", emoji: "🇱🇦" },
  { name: "Kuwait", code: "KW", emoji: "🇰🇼" },
  { name: "Lebanon", code: "LB", emoji: "🇱🇧" },
  { name: "Malaysia", code: "MY", emoji: "🇲🇾" },
  { name: "Maldives", code: "MV", emoji: "🇲🇻" },
  { name: "Mongolia", code: "MN", emoji: "🇲🇳" },
  { name: "Myanmar", code: "MM", emoji: "🇲🇲" },
  { name: "Nepal", code: "NP", emoji: "🇳🇵" },
  { name: "United Arab Emirates", code: "AE", emoji: "🇦🇪" },
  { name: "Oman", code: "OM", emoji: "🇴🇲" },
  { name: "Pakistan", code: "PK", emoji: "🇵🇰" },
  { name: "South Korea", code: "KR", emoji: "🇰🇷" },
  { name: "Russia", code: "RU", emoji: "🇷🇺" },
  { name: "Saudi Arabia", code: "SA", emoji: "🇸🇦" },
  { name: "Singapore", code: "SG", emoji: "🇸🇬" },
  { name: "Syria", code: "SY", emoji: "🇸🇾" },
  { name: "Tajikistan", code: "TJ", emoji: "🇹🇯" },
  { name: "Turkmenistan", code: "TM", emoji: "🇹🇲" },
  { name: "Thailand", code: "TH", emoji: "🇹🇭" },
  { name: "Taiwan", code: "TW", emoji: "🇹🇼" },
  { name: "Turkey", code: "TR", emoji: "🇹🇷" },
  { name: "Uzbekistan", code: "UZ", emoji: "🇺🇿" },
  { name: "Philippines", code: "PH", emoji: "🇵🇭" },
  { name: "Sri Lanka", code: "LK", emoji: "🇱🇰" },
  { name: "Japan", code: "JP", emoji: "🇯🇵" },
  { name: "China", code: "CN", emoji: "🇨🇳" },
  { name: "Qatar", code: "QA", emoji: "🇶🇦" },
  { name: "Israel", code: "IL", emoji: "🇮🇱" },
  { name: "Palestine", code: "PS", emoji: "🇵🇸" },
  { name: "Egypt", code: "EG", emoji: "🇪🇬" },
];

function asArray<T>(value?: T | T[]): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function formatNumber(value?: number) {
  return typeof value === "number" ? new Intl.NumberFormat("en-US").format(value) : "—";
}

function listValues(values?: { name?: string; code?: string } | Array<{ name?: string; code?: string }>) {
  return asArray(values).map((value) => value.name || value.code).filter(Boolean).join(", ") || "—";
}

function getCapital(country: Country) {
  return (
    country.capitals?.find((capital) => capital.primary || capital.attributes?.primary)?.name ??
    country.capitals?.[0]?.name ??
    "—"
  );
}

function normalizeSearchTerm(value: string) {
  return value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function prioritizeExactMatch(countries: Country[], query: string) {
  const normalizedQuery = normalizeSearchTerm(query);
  return [...countries].sort((left, right) => {
    function score(country: Country) {
      const names = [
        country.names?.common,
        country.names?.official,
        ...(country.names?.alternates ?? []),
        country.codes?.alpha_2,
        country.codes?.alpha_3,
      ];
      return names.some((name) => name && normalizeSearchTerm(name) === normalizedQuery) ? 0 : 1;
    }

    return score(left) - score(right);
  });
}

function App() {
  const [query, setQuery] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function searchCountry(searchTerm: string) {
    const trimmedQuery = searchTerm.trim();
    if (!trimmedQuery) {
      setError("Type a country name to start exploring.");
      return;
    }

    setQuery(trimmedQuery);
    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const response = await fetch(`/api/countries?q=${encodeURIComponent(trimmedQuery)}`);
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" && result !== null && "error" in result
            ? String(result.error)
            : "Something went wrong while searching. Please try again.";
        throw new Error(message);
      }

      if (typeof result !== "object" || result === null || !("data" in result)) {
        throw new Error("The country service returned an unexpected response.");
      }

      const data = result.data;
      if (typeof data !== "object" || data === null || !("objects" in data) || !Array.isArray(data.objects)) {
        throw new Error("The country service returned an unexpected response.");
      }

      const foundCountries = prioritizeExactMatch(data.objects as Country[], trimmedQuery);
      setCountries(foundCountries);
      setSelectedCountry(foundCountries[0] ?? null);
      if (foundCountries.length === 0) {
        setError(`No countries found for “${trimmedQuery}”. Try another name.`);
      }
    } catch (searchError) {
      setCountries([]);
      setSelectedCountry(null);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Something went wrong while searching. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void searchCountry(query);
  }

  const countryName = selectedCountry?.names?.common ?? "Country profile";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Atlas home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="15.5" stroke="currentColor" />
              <path d="M4.8 20h30.4M20 4.5c4.2 4.1 6.4 9.3 6.4 15.5s-2.2 11.4-6.4 15.5C15.8 31.4 13.6 26.2 13.6 20S15.8 8.6 20 4.5Z" stroke="currentColor" />
            </svg>
          </span>
          <span>atlas<span className="brand-period">.</span></span>
        </a>
        <div className="sidebar-rule" />
        <div className="sidebar-label">DISCOVER</div>
        <div className="nav-item nav-item-active">
          <span className="nav-icon" aria-hidden="true">◎</span>
          <span>Country explorer</span>
        </div>
        <div className="sidebar-bottom">
          <div className="status-dot" />
          <span>Connected to REST Countries</span>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <span className="breadcrumb">Explore <span>/</span> Countries</span>
          <div className="topbar-right">
            <span className="live-indicator"><i /> LIVE DATA</span>
            <span className="topbar-divider" />
            <span className="topbar-date">WORLDWIDE</span>
          </div>
        </header>

        <div className="page-content">
          <section className="intro">
            <div className="eyebrow"><span /> ATLAS FIELD GUIDE · 01</div>
            <h1>Every flag has<br /><em>a story.</em></h1>
            <p className="intro-copy">Search a country or choose a flag to explore its people, places, and details.</p>

            <form className="search-form" onSubmit={handleSubmit}>
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7" />
                <path d="m16 16 4.3 4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              <input
                aria-label="Country name"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try a country name..."
                autoComplete="off"
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? <span className="button-spinner" /> : <>Explore <span aria-hidden="true">↗</span></>}
              </button>
            </form>

            <div className="quick-searches">
              <span>QUICK SEARCH</span>
              {exampleCountries.map((country) => (
                <button key={country} type="button" onClick={() => void searchCountry(country)}>
                  {country}
                </button>
              ))}
            </div>
          </section>

          <div className="section-divider" />

          {!hasSearched && !loading ? (
            <section className="flag-showcase" aria-label="Explore Asian country flags">
              <div className="flag-wall">
                {asianCountries.map((country, index) => (
                  <div key={country.code} className="flag-wall-item">
                    {index === 14 && (
                      <div className="flag-feature">
                        <div className="feature-map" aria-hidden="true">
                          <svg viewBox="0 0 420 150" fill="none">
                            <path d="m35 58 17-16 37 4 17-11 23 10 14-7 25 8 17-8 18 12 18-4 21 13 32-5 19 11 36-3 22 12-14 13-26 1-11 13-21-5-12 12-18-4-17 12-19-7-17 9-20-12-12 2-14-10-16 3-19-13-16 5-24-14-19 3-18-13-20 2-17-12Z" fill="currentColor" />
                            <path d="m270 102 12 2 8 12-7 14-13-7-5-12 5-9ZM111 106l11 7-4 15-14 4-6-11 4-11 9-4Z" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="feature-content">
                          <span>THE ATLAS COLLECTION</span>
                          <h2>Flags of<br />Asian countries</h2>
                          <p>50 places · one remarkable world</p>
                          <b>CHOOSE A FLAG TO BEGIN <i>↗</i></b>
                        </div>
                        <div className="feature-index">FIELD GUIDE 01</div>
                      </div>
                    )}
                    <button
                      type="button"
                      className="flag-tile"
                      aria-label={`Explore ${country.name}`}
                      onClick={() => void searchCountry(country.name)}
                    >
                      <span className="tile-flag">
                        <span>{country.emoji}</span>
                        <img
                          src={`https://flags.restcountries.com/v5/w160/${country.code.toLowerCase()}.png`}
                          alt=""
                          loading="lazy"
                          onError={(event) => { event.currentTarget.style.display = "none"; }}
                        />
                      </span>
                      <span className="tile-name">{country.name}</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : loading ? (
            <section className="loading-panel" aria-live="polite">
              <span className="loading-spinner" />
              <span>Mapping your destination...</span>
            </section>
          ) : (
            <section className="results-section" aria-live="polite">
              <button
                type="button"
                className="back-to-flags"
                onClick={() => {
                  setHasSearched(false);
                  setError("");
                  setCountries([]);
                  setSelectedCountry(null);
                }}
              >
                ← BACK TO FLAGS
              </button>
              {error ? <div className="error-message">{error}</div> : null}
              {countries.length > 0 ? (
                <>
                  {countries.length > 1 && (
                    <div className="results-heading">
                      <div>
                        <div className="section-kicker">SEARCH RESULTS</div>
                        <h2>Places matching “{query}”</h2>
                      </div>
                      <span>{countries.length} FOUND</span>
                    </div>
                  )}
                  {countries.length > 1 && (
                    <div className="country-list">
                      {countries.map((country, index) => (
                        <button
                          className={`country-option${selectedCountry === country ? " country-option-active" : ""}`}
                          type="button"
                          key={`${country.codes?.alpha_3 ?? country.names?.common}-${index}`}
                          onClick={() => setSelectedCountry(country)}
                        >
                          <span className="option-flag">{country.flag?.emoji ?? "◎"}</span>
                          <span className="option-name">{country.names?.common ?? "Unknown country"}</span>
                          <span className="option-region">{country.region ?? ""}</span>
                          <span className="option-arrow">↗</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedCountry && (
                    <article className="country-card">
                      <div className="country-card-head">
                        <div>
                          <div className="section-kicker">COUNTRY PROFILE <span> / {selectedCountry.codes?.alpha_3 ?? "—"}</span></div>
                          <h2>{countryName}</h2>
                          <p className="official-name">{selectedCountry.names?.official ?? "Official name unavailable"}</p>
                        </div>
                        <div className="flag-display" aria-label={`${countryName} flag`}>
                          {selectedCountry.flag?.url_svg ? (
                            <img src={selectedCountry.flag.url_svg} alt="" />
                          ) : (
                            <span>{selectedCountry.flag?.emoji ?? "🌐"}</span>
                          )}
                        </div>
                      </div>
                      <div className="country-overview">
                        <div className="overview-item"><span>REGION</span><strong>{selectedCountry.region ?? "—"}</strong></div>
                        <div className="overview-item"><span>SUBREGION</span><strong>{selectedCountry.subregion ?? "—"}</strong></div>
                        <div className="overview-item"><span>CAPITAL</span><strong>{getCapital(selectedCountry)}</strong></div>
                        <div className="overview-item"><span>POPULATION</span><strong>{formatNumber(selectedCountry.population)}</strong></div>
                      </div>
                      <div className="details-heading"><span>AT A GLANCE</span><span>01 — 06</span></div>
                      <div className="details-grid">
                        <div className="detail-cell">
                          <span className="detail-icon">◉</span>
                          <div><span className="detail-label">Area</span><strong>{selectedCountry.area?.kilometers ? `${formatNumber(selectedCountry.area.kilometers)} km²` : "—"}</strong></div>
                        </div>
                        <div className="detail-cell">
                          <span className="detail-icon">¤</span>
                          <div><span className="detail-label">Currency</span><strong>{listValues(selectedCountry.currencies)}</strong></div>
                        </div>
                        <div className="detail-cell">
                          <span className="detail-icon">文</span>
                          <div><span className="detail-label">Languages</span><strong>{listValues(selectedCountry.languages)}</strong></div>
                        </div>
                        <div className="detail-cell">
                          <span className="detail-icon">◷</span>
                          <div><span className="detail-label">Time zones</span><strong>{asArray(selectedCountry.timezones).join(", ") || "—"}</strong></div>
                        </div>
                        <div className="detail-cell">
                          <span className="detail-icon">⌁</span>
                          <div><span className="detail-label">Calling code</span><strong>{asArray(selectedCountry.calling_codes).map((code) => `+${code}`).join(", ") || "—"}</strong></div>
                        </div>
                        <div className="detail-cell">
                          <span className="detail-icon">↔</span>
                          <div><span className="detail-label">Borders</span><strong>{asArray(selectedCountry.borders).join(", ") || "Island nation / none"}</strong></div>
                        </div>
                      </div>
                    </article>
                  )}
                </>
              ) : null}
            </section>
          )}

          <footer className="page-footer">
            <span>MADE FOR THE CURIOUS</span>
            <span>ATLAS <b>·</b> A MORE CONNECTED WORLD</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default App;
