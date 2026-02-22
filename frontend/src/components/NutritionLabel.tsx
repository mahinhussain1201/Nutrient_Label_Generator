import React from 'react';
import type { NutritionData, MultipleNutritionResponse } from '../utils/api';

interface NutritionLabelProps {
  data: NutritionData | MultipleNutritionResponse;
}

// Nutrient categorization & styling
const NUTRIENT_META: Record<string, { color: string; bg: string; icon: string }> = {
  'Energy':                           { color: '#ea580c', bg: '#fff7ed', icon: '🔥' },
  'Protein':                          { color: '#0284c7', bg: '#f0f9ff', icon: '💪' },
  'Total lipid':                      { color: '#ca8a04', bg: '#fefce8', icon: '🫙' },
  'Carbohydrate':                     { color: '#16a34a', bg: '#f0fdf4', icon: '🌾' },
  'Fiber':                            { color: '#15803d', bg: '#f0fdf4', icon: '🌿' },
  'Sugars':                           { color: '#db2777', bg: '#fdf2f8', icon: '🍬' },
  'Fatty acids':                      { color: '#b45309', bg: '#fffbeb', icon: '🧈' },
  'Cholesterol':                      { color: '#9333ea', bg: '#faf5ff', icon: '❤️' },
  'Sodium':                           { color: '#0891b2', bg: '#ecfeff', icon: '🧂' },
  'Calcium':                          { color: '#7c3aed', bg: '#faf5ff', icon: '🦴' },
  'Iron':                             { color: '#b91c1c', bg: '#fef2f2', icon: '⚙️' },
  'Potassium':                        { color: '#065f46', bg: '#ecfdf5', icon: '🍌' },
  'Vitamin C':                        { color: '#d97706', bg: '#fffbeb', icon: '🍊' },
  'Vitamin A':                        { color: '#c2410c', bg: '#fff7ed', icon: '🥕' },
};

const getMeta = (name: string) => {
  for (const [key, val] of Object.entries(NUTRIENT_META)) {
    if (name.includes(key)) return val;
  }
  return { color: '#475569', bg: '#f8fafc', icon: '•' };
};

const formatName = (name: string): string =>
  name
    .replace('Total lipid (fat)', 'Total Fat')
    .replace('Carbohydrate, by difference', 'Carbohydrate')
    .replace('Fiber, total dietary', 'Dietary Fiber')
    .replace('Sugars, total', 'Sugars')
    .replace('Fatty acids, total saturated', 'Saturated Fat')
    .replace('Vitamin C, total ascorbic acid', 'Vitamin C')
    .replace('Vitamin A, RAE', 'Vitamin A')
    .replace(/, total$/, '');

const formatAmount = (amount: number, unit: string): string => {
  const val = unit === 'kcal'
    ? Math.round(amount)
    : amount < 1
      ? amount.toFixed(2)
      : amount.toFixed(1);
  return `${val} ${unit === 'kcal' ? 'cal' : unit}`;
};

// Rough daily values for the mini progress bars
const DV: Record<string, number> = {
  'Energy': 2000, 'Protein': 50, 'Total lipid': 78,
  'Carbohydrate': 275, 'Fiber': 28, 'Sugars': 50,
  'Fatty acids': 20, 'Cholesterol': 300, 'Sodium': 2300,
  'Calcium': 1300, 'Iron': 18, 'Potassium': 4700,
  'Vitamin C': 90, 'Vitamin A': 900,
};

const getDV = (name: string, amount: number): number | null => {
  for (const [key, dv] of Object.entries(DV)) {
    if (name.includes(key)) return Math.min(100, Math.round((amount / dv) * 100));
  }
  return null;
};

