import type { CalculatedNutrition } from '../utils/nutritionApi';

interface NutritionResultsProps {
  data: CalculatedNutrition;
}

const NUTRIENT_GROUPS = {
  'Calories': ['Energy'],
  'Macronutrients': [
    'Protein',
    'Total lipid (fat)',
    'Carbohydrate, by difference',
    'Fiber, total dietary',
    'Sugars, total',
  ],
  'Fats': [
    'Fatty acids, total saturated',
    'Cholesterol',
  ],
  'Minerals': [
    'Calcium, Ca',
    'Iron, Fe',
    'Sodium, Na',
    'Potassium, K',
  ],
  'Vitamins': [
    'Vitamin C, total ascorbic acid',
    'Vitamin A, RAE',
  ],
};

const formatNutrientName = (name: string): string => {
  return name
    .replace(/, total$/, '')
    .replace('total lipid (fat)', 'Total Fat')
    .replace('Carbohydrate, by difference', 'Total Carbohydrate')
    .replace('Fiber, total dietary', 'Dietary Fiber')
    .replace('Sugars, total', 'Sugars')
    .replace('Fatty acids, total saturated', 'Saturated Fat')
    .replace('Vitamin C, total ascorbic acid', 'Vitamin C')
    .replace('Vitamin A, RAE', 'Vitamin A');
};

export default function NutritionResults({ data }: NutritionResultsProps) {
  const { ingredients, totals } = data;
  
  // Group nutrients by category
  const nutrientsByCategory = Object.entries(NUTRIENT_GROUPS).map(([category, nutrientNames]) => {
    const categoryNutrients = totals
      .filter(nutrient => nutrientNames.some(name => nutrient.name.includes(name)))
      .map(nutrient => ({
        ...nutrient,
        displayName: formatNutrientName(nutrient.name),
      }));
      
    return {
      category,
      nutrients: categoryNutrients,
    };
  }).filter(group => group.nutrients.length > 0);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Nutrition Facts</h2>
        
        <div className="border-t border-b border-gray-200 py-2 mb-4">
          <h3 className="font-semibold text-gray-700">Ingredients</h3>
          <ul className="list-disc list-inside mt-1 text-gray-600">
            {ingredients.map((ingredient, index) => (
              <li key={index}>
                <span className="font-medium">{ingredient.amount}g</span> {ingredient.name}
              </li>
            ))}
          </ul>
        </div>
        
        {nutrientsByCategory.map(({ category, nutrients }) => (
          <div key={category} className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">{category}</h3>
            <div className="space-y-2">
              {nutrients.map((nutrient, idx) => (
                <div key={idx} className="flex justify-between items-center py-1">
                  <span className="text-gray-700">{nutrient.displayName}</span>
                  <div className="flex items-center">
                    <span className="font-medium">
                      {nutrient.amount.toFixed(1)}
                      <span className="text-sm text-gray-500 ml-1">
                        {nutrient.unit === 'kcal' ? 'cal' : nutrient.unit}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
          </p>
        </div>
      </div>
    </div>
  );
}
