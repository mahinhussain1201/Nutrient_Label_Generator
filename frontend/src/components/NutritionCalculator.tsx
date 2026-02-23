import { useState } from 'react';
import { searchMultipleIngredients, type MultipleNutritionResponse } from './utils/api';

interface Ingredient {
  name: string;
  quantity: number;
}

const fmt = (num: number) => parseFloat(String(num)).toFixed(2);

const nutrientAccent = (name: string) => {
  if (name.includes('Calorie') || name.includes('Energy')) return '#f97316';
  if (name.includes('Protein')) return '#3b82f6';
  if (name.includes('Fat')) return '#eab308';
  if (name.includes('Carb')) return '#22c55e';
  return '#8b5cf6';
};

const NutritionCalculator = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: 100 }]);
  const [results, setResults] = useState<MultipleNutritionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredAdd, setHoveredAdd] = useState(false);
  const [hoveredRemove, setHoveredRemove] = useState<number | null>(null);

  const handleIngredientChange = (index: number, value: string) => {
    const next = [...ingredients];
    next[index].name = value;
    setIngredients(next);
  };

  const handleQuantityChange = (index: number, value: string) => {
    const next = [...ingredients];
    next[index].quantity = Number(value);
    setIngredients(next);
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: 100 }]);

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const calculateNutrition = async () => {
    const payload = ingredients
      .filter(ing => ing.name.trim() !== '')
      .map(ing => ({ name: ing.name, quantity_g: ing.quantity || 0 }));

    if (payload.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await searchMultipleIngredients(payload);
      setResults(data as MultipleNutritionResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate nutrition. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '12px 16px',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'all 0.15s',
    width: '100%',
  };

  const focusStyle = { borderColor: '#34d399', background: '#fff', boxShadow: '0 0 0 3px rgba(52,211,153,0.15)' };
  const blurStyle = { borderColor: '#e2e8f0', background: '#f8fafc', boxShadow: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Section label */}
      <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#cbd5e1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Ingredients
      </p>

      {/* Ingredient rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {ingredients.map((ingredient, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Index badge */}
            <div style={{
              flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ecfdf5, #ccfbf1)',
              color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700',
            }}>
              {index + 1}
            </div>

            {/* Name input */}
            <input
              type="text"
              value={ingredient.name}
              onChange={e => handleIngredientChange(index, e.target.value)}
              placeholder="e.g. chicken breast, brown rice…"
              style={{ ...inputStyle, flexGrow: 1 }}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => Object.assign(e.target.style, blurStyle)}
            />

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <input
                type="number"
                value={ingredient.quantity}
                onChange={e => handleQuantityChange(index, e.target.value)}
                min="1"
                style={{ ...inputStyle, width: '72px', textAlign: 'center', padding: '12px 8px', fontWeight: '600' }}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, blurStyle)}
              />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>g</span>
            </div>

            {/* Remove */}
            {ingredients.length > 1 ? (
              <button
                onClick={() => removeIngredient(index)}
                onMouseEnter={() => setHoveredRemove(index)}
                onMouseLeave={() => setHoveredRemove(null)}
                style={{
                  flexShrink: 0, width: '32px', height: '32px', border: 'none', cursor: 'pointer',
                  color: hoveredRemove === index ? '#ef4444' : '#cbd5e1',
                  background: hoveredRemove === index ? '#fef2f2' : 'transparent',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', transition: 'all 0.15s',
                }}
                title="Remove"
              >✕</button>
            ) : (
              <div style={{ width: '32px' }} />
            )}
          </div>
        ))}
      </div>

      {/* Actions row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
        <button
          onClick={addIngredient}
          onMouseEnter={() => setHoveredAdd(true)}
          onMouseLeave={() => setHoveredAdd(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '14px', fontWeight: '600', color: '#14b8a6',
            background: hoveredAdd ? '#f0fdfa' : 'transparent',
            border: 'none', cursor: 'pointer',
            padding: '8px 12px', borderRadius: '10px', transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Add Ingredient
        </button>

        <button
          onClick={calculateNutrition}
          disabled={loading}
          style={{
            padding: '12px 28px', borderRadius: '14px', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px', fontWeight: '700', letterSpacing: '0.01em', color: '#fff',
            background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #34d399, #14b8a6)',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(20,184,166,0.35)',
            transition: 'all 0.2s',
          }}
        >
          {loading ? '⏳ Calculating…' : 'Calculate Nutrition →'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', gap: '14px', alignItems: 'flex-start',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '18px', padding: '18px 20px',
        }}>
          <div style={{
            flexShrink: 0, width: '32px', height: '32px', borderRadius: '10px',
            background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>⚠️</div>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '800', color: '#991b1b' }}>Unable to calculate</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '14px', padding: '48px',
        }}>
          <div style={{ position: 'relative', width: '48px', height: '48px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid #d1fae5' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid transparent', borderTopColor: '#14b8a6', animation: 'spin 0.8s linear infinite' }} />
          </div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>Analyzing nutritional data…</p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Not found warning */}
          {results.not_found && results.not_found.length > 0 && (
            <div style={{
              padding: '14px 18px', background: '#fffbeb',
              border: '1px solid #fde68a', color: '#92400e',
              borderRadius: '16px', fontSize: '13px',
            }}>
              <strong>⚠️ No data found for:</strong> {results.not_found.join(', ')}
            </div>
          )}

          {/* Total Nutrition */}
          <div style={{
            borderRadius: '20px', border: '1px solid #f1f5f9',
            boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden',
          }}>
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#fafffe',
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Total Nutrition</h3>
              <span style={{
                fontSize: '11px', fontWeight: '700', color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px',
              }}>All Ingredients</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Nutrient', 'Amount', 'Unit'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 24px', fontSize: '11px', fontWeight: '700',
                      color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em',
                      textAlign: i === 0 ? 'left' : 'right',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.total_nutrients?.map((n: any, idx: number) => (
                  <tr key={idx} style={{ borderTop: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600', color: nutrientAccent(n.name) }}>{n.name}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{fmt(n.amount)}</td>
                    <td style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>{n.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Per-Ingredient Breakdown */}
          <div style={{
            borderRadius: '20px', border: '1px solid #f1f5f9',
            boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden',
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafffe' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Breakdown by Ingredient</h3>
            </div>
            {results.ingredients?.map((ingredient: any, idx: number) => (
              <div key={idx} style={{ padding: '20px 24px', borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #34d399, #14b8a6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '13px', fontWeight: '800',
                  }}>{idx + 1}</div>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>{ingredient.ingredient}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{ingredient.quantity_g}g serving</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                  {ingredient.nutrients?.map((nutrient: any, nIdx: number) => (
                    <div key={nIdx} style={{ background: '#f8fafc', borderRadius: '14px', padding: '12px 14px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{nutrient.name}</p>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: nutrientAccent(nutrient.name) }}>
                        {fmt(nutrient.amount)}
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500', marginLeft: '4px' }}>{nutrient.unit}</span>
                      </p>
                      {nutrient.per_100g && (
                        <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#a78bfa' }}>{fmt(nutrient.per_100g)} / 100g</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionCalculator;