import React from 'react';
import type { Nutrient, NutritionResponse } from '../types/nutrition';

interface NutritionLabelProps {
  data: NutritionResponse;
}

const NutritionLabel: React.FC<NutritionLabelProps> = ({ data }) => {
  const getServingInfo = () => {
    if (data.food) {
      return `1 serving (${data.food})`;
    } else if (data.ingredients?.length) {
      return `Combined serving (${data.ingredients.join(' + ')})`;
    }
    return 'Serving size';
  };

  const getNutrient = (name: string): Nutrient | undefined => {
    return data.nutrients?.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
  };

  const calories = getNutrient('energy') || getNutrient('calories');
  const fat = getNutrient('total fat');
  const saturatedFat = getNutrient('saturated fat');
  const transFat = getNutrient('trans fat');
  const cholesterol = getNutrient('cholesterol');
  const sodium = getNutrient('sodium');
  const carbs = getNutrient('total carbohydrate') || getNutrient('carbohydrate');
  const fiber = getNutrient('dietary fiber');
  const sugars = getNutrient('sugars');
  const protein = getNutrient('protein');
  const vitaminD = getNutrient('vitamin d');
  const calcium = getNutrient('calcium');
  const iron = getNutrient('iron');
  const potassium = getNutrient('potassium');

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto w-full border-2 border-black">
      <div className="border-b-8 border-black pb-2 mb-4">
        <h2 className="text-2xl font-bold text-center mb-1">Nutrition Facts</h2>
        <p className="text-center text-sm">{getServingInfo()}</p>
      </div>

      <div className="border-b border-black pb-2 mb-3">
        <p className="text-right text-xs">Amount per serving</p>
      </div>

      <div className="border-b-8 border-black pb-2 mb-3">
        <div className="flex justify-between font-bold">
          <span>Calories</span>
          <span>{calories ? Math.round(calories.amount) : '0'}</span>
        </div>
      </div>

      <div className="text-right text-xs mb-1">% Daily Value*</div>

      <div className="mb-1">
        <div className="flex justify-between">
          <span className="font-bold">Total Fat</span>
          <span>{fat ? `${fat.amount.toFixed(1)}${fat.unit}` : '0g'}</span>
        </div>
        {saturatedFat && (
          <div className="ml-4">
            <span className="ml-2">Saturated Fat</span>
            <span className="float-right">
              {saturatedFat.amount.toFixed(1)}{saturatedFat.unit}
            </span>
          </div>
        )}
        {transFat && (
          <div className="ml-4">
            <span className="ml-2">Trans Fat</span>
            <span className="float-right">
              {transFat.amount.toFixed(1)}{transFat.unit}
            </span>
          </div>
        )}
      </div>

      <div className="mb-1">
        <div className="flex justify-between">
          <span className="font-bold">Cholesterol</span>
          <span>{cholesterol ? `${cholesterol.amount.toFixed(0)}${cholesterol.unit}` : '0mg'}</span>
        </div>
      </div>

      <div className="mb-1">
        <div className="flex justify-between">
          <span className="font-bold">Sodium</span>
          <span>{sodium ? `${sodium.amount.toFixed(0)}${sodium.unit}` : '0mg'}</span>
        </div>
      </div>

      <div className="mb-1">
        <div className="flex justify-between">
          <span className="font-bold">Total Carbohydrate</span>
          <span>{carbs ? `${carbs.amount.toFixed(1)}${carbs.unit}` : '0g'}</span>
        </div>
        {fiber && (
          <div className="ml-4">
            <span className="ml-2">Dietary Fiber</span>
            <span className="float-right">{fiber.amount.toFixed(1)}{fiber.unit}</span>
          </div>
        )}
        {sugars && (
          <div className="ml-4">
            <span className="ml-2">Total Sugars</span>
            <span className="float-right">{sugars.amount.toFixed(1)}{sugars.unit}</span>
          </div>
        )}
      </div>

      <div className="border-b border-black pb-2 mb-1">
        <div className="flex justify-between font-bold">
          <span>Protein</span>
          <span>{protein ? `${protein.amount.toFixed(1)}${protein.unit}` : '0g'}</span>
        </div>
      </div>

      <div className="border-b-4 border-black pb-2 mb-1">
        <div className="flex justify-between">
          <span>Vitamin D</span>
          <span>{vitaminD ? `${vitaminD.amount.toFixed(1)}${vitaminD.unit}` : '0mcg'}</span>
        </div>
        <div className="flex justify-between">
          <span>Calcium</span>
          <span>{calcium ? `${calcium.amount.toFixed(0)}${calcium.unit}` : '0mg'}</span>
        </div>
        <div className="flex justify-between">
          <span>Iron</span>
          <span>{iron ? `${iron.amount.toFixed(1)}${iron.unit}` : '0mg'}</span>
        </div>
        <div className="flex justify-between">
          <span>Potassium</span>
          <span>{potassium ? `${potassium.amount.toFixed(0)}${potassium.unit}` : '0mg'}</span>
        </div>
      </div>

      <p className="text-xs mt-2">
        * The % Daily Value tells you how much a nutrient in a serving of food contributes to a daily diet.
        2,000 calories a day is used for general nutrition advice.
      </p>
    </div>
  );
};

export default NutritionLabel;
