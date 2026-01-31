import { useState, useEffect } from 'react';
import { 
  searchNutrition, 
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

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setNutritionData(null);
    
    try {
      let data;
      // Heuristic: if contains comma, treat as multiple
      if (query.includes(',')) {
        const ingredients = query.split(',').map(i => ({
          name: i.trim(),
          quantity_g: 100 
        })).filter(i => i.name);
        data = await searchMultipleIngredients(ingredients);
      } else {
        data = await searchNutrition(query, 100);
      }
      
      setNutritionData(data);
      
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
        return newHistory;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('nutritionSearchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }
  }, []);

  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('nutritionSearchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <main className="flex-grow container mx-auto px-4 py-16 max-w-5xl">
        <header className="text-center mb-16 animate-fade-in-down">
          <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Nutri<span className="text-primary-600">Calc</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light">
            Professional grade nutritional analysis for single items and complex recipes.
          </p>
        </header>
        
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm mb-12 mx-auto max-w-md flex">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2.5 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'search'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Single Food Search
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
             className={`flex-1 py-2.5 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'calculator'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Recipe Builder
          </button>
        </div>

        <div className="transition-all duration-500 min-h-[500px]">
          {activeTab === 'search' ? (
            <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
              <div className="glass-card rounded-2xl p-8">
                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                
                {searchHistory.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 items-center justify-center">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-2">Recent:</span>
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(item)}
                        className="px-3 py-1 bg-slate-100 hover:bg-primary-50 text-slate-600 hover:text-primary-700 rounded-full text-xs transition-colors border border-slate-200"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-500"></div>
                  <p className="mt-4 text-slate-500 font-medium">Analyzing nutritional data...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm" role="alert">
                  <p className="font-bold">Unable to fetch data</p>
                  <p>{error}</p>
                </div>
              )}

              {nutritionData && !isLoading && (
                <div className="glass-card rounded-2xl p-8 transform transition-all hover:scale-[1.01] duration-500">
                  <NutritionLabel data={nutritionData} />
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 animate-fade-in">
              <NutritionCalculator />
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} NutriCalc. Data generated for educational purposes.</p>
      </footer>
    </div>
  );
}

export default App;
