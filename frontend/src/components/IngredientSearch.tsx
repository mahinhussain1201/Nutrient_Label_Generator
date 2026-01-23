import { useState, useEffect, useRef } from 'react';
import { searchFoods } from '../utils/nutritionApi';
import type { FoodItem } from '../utils/nutritionApi';

interface IngredientSearchProps {
  onAddIngredient: (ingredient: { id: string; name: string; amount: number }) => void;
}

export default function IngredientSearch({ onAddIngredient }: IngredientSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('100');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for food items when query changes
  useEffect(() => {
    const search = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchFoods(query);
        setSuggestions(results);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error('Error searching for foods:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setQuery(food.name);
    setIsDropdownOpen(false);
  };

  const handleAddIngredient = () => {
    if (!selectedFood || !amount) return;
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    
    onAddIngredient({
      id: selectedFood.id,
      name: selectedFood.name,
      amount: amountNum
    });
    
    // Reset form
    setQuery('');
    setAmount('100');
    setSelectedFood(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1" ref={dropdownRef}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
            placeholder="Search for a food item..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {isDropdownOpen && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {suggestions.map((food) => (
                <div
                  key={food.id}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                    selectedFood?.id === food.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelectFood(food)}
                >
                  <div className="font-medium">{food.name}</div>
                  {food.group && (
                    <div className="text-sm text-gray-500">{food.group}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="1"
            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="g"
          />
          <span className="absolute right-3 top-2.5 text-gray-500">g</span>
        </div>
        
        <button
          onClick={handleAddIngredient}
          disabled={!selectedFood || !amount}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
