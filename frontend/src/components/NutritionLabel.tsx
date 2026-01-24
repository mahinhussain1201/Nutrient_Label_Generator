import React from 'react';
import type { NutritionData, MultipleNutritionResponse } from '../utils/api';

interface NutritionLabelProps {
  data: NutritionData | MultipleNutritionResponse;
}

type Nutrient = {
  name: string;
  amount: number;
  unit: string;
  per_100g?: number;
};

const NutritionLabel: React.FC<NutritionLabelProps> = ({ data }) => {
  const isMultiple = 'ingredients' in data && Array.isArray(data.ingredients);

  const getServingInfo = () => {
    if (!isMultiple) {
      if ('ingredient' in data) {
        return `1 serving (${data.ingredient} - ${data.quantity_g}g)`;
      }
      return '';
    } else {
      const ingredients = data.ingredients.map(i => `${i.ingredient} (${i.quantity_g}g)`);
      return `Combined serving (${ingredients.join(' + ')})`;
    }
  };

  const getNutrient = (name: string, nutrients: Nutrient[]): Nutrient | undefined => {
    return nutrients.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
  };

  const getNutrientsToDisplay = () => {
    if (isMultiple) {
      return data.total_nutrients || [];
    }
    return data.nutrients || [];
  };
  const nutrients = getNutrientsToDisplay();

  const calories = getNutrient('energy', nutrients) || getNutrient('calories', nutrients);
  const fat = getNutrient('total fat', nutrients);
  const saturatedFat = getNutrient('saturated fat', nutrients);
  const transFat = getNutrient('trans fat', nutrients);
  const cholesterol = getNutrient('cholesterol', nutrients);
  const sodium = getNutrient('sodium', nutrients);
  const carbs = getNutrient('total carbohydrate', nutrients) || getNutrient('carbohydrate', nutrients);
  const fiber = getNutrient('dietary fiber', nutrients);
  const sugars = getNutrient('sugars', nutrients);
  const protein = getNutrient('protein', nutrients);
  const vitaminD = getNutrient('vitamin d', nutrients);
  const calcium = getNutrient('calcium', nutrients);
  const iron = getNutrient('iron', nutrients);
  const potassium = getNutrient('potassium', nutrients);


  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto w-full border-2 border-black">
      <div className="nutrition-facts">
        <header className="nutrition-header">
          <h2>Nutrition Facts</h2>
          <div className="serving-size">{getServingInfo()}</div>
        </header>

        <div className="divider"></div>

        <div className="calories">
          <div className="label">Calories</div>
          <div className="value">
            {calories ? Math.round(calories.amount) : '0'}
          </div>
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
