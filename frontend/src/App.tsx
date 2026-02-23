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
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'calculator'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | MultipleNutritionResponse | null>(null);
  const [searchChoices, setSearchChoices] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

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
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(at 0% 0%, #f0fdfa 0px, transparent 50%), radial-gradient(at 100% 100%, #f0f9ff 0px, transparent 50%), #fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 20px',
      fontFamily: '"Inter", sans-serif',
      color: '#1e293b'
    }}>
      {/* Header Area */}
      <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeIn 0.8s ease-out' }}>
        <h1 style={{
          fontSize: '48px', fontWeight: '900', margin: '0 0 16px',
          background: 'linear-gradient(135deg, #10b981, #14b8a6, #0ea5e9)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.04em'
        }}>
          Nutritive
        </h1>
        <p style={{ fontSize: '18px', color: '#64748b', fontWeight: '500', maxWidth: '500px', margin: '0 auto' }}>
          Create professional nutritional labels with scientific precision and effortless clarity.
        </p>
      </div>

      <div style={{
        width: '100%', maxWidth: '1000px',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '40px'
      }}>
        
        {/* Navigation Switcher */}
        <div style={{
          display: 'flex', background: 'rgba(241, 245, 249, 0.5)', 
          backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '6px',
          margin: '0 auto 10px'
        }}>
          {(['search', 'calculator'] as const).map(tab => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(null); setNutritionData(null); setSearchChoices([]); }}
                style={{
                  padding: '10px 24px', borderRadius: '12px', border: 'none',
                  background: active ? '#fff' : 'transparent',
                  boxShadow: active ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                  color: active ? '#0f172a' : '#64748b',
                  fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s'
                }}
              >
                {tab === 'search' ? '🔍 Food Search' : '🧾 Recipe Builder'}
              </button>
            );
          })}
        </div>

        {activeTab === 'search' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
            <div style={{ 
              width: '100%', maxWidth: '600px', background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '24px', padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
            }}>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              
              {/* Recent searches */}
              {searchHistory.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Recent:</span>
                  {searchHistory.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(item)}
                      style={{
                        padding: '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0',
                        fontSize: '11px', fontWeight: '600', color: '#64748b', background: '#fff',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#10b981')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                    >{item}</button>
                  ))}
                </div>
              )}
            </div>

            {isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '40px' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #f0fdfa', borderTopColor: '#14b8a6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>Analyzing nutrients…</p>
              </div>
            )}
            
            {searchChoices.length > 0 && !isLoading && (
              <div style={{ width: '100%', maxWidth: '600px', animation: 'fadeIn 0.5s ease-out' }}>
                <FoodSelector items={searchChoices} onSelect={fetchNutrition} isLoading={isLoading} />
              </div>
            )}

            {nutritionData && !isLoading && (
              <div style={{ animation: 'fadeIn 0.5s ease-out', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <NutritionLabel data={nutritionData} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <NutritionCalculator />
          </div>
        )}
      </div>

      {error && !isLoading && (
        <div style={{
          marginTop: '32px', padding: '16px 24px', background: '#fef2f2',
          border: '1px solid #fee2e2', borderRadius: '16px', color: '#ef4444',
          fontSize: '14px', fontWeight: '600', animation: 'fadeIn 0.3s ease-out'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '80px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
        <p>© {new Date().getFullYear()} Nutritive — Professional Nutritional Analytics</p>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        body { margin: 0; background: #fff; }
      `}</style>
    </div>
  );
}

export default App;