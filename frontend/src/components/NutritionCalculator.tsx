import { useState } from 'react';
import { searchNutrition, searchMultipleIngredients, Ingredient, Nutrient, NutritionData, MultipleNutritionResponse } from '../utils/api';

const NutritionCalculator = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'multiple'>('single');
  const [singleFood, setSingleFood] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity_g: 100 }]);
  const [result, setResult] = useState<NutritionData | MultipleNutritionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFood.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await searchNutrition(singleFood, Number(quantity));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nutrition data');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultipleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients = ingredients.filter(i => i.name.trim() !== '');
    if (validIngredients.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await searchMultipleIngredients(validIngredients);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nutrition data');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity_g: 100 }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const renderSingleForm = () => (
    <form onSubmit={handleSingleSubmit} className="space-y-4">
      <div>
        <label htmlFor="food" className="block text-sm font-medium text-gray-700">
          Food Item
        </label>
        <input
          type="text"
          id="food"
          value={singleFood}
          onChange={(e) => setSingleFood(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., apple, banana, chicken"
          required
        />
      </div>
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
          Quantity (g)
        </label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          min="1"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Calculating...' : 'Calculate Nutrition'}
      </button>
    </form>
  );

  const renderMultipleForm = () => (
    <form onSubmit={handleMultipleSubmit} className="space-y-4">
      <div className="space-y-4">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex space-x-4 items-end">
            <div className="flex-1">
              <label htmlFor={`ingredient-${index}`} className="block text-sm font-medium text-gray-700">
                Ingredient {index + 1}
              </label>
              <input
                type="text"
                id={`ingredient-${index}`}
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., apple"
              />
            </div>
            <div className="w-24">
              <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">
                Grams
              </label>
              <input
                type="number"
                id={`quantity-${index}`}
                value={ingredient.quantity_g}
                onChange={(e) => updateIngredient(index, 'quantity_g', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={addIngredient}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Ingredient
        </button>
        <button
          type="submit"
          disabled={isLoading || ingredients.every(i => !i.name.trim())}
          className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Calculating...' : 'Calculate Nutrition'}
        </button>
      </div>
    </form>
  );

  const renderResult = () => {
    if (!result) return null;

    if ('ingredient' in result) {
      // Single result
      return (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Nutrition for {result.ingredient} ({result.quantity_g}g)
          </h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                {result.nutrients.map((nutrient, index) => (
                  <div key={index} className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">{nutrient.name}</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {nutrient.amount} {nutrient.unit}
                      {nutrient.per_100g !== undefined && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({nutrient.per_100g} per 100g)
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      );
    } else {
      // Multiple results
      return (
        <div className="mt-8 space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Total Nutrition</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  {result.total_nutrients.map((nutrient, index) => (
                    <div key={`total-${index}`} className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">{nutrient.name}</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {nutrient.amount} {nutrient.unit}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">By Ingredient</h3>
            <div className="space-y-4">
              {result.ingredients.map((ingredient, i) => (
                <div key={i} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h4 className="text-md font-medium text-gray-700">
                      {ingredient.ingredient} ({ingredient.quantity_g}g)
                    </h4>
                  </div>
                  <div className="px-4 py-3">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                      {ingredient.nutrients.map((nutrient, j) => (
                        <div key={j} className="sm:col-span-1">
                          <dt className="text-xs font-medium text-gray-500">{nutrient.name}</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {nutrient.amount} {nutrient.unit}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.not_found.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Could not find nutrition data for: {result.not_found.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nutrition Calculator</h2>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'single'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Single Food
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('multiple')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'multiple'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Multiple Ingredients
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === 'single' ? renderSingleForm() : renderMultipleForm()}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          renderResult()
        )}
      </div>
    </div>
  );
};

export default NutritionCalculator;
