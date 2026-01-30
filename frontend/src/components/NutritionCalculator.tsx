import React, { useState } from 'react';
import { searchNutrition, searchMultipleIngredients, Ingredient, NutritionData, MultipleNutritionResponse } from '../utils/api';
import NutritionLabel from './NutritionLabel';

const NutritionCalculator = () => {
  // Only multiple tab needed as single is handled by main search
  // But we'll keep the structure flexible if needed, though for now we can simplify to just Recipe Builder
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity_g: 100 }]);
  const [result, setResult] = useState<NutritionData | MultipleNutritionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMultipleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients = ingredients.filter(i => i.name.trim() !== '');
    if (validIngredients.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await searchMultipleIngredients(validIngredients);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nutrition data');
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
    if (newIngredients.length === 0) {
        setIngredients([{ name: '', quantity_g: 100 }]);
    } else {
        setIngredients(newIngredients);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Recipe Builder</h2>
          <p className="text-slate-500 text-sm">Add ingredients to calculate total nutrition.</p>
        </div>

        <form onSubmit={handleMultipleSubmit} className="space-y-4">
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-3 items-start animate-fade-in group">
                <div className="flex-grow">
                  <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">
                    Ingredient {index + 1}
                  </label>
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    className="input-field"
                    placeholder="e.g., oats"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">
                    Grams
                  </label>
                  <input
                    type="number"
                    value={ingredient.quantity_g}
                    onChange={(e) => updateIngredient(index, 'quantity_g', Number(e.target.value))}
                    className="input-field"
                    min="1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="mt-7 text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="Remove ingredient"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={addIngredient}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 font-medium hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all flex justify-center items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Item
            </button>
            <button
              type="submit"
              disabled={isLoading || ingredients.every(i => !i.name.trim())}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Calculating...' : 'Calculate Total'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="relative min-h-[400px]">
        {result ? (
            <div className="animate-fade-in-up">
                <NutritionLabel data={result} />
                
                {result && 'not_found' in result && result.not_found && result.not_found.length > 0 && (
                     <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
                        <span className="font-bold">Note:</span> Data not found for: {result.not_found.join(', ')}
                     </div>
                )}
            </div>
        ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl p-8 bg-slate-50/50">
                <p className="text-center font-medium">Add ingredients to calculate nutrition</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default NutritionCalculator;
