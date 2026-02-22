import { useState, useEffect } from 'react';
import {
  searchMultipleIngredients,
  type NutritionData,
  type MultipleNutritionResponse
} from './utils/api';
import SearchBar from './components/SearchBar';
import NutritionLabel from './components/NutritionLabel';
import NutritionCalculator from './components/NutritionCalculator';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'calculator'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | MultipleNutritionResponse | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hoveredHistory, setHoveredHistory] = useState<number | null>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setNutritionData(null);
    try {
      const data = await searchMultipleIngredients([{ name: query.trim(), quantity_g: 100 }]);
      setNutritionData(data);
      setSearchHistory(prev => [query, ...prev.filter(i => i !== query)].slice(0, 5));
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
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #ecfdf5 0%, #f0fdfa 40%, #ecfeff 100%)',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── MAIN ── */}
      <main style={{ flexGrow: 1, width: '100%', maxWidth: '860px', margin: '0 auto', padding: '56px 20px 40px' }}>

        {/* Hero header */}
        <header style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '20px', marginBottom: '20px',
            background: 'linear-gradient(135deg, #34d399, #14b8a6)',
            fontSize: '30px', boxShadow: '0 8px 24px rgba(20,184,166,0.3)',
          }}>🥗</div>
          <h1 style={{ margin: '0 0 10px', fontSize: '42px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Nutri<span style={{ background: 'linear-gradient(135deg, #34d399, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Calc</span>
          </h1>
          <p style={{ margin: 0, fontSize: '16px', color: '#94a3b8', fontWeight: '400', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
            Professional-grade nutritional analysis for single foods and complex recipes.
          </p>
        </header>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: '6px', padding: '6px',
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          maxWidth: '380px', margin: '0 auto 36px',
        }}>
          {(['search', 'calculator'] as const).map(tab => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '10px 20px', borderRadius: '13px', border: 'none',
                  fontSize: '13px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.01em',
                  background: active ? 'linear-gradient(135deg, #34d399, #14b8a6)' : 'transparent',
                  color: active ? '#fff' : '#94a3b8',
                  boxShadow: active ? '0 3px 10px rgba(20,184,166,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {tab === 'search' ? '🔍 Food Search' : '🧾 Recipe Builder'}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ minHeight: '500px' }}>

          {/* ── SEARCH TAB ── */}
          {activeTab === 'search' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Search card */}
              <div style={{
                background: '#fff', borderRadius: '24px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                padding: '28px',
              }}>
                <SearchBar onSearch={handleSearch} isLoading={isLoading} />

                {/* Search history */}
                {searchHistory.length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #f8fafc', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>Recent:</span>
                    {searchHistory.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(item)}
                        onMouseEnter={() => setHoveredHistory(i)}
                        onMouseLeave={() => setHoveredHistory(null)}
                        style={{
                          padding: '4px 12px', borderRadius: '20px', border: '1px solid',
                          fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                          background: hoveredHistory === i ? '#ecfdf5' : '#f8fafc',
                          borderColor: hoveredHistory === i ? '#6ee7b7' : '#e2e8f0',
                          color: hoveredHistory === i ? '#065f46' : '#64748b',
                          transition: 'all 0.15s',
                        }}
                      >{item}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Loading */}
              {isLoading && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '14px', padding: '48px',
                  background: '#fff', borderRadius: '24px',
                  border: '1px solid #f1f5f9', boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                }}>
                  <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid #d1fae5' }} />
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid transparent', borderTopColor: '#14b8a6', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>Analyzing nutritional data…</p>
                </div>
              )}

              {/* Error */}
              {error && !isLoading && (
                <div style={{
                  display: 'flex', gap: '14px', alignItems: 'flex-start',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '18px', padding: '18px 20px',
                }}>
                  <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚠️</div>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '800', color: '#991b1b' }}>Unable to fetch data</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c' }}>{error}</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {nutritionData && !isLoading && (
                <div style={{
                  background: '#fff', borderRadius: '24px',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                  padding: '28px',
                }}>
                  <NutritionLabel data={nutritionData} />
                </div>
              )}
            </div>
          )}

          {/* ── CALCULATOR TAB ── */}
          {activeTab === 'calculator' && (
            <div style={{
              background: '#fff', borderRadius: '24px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
              padding: '28px',
            }}>
              <NutritionCalculator />
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '24px 20px', textAlign: 'center',
        borderTop: '1px solid #f1f5f9',
      }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>
          © {new Date().getFullYear()} NutriCalc — Data generated for educational purposes.
        </p>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default App;