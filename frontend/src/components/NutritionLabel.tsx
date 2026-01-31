import React from 'react';
import type { NutritionData, MultipleNutritionResponse } from '../utils/api';

interface NutritionLabelProps {
  data: NutritionData | MultipleNutritionResponse;
}

const NutritionLabel: React.FC<NutritionLabelProps> = ({ data }) => {
  const isMultiple = 'ingredients' in data && Array.isArray(data.ingredients);

  const getNutrients = () => {
    return isMultiple ? (data as MultipleNutritionResponse).total_nutrients : (data as NutritionData).nutrients;
  };

  const nutrientList = getNutrients() || [];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 p-6 shadow-xl font-sans text-slate-900 rounded-sm">
      <h1 className="text-3xl font-black border-b-4 border-black pb-2 mb-4">Nutrition Facts</h1>
      
      {!isMultiple && (
         <div className="flex justify-between font-bold border-b border-gray-300 pb-2 mb-2">
            <span>Serving Size</span>
            <span>100g</span>
         </div>
      )}

      {isMultiple && (
         <div className="bg-slate-50 p-3 rounded mb-4 border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-2">Recipe Totals</h3>
         </div>
      )}
      
      <div className="flex flex-col border-t border-gray-200">
        <div className="flex justify-between py-2 border-b border-gray-300 font-bold bg-gray-50 px-2">
            <span>Nutrient</span>
            <span>Amount</span>
        </div>
        {nutrientList.length === 0 ? (
            <div className="py-4 text-center text-gray-500">No nutrient data available</div>
        ) : (
            nutrientList.map((nutrient, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-slate-50 px-2 transition-colors">
                    <span className="font-medium text-slate-700">{nutrient.name}</span>
                    <span className="font-bold text-slate-900">{nutrient.amount} {nutrient.unit}</span>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default NutritionLabel;
