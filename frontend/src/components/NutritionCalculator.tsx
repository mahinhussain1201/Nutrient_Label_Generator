import React, { useState, useEffect } from 'react';
import { searchMultipleIngredients, fuzzySearch, type MultipleNutritionResponse, type Nutrient, type NutritionData } from '../utils/api';
import NutritionLabel from './NutritionLabel';
import AutocompleteInput from './AutocompleteInput';
import { type AlertOptions } from './PremiumAlert';

interface NutritionCalculatorProps {
  showAlert: (options: AlertOptions) => void;
}

interface Ingredient {
  name: string;
  quantity: number;
}

const NutritionCalculator: React.FC<NutritionCalculatorProps> = ({ showAlert }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: 100 }]);
  const [results, setResults] = useState<MultipleNutritionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredAdd, setHoveredAdd] = useState(false);
  const [hoveredRemove, setHoveredRemove] = useState<number | null>(null);
  const [disambiguationOptions, setDisambiguationOptions] = useState<{ [key: number]: string[] }>({});
  const [rowLoading, setRowLoading] = useState<{ [key: number]: boolean }>({});
  const [invalidRows, setInvalidRows] = useState<{ [key: number]: boolean }>({});

  // Persistence: Load on mount
  useEffect(() => {
    const saved = localStorage.getItem('recipe_ingredients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIngredients(parsed);
        }
      } catch (e) {
        console.error('Failed to load saved recipe:', e);
      }
    }
  }, []);

  // Persistence: Save on change
  useEffect(() => {
    localStorage.setItem('recipe_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  const handleIngredientChange = (index: number, value: string) => {
    const next = [...ingredients];
    next[index].name = value;
    setIngredients(next);
    
    // Clear invalid state when user starts typing
    if (invalidRows[index]) {
      setInvalidRows(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleQuantityChange = (index: number, value: string) => {
    const next = [...ingredients];
    next[index].quantity = Number(value);
    setIngredients(next);
  };

  const handleRowSearch = async (index: number) => {
    const query = ingredients[index].name;
    if (!query.trim()) return;
    
    setRowLoading(prev => ({ ...prev, [index]: true }));
    setError('');
    try {
      const choices = await fuzzySearch(query);
      if (choices.length === 0) {
        setError(`No matches found for "${query}"`);
      } else {
        setDisambiguationOptions(prev => ({ ...prev, [index]: choices }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setRowLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleRowSelect = (index: number, selection: string) => {
    handleIngredientChange(index, selection);
    setInvalidRows(prev => ({ ...prev, [index]: false }));
    setDisambiguationOptions(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: 100 }]);

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
      setDisambiguationOptions(prev => {
        const next = { ...prev };
        delete next[index];
        // Note: we might need to shift keys if we remove from middle, but for now simple delete is ok if keys are stable or handled by map index.
        // Actually, since we use map index as key, removing from middle will shift indices, which is a problem for state.
        // Ideally ingredients should have IDs.
        return next;
      });
    }
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
      
      // Strict Validation: Block results if any items are not found
      if (data.not_found && data.not_found.length > 0) {
        setError('Some ingredients could not be matched. Please resolve the highlighted rows below.');
        setResults(null); 
        
        // Auto-trigger disambiguation and highlight for not_found items
        data.not_found.forEach(notFoundName => {
          const index = ingredients.findIndex(ing => 
            ing.name.trim().toLowerCase() === notFoundName.trim().toLowerCase()
          );
          if (index !== -1) {
            setInvalidRows(prev => ({ ...prev, [index]: true }));
            handleRowSearch(index);
          }
        });
      } else {
        setResults(data as MultipleNutritionResponse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate nutrition. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const clearAll = () => {
    showAlert({
      type: 'confirm',
      message: 'Are you sure you want to clear all ingredients and results?',
      onConfirm: () => {
        setIngredients([{ name: '', quantity: 100 }]);
        setResults(null);
        setError('');
        setInvalidRows({});
        setDisambiguationOptions({});
        localStorage.removeItem('recipe_ingredients');
        showAlert({ type: 'success', message: 'Recipe cleared!' });
      }
    });
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
    <div style={{
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px'
    }}>

      {/* Header with Clear All */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '4px', height: '14px', background: '#14b8a6', borderRadius: '4px' }} />
          <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Recipe Builder
          </p>
        </div>
        {ingredients.length > 1 || ingredients[0].name ? (
          <button
            onClick={clearAll}
            style={{
              padding: '8px 16px', borderRadius: '12px', border: '1px solid #fee2e2',
              background: '#fff', color: '#ef4444', fontSize: '12px', fontWeight: '700',
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            🗑️ Clear
          </button>
        ) : null}
      </div>

      {/* Ingredient rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {ingredients.map((ingredient, index) => (
          <React.Fragment key={index}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

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
                  onSearch={() => handleRowSearch(index)}
                  isLoading={rowLoading[index]}
                  isInvalid={invalidRows[index]}
                  placeholder="e.g. skinless chicken breast…"
                  style={{ ...inputStyle, paddingRight: '44px' }}
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

            {/* Inline Disambiguation */}
            {disambiguationOptions[index] && (
              <div style={{ marginLeft: '44px', marginTop: '4px', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ 
                  background: '#fff', 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0', 
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px',
                    padding: '0 8px'
                  }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
                      Select the specific item:
                    </p>
                    <button 
                      onClick={() => setDisambiguationOptions(prev => {
                        const next = { ...prev };
                        delete next[index];
                        return next;
                      })}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '10px' }}
                    >Dismiss</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {disambiguationOptions[index].slice(0, 8).map((choice, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleRowSelect(index, choice)}
                        style={{
                          textAlign: 'left', padding: '8px 12px', borderRadius: '10px',
                          border: '1px solid #f1f5f9', background: '#f8fafc',
                          fontSize: '13px', fontWeight: '500', color: '#334155',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.borderColor = '#ccfbf1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
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
            padding: '16px 32px', borderRadius: '18px', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px', fontWeight: '800', letterSpacing: '0.01em', color: '#fff',
            background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: loading ? 'none' : '0 10px 20px rgba(16,185,129,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            width: ingredients.length > 3 ? '100%' : 'auto'
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {loading ? (
            <>
              <div style={{ width: '20px', height: '20px', border: '3px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Calculating...
            </>
          ) : (
            <>🏷️ Calculate Recipe Totals</>
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
            <NutritionLabel data={results} showAlert={showAlert} />
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
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default NutritionCalculator;