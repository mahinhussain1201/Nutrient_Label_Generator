import { useState, useEffect } from 'react';
import {
  searchMultipleIngredients,
  fuzzySearch,
  type NutritionData,
  type MultipleNutritionResponse
} from './utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './components/SearchBar';
import NutritionLabel from './components/NutritionLabel';
import NutritionCalculator from './components/NutritionCalculator';
import FoodSelector from './components/FoodSelector';
import PremiumAlert, { type AlertOptions } from './components/PremiumAlert';
import { SkeletonSearch, SkeletonLabel } from './components/SkeletonLoader';
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
    <div className="app-container">
      {/* Header Area */}
      <div className="header-section">
        <h1 className="main-title">Nutritive</h1>
        <p className="subtitle">
          Create professional nutritional labels with scientific precision and effortless clarity.
        </p>
      </div>

      <div className="main-content">
        {/* Navigation Switcher */}
        <div className="nav-switcher">
          {(['search', 'calculator'] as const).map(tab => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                className={`nav-button ${active ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab); setError(null); setNutritionData(null); setSearchChoices([]); }}
              >
                {tab === 'search' ? '🔍 Food Search' : '🧾 Recipe Builder'}
              </button>
            );
          })}
        </div>

        {activeTab === 'search' ? (
          <div className="search-tab-content">
            <div className="search-card">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              
              {/* Recent searches */}
              {searchHistory.length > 0 && (
                <div className="history-section">
                  <span className="history-label">Recent:</span>
                  <div className="history-tags">
                    {searchHistory.map((item, i) => (
                      <button
                        key={i}
                        className="history-tag"
                        onClick={() => handleSearch(item)}
                      >{item}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isLoading && (
              <div className="loading-container">
                <div className="spinner" />
                <p>Analyzing nutrients…</p>
              </div>
            )}
            
            {searchChoices.length > 0 && !isLoading && (
              <div className="disambiguation-section">
                <FoodSelector items={searchChoices} onSelect={fetchNutrition} isLoading={isLoading} />
              </div>
            )}

            {nutritionData && !isLoading && (
              <div className="label-result-wrapper">
                <NutritionLabel data={nutritionData} showAlert={showAlert} />
              </div>
            )}
          </div>
        ) : (
          <div className="calculator-tab-content">
            <NutritionCalculator showAlert={showAlert} />
          </div>
        )}
      </div>

      {error && !isLoading && (
        <div className="error-toast">
          ⚠️ {error}
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Nutritive — Professional Nutritional Analytics</p>
      </footer>

      <PremiumAlert alert={alert} onClose={() => setAlert(null)} />

      <style>{`
        .app-container {
          min-height: 100vh;
          background: radial-gradient(at 0% 0%, #f0fdfa 0px, transparent 50%), 
                      radial-gradient(at 100% 100%, #f0f9ff 0px, transparent 50%), 
                      #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          box-sizing: border-box;
        }

        .header-section {
          text-align: center;
          margin-bottom: 60px;
          animation: fadeIn 0.8s ease-out;
          width: 100%;
        }

        .main-title {
          font-size: 48px;
          font-weight: 900;
          margin: 0 0 16px;
          background: linear-gradient(135deg, #10b981, #14b8a6, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.04em;
        }

        .subtitle {
          font-size: 18px;
          color: #64748b;
          font-weight: 500;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .main-content {
          width: 100%;
          maxWidth: 1000px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .nav-switcher {
          display: flex;
          background: rgba(241, 245, 249, 0.5); 
          backdrop-filter: blur(8px);
          border-radius: 16px;
          padding: 6px;
          margin: 0 auto 10px;
        }

        .nav-button {
          padding: 10px 24px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .nav-button.active {
          background: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          color: #0f172a;
        }

        .search-tab-content {
          display: flex;
          flex-direction: column;
          gap: 40px;
          align-items: center;
          width: 100%;
        }

        .search-card {
          width: 100%;
          max-width: 600px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.03);
          box-sizing: border-box;
        }

        .history-section {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .history-label {
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .history-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .history-tag {
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .history-tag:hover {
          border-color: #10b981;
          color: #10b981;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 40px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0fdfa;
          border-top-color: #14b8a6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .disambiguation-section {
          width: 100%;
          max-width: 600px;
          animation: fadeIn 0.5s ease-out;
        }

        .label-result-wrapper {
          animation: fadeIn 0.5s ease-out;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .calculator-tab-content {
          animation: fadeIn 0.5s ease-out;
          width: 100%;
        }

        .error-toast {
          margin-top: 32px;
          padding: 16px 24px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 16px;
          color: #ef4444;
          font-size: 14px;
          font-weight: 600;
          animation: fadeIn 0.3s ease-out;
        }

        .app-footer {
          margin-top: 80px;
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
          padding: 20px;
        }

        /* Mobile Breakpoints */
        @media (max-width: 768px) {
          .app-container {
            padding: 40px 16px;
          }
          .main-title {
            font-size: 36px;
          }
          .subtitle {
            font-size: 16px;
          }
          .search-card, .calculator-container {
            padding: 24px 16px !important;
          }
          .nav-button {
            padding: 8px 16px;
            font-size: 13px;
          }
        }

        @media (max-width: 600px) {
          .ingredient-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            padding: 12px;
            background: rgba(255,255,255,0.4);
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.6);
          }
          .name-input-wrapper {
            width: 100%;
          }
          .quantity-wrapper {
            justify-content: flex-end;
          }
          .calculator-actions {
            flex-direction: column;
            gap: 16px;
          }
          .calculate-btn {
            width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .app-container {
            padding: 32px 12px;
          }
          .main-title {
            font-size: 32px;
          }
          .header-section {
            margin-bottom: 40px;
          }
          .nav-switcher {
            width: 100%;
          }
          .nav-button {
            flex: 1;
            padding: 10px 8px;
            font-size: 12px;
          }
          .history-section {
            flex-direction: column;
            align-items: flex-start;
          }
          .nutrition-facts-card {
            padding: 16px !important;
          }
          .label-title {
            font-size: 20px !important;
          }
          .calories-block p:last-child {
            font-size: 28px !important;
          }
          .label-copy-btn {
             top: 10px !important;
             right: 10px !important;
             padding: 4px 8px !important;
             font-size: 10px !important;
          }
          .nutrition-facts-card {
            padding: 16px !important;
          }
          .label-title {
            font-size: 20px !important;
          }
          .calories-block p:last-child {
            font-size: 28px !important;
          }
          .label-copy-btn {
             top: 10px !important;
             right: 10px !important;
             padding: 4px 8px !important;
             font-size: 10px !important;
          }
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        body { margin: 0; background: #fff; }
      `}</style>
    </div>
  );
}

export default App;