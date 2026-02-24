import { useState, useEffect } from 'react';
import {
  searchMultipleIngredients,
  fuzzySearch,
  type NutritionData,
  type MultipleNutritionResponse
} from './utils/api';
import SearchBar from './components/SearchBar';
import NutritionLabel from './components/NutritionLabel';
import NutritionCalculator from './components/NutritionCalculator';
import FoodSelector from './components/FoodSelector';
import PremiumAlert, { type AlertOptions } from './components/PremiumAlert';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'calculator'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | MultipleNutritionResponse | null>(null);
  const [searchChoices, setSearchChoices] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = (options: AlertOptions) => setAlert(options);

  const fetchNutrition = async (foodName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchMultipleIngredients([{ name: foodName, quantity_g: 100 }]);
      setNutritionData(data);
      setSearchChoices([]);
      setSearchHistory(prev => [foodName, ...prev.filter(i => i !== foodName)].slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setNutritionData(null);
    setSearchChoices([]);

    try {
      const choices = await fuzzySearch(query);
      if (choices.length === 0) {
        setError(`No matches found for "${query}"`);
      } else if (choices.length === 1) {
        await fetchNutrition(choices[0]);
      } else {
        setSearchChoices(choices);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nutritionSearchHistory');
      if (saved) setSearchHistory(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (searchHistory.length > 0)
      localStorage.setItem('nutritionSearchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  return (
    <div className="app-root">
      {/* Background texture */}
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />

      {/* Header */}
      <header className="site-header">
        <div className="header-inner">
          <div className="wordmark">
            <span className="wordmark-icon">◈</span>
            <span className="wordmark-text">Nutritive</span>
          </div>
          <p className="site-tagline">Precision nutrition intelligence</p>
        </div>
      </header>

      {/* Main */}
      <main className="site-main">
        {/* Tab switcher */}
        <div className="tab-rail">
          <button
            className={`tab-btn ${activeTab === 'search' ? 'tab-active' : ''}`}
            onClick={() => { setActiveTab('search'); setError(null); setNutritionData(null); setSearchChoices([]); }}
          >
            <span className="tab-icon">⌕</span>
            Food Search
          </button>
          <button
            className={`tab-btn ${activeTab === 'calculator' ? 'tab-active' : ''}`}
            onClick={() => { setActiveTab('calculator'); setError(null); setNutritionData(null); setSearchChoices([]); }}
          >
            <span className="tab-icon">⊞</span>
            Recipe Builder
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'search' ? (
          <div className="search-panel">
            {/* Search card */}
            <div className="search-card">
              <SearchBar
                onSearch={handleSearch}
                isLoading={isLoading}
                hideSuggestions={searchChoices.length > 0}
              />
              {searchHistory.length > 0 && (
                <div className="history-row">
                  <span className="history-eyebrow">Recent</span>
                  <div className="history-chips">
                    {searchHistory.map((item, i) => (
                      <button key={i} className="history-chip" onClick={() => handleSearch(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="loading-state">
                <div className="loader-ring">
                  <div className="loader-segment" />
                </div>
                <span className="loading-text">Analyzing nutrients…</span>
              </div>
            )}

            {/* Disambiguation */}
            {searchChoices.length > 0 && !isLoading && (
              <div className="disambiguation-wrap">
                <FoodSelector items={searchChoices} onSelect={fetchNutrition} isLoading={isLoading} />
              </div>
            )}

            {/* Result */}
            {nutritionData && !isLoading && (
              <div className="result-wrap">
                <NutritionLabel data={nutritionData} showAlert={showAlert} />
              </div>
            )}
          </div>
        ) : (
          <div className="calculator-panel">
            <NutritionCalculator showAlert={showAlert} />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="error-banner" role="alert">
            <span className="error-icon">!</span>
            {error}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Nutritive — Nutritional Analytics</p>
      </footer>

      <PremiumAlert alert={alert} onClose={() => setAlert(null)} />

      <style>{`
        /* ─── Reset / Base ───────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f8faf9;
          color: #1a2e27;
          font-family: 'DM Sans', 'Outfit', ui-sans-serif, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ─── Background ─────────────────────────────────────────────── */
        .app-root {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        .bg-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .bg-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
          top: -200px;
          left: -200px;
        }

        .bg-orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);
          bottom: -100px;
          right: -150px;
        }

        /* ─── Header ─────────────────────────────────────────────────── */
        .site-header {
          position: relative;
          z-index: 10;
          width: 100%;
          padding: 48px 24px 0;
          text-align: center;
          animation: fadeSlideDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .header-inner {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .wordmark {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .wordmark-icon {
          font-size: 32px;
          background: linear-gradient(135deg, #10b981, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }

        .wordmark-text {
          font-size: 48px;
          font-weight: 800;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #065f46 0%, #059669 40%, #0891b2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }

        .site-tagline {
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        /* ─── Main ───────────────────────────────────────────────────── */
        .site-main {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 760px;
          padding: 48px 20px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
          flex: 1;
        }

        /* ─── Tab Rail ───────────────────────────────────────────────── */
        .tab-rail {
          display: flex;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 4px;
          gap: 2px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 24px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: color 0.2s, background 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }

        .tab-btn:hover { color: #334155; }

        .tab-active {
          background: #f0fdf9;
          border: 1px solid rgba(16,185,129,0.3) !important;
          color: #059669 !important;
          box-shadow: 0 1px 6px rgba(16,185,129,0.1);
        }

        .tab-icon {
          font-size: 16px;
          line-height: 1;
        }

        /* ─── Search Panel ───────────────────────────────────────────── */
        .search-panel {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          animation: fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* ─── Search Card ────────────────────────────────────────────── */
        .search-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .search-card:focus-within {
          border-color: rgba(16,185,129,0.4);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.08), 0 2px 12px rgba(0,0,0,0.04);
        }

        /* ─── History ────────────────────────────────────────────────── */
        .history-row {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .history-eyebrow {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94a3b8;
          flex-shrink: 0;
        }

        .history-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .history-chip {
          padding: 5px 13px;
          border-radius: 100px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .history-chip:hover {
          border-color: rgba(16,185,129,0.45);
          background: #f0fdf9;
          color: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(16,185,129,0.1);
        }

        /* ─── Loading ────────────────────────────────────────────────── */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 40px 0;
        }

        .loader-ring {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3px solid #d1fae5;
          border-top-color: #059669;
          animation: spin 0.75s linear infinite;
        }

        .loading-text {
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.02em;
        }

        /* ─── Disambiguation ─────────────────────────────────────────── */
        .disambiguation-wrap {
          width: 100%;
          animation: fadeSlideUp 0.35s ease both;
        }

        /* ─── Result ─────────────────────────────────────────────────── */
        .result-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
          animation: fadeSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* ─── Calculator Panel ───────────────────────────────────────── */
        .calculator-panel {
          width: 100%;
          animation: fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* ─── Error ──────────────────────────────────────────────────── */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 14px;
          color: #dc2626;
          font-size: 14px;
          font-weight: 600;
          animation: fadeSlideUp 0.3s ease both;
          width: 100%;
          max-width: 640px;
        }

        .error-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fee2e2;
          color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 900;
          flex-shrink: 0;
          line-height: 22px;
          text-align: center;
        }

        /* ─── Footer ─────────────────────────────────────────────────── */
        .site-footer {
          position: relative;
          z-index: 10;
          padding: 24px;
          text-align: center;
          color: #cbd5e1;
          font-size: 12px;
          letter-spacing: 0.03em;
        }

        /* ─── Animations ─────────────────────────────────────────────── */
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ─── Responsive ─────────────────────────────────────────────── */
        @media (max-width: 640px) {
          .wordmark-text { font-size: 36px; }
          .site-tagline { font-size: 13px; }
          .tab-btn { padding: 9px 14px; font-size: 13px; }
          .search-card { padding: 18px 16px; border-radius: 20px; }
          .site-main { padding: 32px 16px 40px; gap: 20px; }
          .site-header { padding-top: 36px; }
        }

        @media (max-width: 400px) {
          .wordmark-text { font-size: 30px; }
          .tab-rail { width: 100%; }
          .tab-btn { flex: 1; justify-content: center; padding: 9px 8px; font-size: 12px; }
          .history-row { flex-direction: column; align-items: flex-start; }
        }

        /* ─── Child component overrides ──────────────────────────────── */
        /* Ingredient rows in the Recipe Builder */
        @media (max-width: 600px) {
          .ingredient-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            padding: 12px;
            background: #f8fafc;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
          }
          .name-input-wrapper { width: 100%; }
          .quantity-wrapper { justify-content: flex-end; }
          .calculator-actions { flex-direction: column; gap: 16px; }
          .calculate-btn { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

export default App;