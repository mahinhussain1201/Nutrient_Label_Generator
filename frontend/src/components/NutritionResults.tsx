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

const GROUP_META: Record<string, { color: string; bg: string; bar: string; border: string }> = {
  'Calories':       { color: '#c2410c', bg: '#fff7ed', bar: '#fb923c', border: '#fed7aa' },
  'Macronutrients': { color: '#0369a1', bg: '#f0f9ff', bar: '#38bdf8', border: '#bae6fd' },
  'Fats':           { color: '#a16207', bg: '#fefce8', bar: '#fbbf24', border: '#fde68a' },
  'Minerals':       { color: '#6d28d9', bg: '#faf5ff', bar: '#a78bfa', border: '#ddd6fe' },
  'Vitamins':       { color: '#15803d', bg: '#f0fdf4', bar: '#4ade80', border: '#bbf7d0' },
};

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
    <div style={{ fontFamily: "'DM Sans', 'Outfit', ui-sans-serif, system-ui, sans-serif", display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Header card ─────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        border: '1.5px solid #e2e8f0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orb */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', position: 'relative' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: '0 0 6px',
              fontSize: '10px',
              fontWeight: '800',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#94a3b8',
            }}>
              Nutrition Facts
            </p>
            <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
              {ingredients.length} Ingredient{ingredients.length !== 1 ? 's' : ''}
            </h2>

            {/* Ingredient chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {ingredients.map((ingredient, i) => (
                <span key={i} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#f0fdf9',
                  border: '1px solid #a7f3d0',
                  borderRadius: '100px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  color: '#334155',
                  fontWeight: '500',
                }}>
                  <span style={{ fontWeight: '700', color: '#059669' }}>{ingredient.amount}g</span>
                  {ingredient.name}
                </span>
              ))}
            </div>
          </div>

          {/* Calories badge */}
          {calories && (
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '18px',
                padding: '16px 20px',
                boxShadow: '0 4px 16px rgba(5,150,105,0.25)',
                minWidth: '80px',
              }}>
                <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</p>
                <p style={{ margin: '0 0 2px', fontSize: '32px', fontWeight: '900', color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {Math.round(calories.amount)}
                </p>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>cal</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Nutrient group cards ─────────────────────────────── */}
      {nutrientsByCategory.map(({ category, nutrients }) => {
        const meta = GROUP_META[category] ?? { color: '#64748b', bg: '#f8fafc', bar: '#94a3b8', border: '#e2e8f0' };
        return (
          <div key={category} style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: `1.5px solid ${meta.border}`,
            overflow: 'hidden',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          }}>
            {/* Group header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '12px 20px',
              background: meta.bg,
              borderBottom: `1px solid ${meta.border}`,
            }}>
              {/* <span style={{ fontSize: '16px', lineHeight: 1 }}>{meta.icon}</span> */}
              <h3 style={{
                margin: 0,
                fontSize: '11px',
                fontWeight: '800',
                color: meta.color,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {category}
              </h3>
            </div>

            {/* Nutrient rows */}
            <div>
              {nutrients.map((nutrient, idx) => {
                const pct = nutrient.dv ? Math.min(100, (nutrient.amount / nutrient.dv) * 100) : null;
                const isLast = idx === nutrients.length - 1;
                return (
                  <div key={idx} style={{
                    padding: '13px 20px',
                    borderBottom: isLast ? 'none' : `1px solid ${meta.bg}`,
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: pct !== null ? '8px' : 0,
                      gap: '12px',
                    }}>
                      {/* Name */}
                      <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500', flex: 1 }}>
                        {nutrient.displayName}
                      </span>

                      {/* Amount + unit + DV% */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                          {nutrient.unit === 'kcal'
                            ? Math.round(nutrient.amount)
                            : nutrient.amount < 1
                              ? nutrient.amount.toFixed(2)
                              : nutrient.amount.toFixed(1)}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                          {nutrient.unit === 'kcal' ? 'cal' : nutrient.unit}
                        </span>
                        {pct !== null && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '100px',
                            background: meta.bg,
                            color: meta.color,
                            border: `1px solid ${meta.border}`,
                            letterSpacing: '0.02em',
                          }}>
                            {Math.round(pct)}% DV
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {pct !== null && (
                      <div style={{
                        height: '5px',
                        background: '#f1f5f9',
                        borderRadius: '99px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${meta.bar}, ${meta.color})`,
                          borderRadius: '99px',
                          transition: 'width 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
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

      {/* ── Disclaimer ───────────────────────────────────────── */}
      <p style={{
        margin: 0,
        fontSize: '11px',
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 1.7,
        padding: '0 8px 4px',
        letterSpacing: '0.01em',
      }}>
        * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
      </p>
    </div>
  );
}