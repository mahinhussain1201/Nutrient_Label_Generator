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

const GROUP_META: Record<string, { icon: string; color: string; bg: string; bar: string }> = {
  'Calories':       { icon: '🔥', color: '#ea580c', bg: '#fff7ed', bar: '#fb923c' },
  'Macronutrients': { icon: '⚡', color: '#0284c7', bg: '#f0f9ff', bar: '#38bdf8' },
  'Fats':           { icon: '🫙', color: '#ca8a04', bg: '#fefce8', bar: '#facc15' },
  'Minerals':       { icon: '💎', color: '#7c3aed', bg: '#faf5ff', bar: '#a78bfa' },
  'Vitamins':       { icon: '🌿', color: '#15803d', bg: '#f0fdf4', bar: '#4ade80' },
};

// Very rough DV estimates for progress bars (not medical advice)
const DAILY_VALUES: Record<string, number> = {
  'Energy': 2000,
  'Protein': 50,
  'Total lipid (fat)': 78,
  'Carbohydrate, by difference': 275,
  'Fiber, total dietary': 28,
  'Sugars, total': 50,
  'Fatty acids, total saturated': 20,
  'Cholesterol': 300,
  'Calcium, Ca': 1300,
  'Iron, Fe': 18,
  'Sodium, Na': 2300,
  'Potassium, K': 4700,
  'Vitamin C, total ascorbic acid': 90,
  'Vitamin A, RAE': 900,
};

const formatNutrientName = (name: string): string => {
  return name
    .replace(/, total$/, '')
    .replace('Total lipid (fat)', 'Total Fat')
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

  const nutrientsByCategory = Object.entries(NUTRIENT_GROUPS).map(([category, nutrientNames]) => {
    const categoryNutrients = totals
      .filter(nutrient => nutrientNames.some(name => nutrient.name.includes(name)))
      .map(nutrient => ({
        ...nutrient,
        displayName: formatNutrientName(nutrient.name),
        dv: DAILY_VALUES[nutrient.name] ?? null,
      }));
    return { category, nutrients: categoryNutrients };
  }).filter(group => group.nutrients.length > 0);

  const calories = totals.find(n => n.name.includes('Energy'));

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '24px', padding: '28px 28px 24px',
        boxShadow: '0 8px 32px rgba(15,23,42,0.2)',
        color: '#fff', position: 'relative', overflow: 'hidden'
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(52,211,153,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-20px', right: '60px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(20,184,166,0.06)' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', position: 'relative' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>Nutrition Facts</p>
            <h2 style={{ margin: '0 0 16px', fontSize: '26px', fontWeight: '900', color: '#fff' }}>
              {ingredients.length} Ingredient{ingredients.length !== 1 ? 's' : ''}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ingredients.map((ingredient, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '20px', padding: '4px 12px', fontSize: '13px', color: '#e2e8f0', fontWeight: '500'
                }}>
                  <span style={{ fontWeight: '700', color: '#34d399' }}>{ingredient.amount}g</span>
                  {ingredient.name}
                </span>
              ))}
            </div>
          </div>

          {calories && (
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{
                background: 'linear-gradient(135deg, #34d399, #14b8a6)',
                borderRadius: '18px', padding: '16px 20px',
                boxShadow: '0 4px 16px rgba(20,184,166,0.35)'
              }}>
                <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</p>
                <p style={{ margin: '0 0 2px', fontSize: '34px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
                  {Math.round(calories.amount)}
                </p>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.75)' }}>calories</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nutrient group cards */}
      {nutrientsByCategory.map(({ category, nutrients }) => {
        const meta = GROUP_META[category] ?? { icon: '•', color: '#64748b', bg: '#f8fafc', bar: '#94a3b8' };
        return (
          <div key={category} style={{
            background: '#fff', borderRadius: '20px', overflow: 'hidden',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9'
          }}>
            {/* Group header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px 20px', background: meta.bg,
              borderBottom: `2px solid ${meta.bar}22`
            }}>
              <span style={{ fontSize: '18px' }}>{meta.icon}</span>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: meta.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {category}
              </h3>
            </div>

            {/* Nutrients */}
            <div style={{ padding: '8px 0' }}>
              {nutrients.map((nutrient, idx) => {
                const pct = nutrient.dv ? Math.min(100, (nutrient.amount / nutrient.dv) * 100) : null;
                const isLast = idx === nutrients.length - 1;
                return (
                  <div key={idx} style={{
                    padding: '12px 20px',
                    borderBottom: isLast ? 'none' : '1px solid #f8fafc',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pct !== null ? '8px' : 0 }}>
                      <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{nutrient.displayName}</span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                          {nutrient.unit === 'kcal'
                            ? Math.round(nutrient.amount)
                            : nutrient.amount < 1
                              ? nutrient.amount.toFixed(2)
                              : nutrient.amount.toFixed(1)}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
                          {nutrient.unit === 'kcal' ? 'cal' : nutrient.unit}
                        </span>
                        {pct !== null && (
                          <span style={{
                            fontSize: '11px', fontWeight: '700', padding: '2px 7px',
                            borderRadius: '10px', background: meta.bg, color: meta.color
                          }}>
                            {Math.round(pct)}% DV
                          </span>
                        )}
                      </div>
                    </div>
                    {pct !== null && (
                      <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: `linear-gradient(90deg, ${meta.bar}, ${meta.color})`,
                          borderRadius: '99px', transition: 'width 0.6s ease'
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Footer disclaimer */}
      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', textAlign: 'center', lineHeight: 1.6, padding: '0 8px' }}>
        * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
      </p>
    </div>
  );
}