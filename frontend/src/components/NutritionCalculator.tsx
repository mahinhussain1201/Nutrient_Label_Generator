import { useState } from 'react';
import { searchMultipleIngredients, type MultipleNutritionResponse, type Nutrient, type NutritionData } from '../utils/api';
import NutritionLabel from './NutritionLabel';
import AutocompleteInput from './AutocompleteInput';

interface Ingredient {
  name: string;
  quantity: number;
}

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
    padding: '14px 18px',
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    width: '100%',
  };

  const focusStyle = { borderColor: '#34d399', background: '#fff', boxShadow: '0 0 0 4px rgba(52,211,153,0.12), 0 4px 12px rgba(0,0,0,0.04)' };
  const blurStyle = { borderColor: '#e2e8f0', background: '#f8fafc', boxShadow: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '4px', height: '14px', background: '#14b8a6', borderRadius: '4px' }} />
        <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Ingredient List
        </p>
      </div>

      {/* Ingredient rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {ingredients.map((ingredient, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Index badge */}
            <div style={{
              flexShrink: 0, width: '32px', height: '32px', borderRadius: '10px',
              background: '#f0fdfa',
              color: '#14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '800', border: '1px solid #ccfbf1',
            }}>
              {index + 1}
            </div>

            {/* Name input */}
            <div style={{ flexGrow: 1, position: 'relative' }}>
              <AutocompleteInput
                value={ingredient.name}
                onChange={value => handleIngredientChange(index, value)}
                onSelect={value => handleIngredientChange(index, value)}
                placeholder="e.g. skinless chicken breast…"
                style={inputStyle}
                focusStyle={focusStyle}
                blurStyle={blurStyle}
              />
            </div>

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={ingredient.quantity}
                  onChange={e => handleQuantityChange(index, e.target.value)}
                  min="1"
                  style={{ ...inputStyle, width: '84px', textAlign: 'center', padding: '14px 10px', fontWeight: '700' }}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => Object.assign(e.target.style, blurStyle)}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>g</span>
            </div>

            {/* Remove */}
            {ingredients.length > 1 ? (
              <button
                onClick={() => removeIngredient(index)}
                onMouseEnter={() => setHoveredRemove(index)}
                onMouseLeave={() => setHoveredRemove(null)}
                style={{
                  flexShrink: 0, width: '36px', height: '36px', border: 'none', cursor: 'pointer',
                  color: hoveredRemove === index ? '#ef4444' : '#cbd5e1',
                  background: hoveredRemove === index ? '#fef2f2' : 'transparent',
                  borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', transition: 'all 0.2s',
                }}
                title="Remove"
              >✕</button>
            ) : (
              <div style={{ width: '36px' }} />
            )}
          </div>
        ))}
      </div>

      {/* Actions row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
        <button
          onClick={addIngredient}
          onMouseEnter={() => setHoveredAdd(true)}
          onMouseLeave={() => setHoveredAdd(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', fontWeight: '700', color: '#0d9488',
            background: hoveredAdd ? '#f0fdfa' : 'transparent',
            border: 'none', cursor: 'pointer',
            padding: '10px 16px', borderRadius: '14px', transition: 'all 0.2s',
          }}
        >
          <div style={{
            width: '24px', height: '24px', borderRadius: '8px', background: '#ccfbf1',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#14b8a6'
          }}>+</div>
          Add Ingredient
        </button>

        <button
          onClick={calculateNutrition}
          disabled={loading}
          style={{
            padding: '14px 32px', borderRadius: '16px', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px', fontWeight: '800', letterSpacing: '0.01em', color: '#fff',
            background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #34d399, #14b8a6)',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(20,184,166,0.3)',
            transition: 'all 0.3s',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          {loading ? (
            <>
              <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Calculating…
            </>
          ) : (
            <>
              Calculate Totals
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </>
          )}
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
          background: '#fff', borderRadius: '24px',
          border: '1px solid #f1f5f9', boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
        }}>
          <div style={{ position: 'relative', width: '48px', height: '48px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid #d1fae5' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid transparent', borderTopColor: '#14b8a6', animation: 'spin 0.8s linear infinite' }} />
          </div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>Analyzing recipe nutrition…</p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Not found warning */}
          {results.not_found && results.not_found.length > 0 && (
            <div style={{
              display: 'flex', gap: '12px', alignItems: 'center',
              padding: '14px 18px', background: '#fffbeb',
              border: '1px solid #fde68a', color: '#92400e',
              borderRadius: '16px', fontSize: '13px',
            }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <strong>No data found for:</strong> {results.not_found.join(', ')}
            </div>
          )}

          {/* Total Nutrition Results */}
          <div style={{
            background: '#fff', borderRadius: '24px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
            padding: '28px',
          }}>
            <NutritionLabel data={results} />
          </div>

          {/* Per-Ingredient Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '4px', height: '18px', background: '#14b8a6', borderRadius: '4px' }} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Ingredient Breakdown</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {results.ingredients?.map((ingredient: NutritionData, idx: number) => (
                <div key={idx} style={{
                  background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{
                    padding: '16px 20px', borderBottom: '1px solid #f8fafc',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#fafffe',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #34d399, #14b8a6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '13px', fontWeight: '800',
                      }}>{idx + 1}</div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>
                          {ingredient.ingredient}
                        </h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{ingredient.quantity_g}g portion</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                    {ingredient.nutrients?.map((nutrient: Nutrient, nIdx: number) => {
                      const isCalorie = nutrient.name.includes('Energy');
                      return (
                        <div key={nIdx} style={{
                          background: isCalorie ? '#f0fdfa' : '#f8fafc',
                          borderRadius: '14px', padding: '12px 14px',
                          border: isCalorie ? '1.5px solid #ccfbf1' : '1.5px solid transparent',
                        }}>
                          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {nutrient.name.replace(', by difference', '').replace(' (fat)', '')}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                              {nutrient.amount < 1 ? nutrient.amount.toFixed(2) : Math.round(nutrient.amount)}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{nutrient.unit === 'kcal' ? 'cal' : nutrient.unit}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionCalculator;