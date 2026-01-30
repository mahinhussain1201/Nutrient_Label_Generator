import React from 'react';
import type { NutritionData, MultipleNutritionResponse } from '../utils/api';

interface NutritionLabelProps {
  data: NutritionData | MultipleNutritionResponse;
}

interface NutrientRowProps {
  label: string;
  value: number;
  unit: string;
  isSubItem?: boolean;
  isBold?: boolean;
  dv?: number; // Daily Value %
}

const NutrientRow: React.FC<NutrientRowProps> = ({ label, value, unit, isSubItem = false, isBold = false, dv }) => (
  <div className={`flex justify-between items-center py-1 border-b border-gray-300 ${isSubItem ? 'pl-4' : ''}`}>
    <div className="flex items-baseline gap-1">
      <span className={`${isBold ? 'font-black' : 'font-normal'} text-sm`}>{label}</span>
      <span className="text-sm">{value}{unit}</span>
    </div>
    {dv !== undefined && (
      <span className="font-bold text-sm">{dv}%</span>
    )}
  </div>
);

const NutritionLabel: React.FC<NutritionLabelProps> = ({ data }) => {
  const isMultiple = 'ingredients' in data && Array.isArray(data.ingredients);

  // Simplified DV helpers (approximate)
  const getDV = (amount: number, total: number) => Math.round((amount / total) * 100);

  const getNutrients = () => {
    return isMultiple ? (data as MultipleNutritionResponse).total_nutrients : (data as NutritionData).nutrients;
  };

  const nutrientList = getNutrients() || [];
  const findN = (name: string) => nutrientList.find(n => n.name.toLowerCase().includes(name.toLowerCase()));

  const energy = findN('energy') || findN('calories');
  const fat = findN('total lipid (fat)') || findN('total fat');
  const satFat = findN('saturated');
  const transFat = findN('trans');
  const chol = findN('cholesterol');
  const sodium = findN('sodium');
  const carbs = findN('carbohydrate');
  const fiber = findN('fiber');
  const sugars = findN('sugar');
  const protein = findN('protein');
  const vitD = findN('vitamin d');
  const calc = findN('calcium');
  const iron = findN('iron');
  const potassium = findN('potassium');

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-slate-200 p-6 shadow-xl font-sans text-slate-900 transition-all duration-300 hover:shadow-2xl rounded-sm">
      <h1 className="text-4xl font-black border-b-[10px] border-black pb-2 leading-none">Nutrition Facts</h1>
      
      <div className="border-b-[4px] border-black py-2">

        <h2 className="text-xl font-bold flex justify-between">
          <span>Serving size</span>
          <span>{isMultiple ? 'Recipe Total' : '100g'}</span>
        </h2>
      </div>

      <div className="border-b-[8px] border-slate-900 py-2 flex justify-between items-end">
        <div>
          <h3 className="text-sm font-bold">Amount per serving</h3>
          <span className="text-4xl font-black">Calories</span>
        </div>
        <span className="text-5xl font-black">{energy ? Math.round(energy.amount) : 0}</span>
      </div>

      <div className="text-right text-xs font-bold py-1 border-b border-gray-300">% Daily Value*</div>

      <div className="flex flex-col">
        <NutrientRow label="Total Fat" value={fat ? fat.amount : 0} unit="g" isBold dv={getDV((fat?.amount || 0), 78)} />
        <NutrientRow label="Saturated Fat" value={satFat ? satFat.amount : 0} unit="g" isSubItem dv={getDV((satFat?.amount || 0), 20)} />
        <NutrientRow label="Trans Fat" value={transFat ? transFat.amount : 0} unit="g" isSubItem />
        
        <NutrientRow label="Cholesterol" value={chol ? chol.amount : 0} unit="mg" isBold dv={getDV((chol?.amount || 0), 300)} />
        <NutrientRow label="Sodium" value={sodium ? sodium.amount : 0} unit="mg" isBold dv={getDV((sodium?.amount || 0), 2300)} />
        
        <NutrientRow label="Total Carbohydrate" value={carbs ? carbs.amount : 0} unit="g" isBold dv={getDV((carbs?.amount || 0), 275)} />
        <NutrientRow label="Dietary Fiber" value={fiber ? fiber.amount : 0} unit="g" isSubItem dv={getDV((fiber?.amount || 0), 28)} />
        <NutrientRow label="Total Sugars" value={sugars ? sugars.amount : 0} unit="g" isSubItem />
        
        <NutrientRow label="Protein" value={protein ? protein.amount : 0} unit="g" isBold dv={getDV((protein?.amount || 0), 50)} />
      </div>

      <div className="border-t-[8px] border-slate-900 mt-2">
        <NutrientRow label="Vitamin D" value={vitD ? vitD.amount : 0} unit="ug" dv={getDV((vitD?.amount || 0), 20)} />
        <NutrientRow label="Calcium" value={calc ? calc.amount : 0} unit="mg" dv={getDV((calc?.amount || 0), 1300)} />
        <NutrientRow label="Iron" value={iron ? iron.amount : 0} unit="mg" dv={getDV((iron?.amount || 0), 18)} />
        <NutrientRow label="Potassium" value={potassium ? potassium.amount : 0} unit="mg" dv={getDV((potassium?.amount || 0), 4700)} />
      </div>

      <div className="mt-4 pt-2 border-t border-gray-400 text-[10px] leading-tight text-gray-600">
        * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
      </div>
    </div>
  );
};

export default NutritionLabel;
