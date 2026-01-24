import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NutritionCalculator = () => {
  const [ingredients, setIngredients] = useState([{ name: '', quantity: 100 }]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search for ingredient suggestions
  const searchIngredients = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    
    try {
      const response = await axios.get('http://localhost:5000/api/ingredients/search', {
        params: { q: query }
      });
      setSuggestions(response.data.results || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
    }
  };

  // Handle input change for ingredient name
  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index].name = value;
    setIngredients(newIngredients);
    
    if (value.length > 2) {
      searchIngredients(value);
      setCurrentIngredientIndex(index);
    } else {
      setSuggestions([]);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index].quantity = value;
    setIngredients(newIngredients);
  };

  // Add a new ingredient row
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 100 }]);
  };

  // Remove an ingredient row
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion) => {
    const newIngredients = [...ingredients];
    newIngredients[currentIngredientIndex].name = suggestion.name;
    setIngredients(newIngredients);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Calculate nutrition
  const calculateNutrition = async () => {
    setLoading(true);
    setError('');
    
    try {
      const payload = ingredients
        .filter(ing => ing.name.trim() !== '')
        .map(ing => ({
          name: ing.name,
          quantity_g: parseFloat(ing.quantity) || 0
        }));
      
      if (payload.length === 0) {
        setError('Please add at least one ingredient');
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/nutrition/multiple', payload);
      setResults(response.data);
    } catch (err) {
      console.error('Error calculating nutrition:', err);
      setError('Failed to calculate nutrition. Please try again.');
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Format number to 2 decimal places
  const formatNumber = (num) => {
    return parseFloat(num).toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Nutrition Calculator</h1>
      
      <div className="mb-6">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder="Ingredient name"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showSuggestions && currentIngredientIndex === index && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((suggestion, idx) => (
                    <li
                      key={suggestion.id || idx}
                      className={`p-2 hover:bg-gray-100 cursor-pointer ${
                        idx === activeSuggestion ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      {suggestion.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={ingredient.quantity}
                onChange={(e) => handleQuantityChange(index, e.target.value)}
                min="1"
                className="w-24 p-2 border rounded"
              />
              <span>g</span>
              {ingredients.length > 1 && (
                <button
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                  title="Remove ingredient"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
        
        <div className="flex justify-between mt-2">
          <button
            onClick={addIngredient}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            + Add Ingredient
          </button>
          
          <button
            onClick={calculateNutrition}
            disabled={loading}
            className={`px-6 py-2 rounded text-white font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Calculating...' : 'Calculate'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}

      {results && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Nutritional Information</h2>
          
          {results.not_found && results.not_found.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
              <p className="font-medium">Could not find nutrition data for:</p>
              <ul className="list-disc pl-5 mt-1">
                {results.not_found.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Nutrient</th>
                  <th className="py-2 px-4 text-right">Amount</th>
                  <th className="py-2 px-4 text-right">Unit</th>
                </tr>
              </thead>
              <tbody>
                {results.total_nutrients.map((nutrient, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-4">{nutrient.name}</td>
                    <td className="py-2 px-4 text-right">{formatNumber(nutrient.amount)}</td>
                    <td className="py-2 px-4 text-right">{nutrient.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">By Ingredient:</h3>
            {results.ingredients.map((ingredient, idx) => (
              <div key={idx} className="mb-6">
                <h4 className="font-medium">
                  {ingredient.ingredient} ({ingredient.quantity_g}g)
                </h4>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {ingredient.nutrients.map((nutrient, nIdx) => (
                    <div key={nIdx} className="text-sm">
                      <span className="font-medium">{nutrient.name}:</span>{' '}
                      {formatNumber(nutrient.amount)} {nutrient.unit}
                      {nutrient.per_100g && (
                        <span className="text-gray-500 text-xs ml-1">
                          ({formatNumber(nutrient.per_100g)} per 100g)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionCalculator;
