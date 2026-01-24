import { useState, useEffect } from 'react';
import { 
  searchNutrition, 
  searchMultipleIngredients, 
  type NutritionData, 
  type MultipleNutritionResponse,
  type Ingredient 
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
    
    try {
      let data;
      if (query.includes(',')) {
        // Handle multiple ingredients
        const ingredients = query.split(',').map(i => ({
          name: i.trim(),
          quantity_g: 100 // Default quantity of 100g per ingredient
        })).filter(i => i.name);
        data = await searchMultipleIngredients(ingredients);
      } else {
        // Handle single food item
        data = await searchNutrition(query, 100); // Default to 100g for single items
      }
      
      setNutritionData(data);
      
      // Update search history
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
        return newHistory;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setNutritionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load search history from localStorage on initial render
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

  // Save search history to localStorage when it changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('nutritionSearchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Tab navigation component
  const TabNavigation = () => (
    <div className="border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'search'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Food Search
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'calculator'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Nutrition Calculator
        </button>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Nutrition Label Generator</h1>
          <p className="text-gray-600">Search for food items or calculate nutrition for recipes</p>
        </header>
        
        <TabNavigation />

        <main>
          {activeTab === 'search' ? (
            <>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              
              {isLoading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">Loading nutrition data...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {nutritionData && !isLoading && (
                <div className="mt-8">
                  <NutritionLabel data={nutritionData} />
                </div>
              )}

              {searchHistory.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">Recent Searches</h2>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(item)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
              )}
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <NutritionCalculator />
            </div>
          )}
        </main>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Nutrition data is provided for informational purposes only and may not be 100% accurate.</p>
          <p className="mt-1"> {new Date().getFullYear()} Nutrition Label Generator</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