const NutritionLabel: React.FC<NutritionLabelProps> = ({ data }) => {
  const isMultiple = 'ingredients' in data && Array.isArray((data as MultipleNutritionResponse).ingredients);
  const multiData = isMultiple ? (data as MultipleNutritionResponse) : null;
  const nutrientList = isMultiple
    ? multiData!.total_nutrients ?? []
    : (data as NutritionData).nutrients ?? [];

  const calories = nutrientList.find(n => n.name.includes('Energy'));

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: '22px 22px 0 0', padding: '24px 24px 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(52,211,153,0.07)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', position: 'relative' }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b' }}>
              {isMultiple ? 'Recipe Totals' : 'Single Ingredient'}
            </p>
            <h1 style={{ margin: '0 0 14px', fontSize: '24px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em' }}>
              Nutrition Facts
            </h1>
            {isMultiple && multiData!.ingredients && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {multiData!.ingredients.map((ing, i) => (
                  <span key={i} style={{
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)',
                    borderRadius: '20px', padding: '3px 10px', fontSize: '12px', color: '#cbd5e1', fontWeight: '500'
                  }}>
                    <span style={{ color: '#34d399', fontWeight: '700' }}>{ing.quantity_g}g</span>{' '}
                    {ing.ingredient ?? ing.name}
                  </span>
                ))}
              </div>
            )}
            {!isMultiple && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)',
                borderRadius: '20px', padding: '4px 12px', fontSize: '13px', color: '#94a3b8'
              }}>
                <span style={{ color: '#94a3b8', fontWeight: '600' }}>Serving size:</span>
                <span style={{ color: '#e2e8f0', fontWeight: '700' }}>100g</span>
              </span>
            )}
          </div>

          {calories && (
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, #34d399, #14b8a6)',
                borderRadius: '16px', padding: '14px 18px',
                boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
              }}>
                <p style={{ margin: '0 0 1px', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Calories</p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
                  {Math.round(calories.amount)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nutrient list */}
      <div style={{ background: '#fff', borderRadius: '0 0 22px 22px', overflow: 'hidden', border: '1px solid #f1f5f9', borderTop: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.07)' }}>

        {/* Column headers */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 20px', background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nutrient</span>
          <div style={{ display: 'flex', gap: '32px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Amount</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', width: '52px', textAlign: 'right' }}>% DV</span>
          </div>
        </div>

        {nutrientList.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            No nutrient data available
          </div>
        ) : (
          nutrientList.map((nutrient, index) => {
            const meta = getMeta(nutrient.name);
            const dv = getDV(nutrient.name, nutrient.amount);
            const isLast = index === nutrientList.length - 1;
            const isCalorie = nutrient.name.includes('Energy');
            return (
              <div key={index} style={{
                borderBottom: isLast ? 'none' : '1px solid #f8fafc',
                background: isCalorie ? '#f0fdf4' : '#fff',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => { if (!isCalorie) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!isCalorie) (e.currentTarget as HTMLElement).style.background = '#fff'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 20px' }}>
                  {/* Name + icon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: meta.bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '14px', flexShrink: 0,
                    }}>{meta.icon}</div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {formatName(nutrient.name)}
                    </span>
                  </div>

                  {/* Amount + DV */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: meta.color }}>
                      {formatAmount(nutrient.amount, nutrient.unit)}
                    </span>
                    <div style={{ width: '52px', textAlign: 'right' }}>
                      {dv !== null ? (
                        <span style={{
                          fontSize: '12px', fontWeight: '700', padding: '2px 8px',
                          borderRadius: '10px', background: meta.bg, color: meta.color,
                          whiteSpace: 'nowrap',
                        }}>{dv}%</span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#cbd5e1' }}>—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {dv !== null && (
                  <div style={{ padding: '0 20px 10px 58px' }}>
                    <div style={{ height: '3px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${dv}%`,
                        background: `linear-gradient(90deg, ${meta.bg === '#f8fafc' ? '#94a3b8' : meta.color}88, ${meta.color})`,
                        borderRadius: '99px',
                      }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Footer */}
        <div style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.6 }}>
            * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NutritionLabel;