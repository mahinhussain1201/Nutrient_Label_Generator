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

  useEffect(() => {
    const saved = localStorage.getItem('recipe_ingredients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setIngredients(parsed);
      } catch (e) {
        console.error('Failed to load saved recipe:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recipe_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  const handleIngredientChange = (index: number, value: string) => {
    const next = [...ingredients];
    next[index].name = value;
    setIngredients(next);
    if (invalidRows[index]) setInvalidRows(prev => ({ ...prev, [index]: false }));
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
      if (data.not_found && data.not_found.length > 0) {
        setError('Some ingredients could not be matched. Please resolve the highlighted rows below.');
        setResults(null);
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
    padding: '13px 18px',
    background: '#f8fafb',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
    width: '100%',
    fontFamily: 'inherit',
  };

  const focusStyle = {
    borderColor: '#059669',
    background: '#ffffff',
    boxShadow: '0 0 0 3px rgba(5,150,105,0.1)',
  };
  const blurStyle = {
    borderColor: '#e2e8f0',
    background: '#f8fafb',
    boxShadow: 'none',
  };

  return (
    <div className="calculator-container" style={{
      background: '#ffffff',
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
      border: '1.5px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      boxSizing: 'border-box',
      fontFamily: "'DM Sans', 'Outfit', ui-sans-serif, system-ui, sans-serif",
    }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: 'linear-gradient(180deg, #10b981, #059669)', borderRadius: '4px' }} />
          <h2 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Recipe Builder
          </h2>
        </div>

        {(ingredients.length > 1 || ingredients[0].name) && (
          <button
            onClick={clearAll}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid #fecaca',
              background: '#fff',
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.borderColor = '#fca5a5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 4.5 14 11.5 14 13 6" />
              <path d="M1 4h14M6 4V2h4v2" />
            </svg>
            Clear Recipe
          </button>
        )}
      </div>

      {/* ── Ingredient rows ──────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {ingredients.map((ingredient, index) => (
          <React.Fragment key={index}>
            <div className="ingredient-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

              {/* Index badge */}
              <div style={{
                flexShrink: 0,
                width: '34px', height: '34px',
                borderRadius: '10px',
                background: '#f0fdf9',
                border: '1px solid #a7f3d0',
                color: '#059669',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '800',
              }}>
                {index + 1}
              </div>

              {/* Name input */}
              <div className="name-input-wrapper" style={{ flexGrow: 1, position: 'relative' }}>
                <AutocompleteInput
                  value={ingredient.name}
                  onChange={value => handleIngredientChange(index, value)}
                  onSelect={value => handleIngredientChange(index, value)}
                  onSearch={() => handleRowSearch(index)}
                  isLoading={rowLoading[index]}
                  isInvalid={invalidRows[index]}
                  hideSuggestions={!!disambiguationOptions[index]?.length}
                  placeholder="e.g. rice, chicken breast…"
                  style={{ ...inputStyle, paddingRight: '48px', borderRadius: '14px' }}
                  focusStyle={focusStyle}
                  blurStyle={blurStyle}
                />
              </div>

              {/* Quantity */}
              <div className="quantity-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
                <input
                  type="number"
                  className="quantity-input"
                  value={ingredient.quantity}
                  onChange={e => handleQuantityChange(index, e.target.value)}
                  min="1"
                  style={{
                    ...inputStyle,
                    width: '82px',
                    textAlign: 'center',
                    padding: '13px 10px',
                    fontWeight: '700',
                    borderRadius: '14px',
                  }}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => Object.assign(e.target.style, blurStyle)}
                />
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.04em' }}>g</span>
              </div>

              {/* Remove */}
              {ingredients.length > 1 ? (
                <button
                  onClick={() => removeIngredient(index)}
                  onMouseEnter={() => setHoveredRemove(index)}
                  onMouseLeave={() => setHoveredRemove(null)}
                  style={{
                    flexShrink: 0,
                    width: '36px', height: '36px',
                    border: 'none',
                    cursor: 'pointer',
                    color: hoveredRemove === index ? '#ef4444' : '#cbd5e1',
                    background: hoveredRemove === index ? '#fef2f2' : 'transparent',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  title="Remove"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ) : (
                <div style={{ width: '36px' }} />
              )}
            </div>

            {/* Inline disambiguation */}
            {disambiguationOptions[index] && (
              <div style={{ marginLeft: '46px', animation: 'nc-fadein 0.25s ease' }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  padding: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    padding: '0 4px',
                  }}>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Select a match
                    </p>
                    <button
                      onClick={() => setDisambiguationOptions(prev => { const n = { ...prev }; delete n[index]; return n; })}
                      style={{
                        background: 'none', border: 'none', color: '#94a3b8',
                        cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                        padding: '2px 6px', borderRadius: '6px', fontFamily: 'inherit',
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {disambiguationOptions[index].slice(0, 8).map((choice, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleRowSelect(index, choice)}
                        style={{
                          textAlign: 'left',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid #f1f5f9',
                          background: '#f8fafc',
                          fontSize: '13px', fontWeight: '500', color: '#334155',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#f0fdf9';
                          e.currentTarget.style.borderColor = '#a7f3d0';
                          e.currentTarget.style.color = '#065f46';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.borderColor = '#f1f5f9';
                          e.currentTarget.style.color = '#334155';
                        }}
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

      {/* ── Actions row ──────────────────────────────────────── */}
      <div className="calculator-actions" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '24px',
        borderTop: '1px solid #f1f5f9',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        {/* Add ingredient */}
        <button
          className="add-ingredient-btn"
          onClick={addIngredient}
          onMouseEnter={() => setHoveredAdd(true)}
          onMouseLeave={() => setHoveredAdd(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '14px', fontWeight: '700', color: '#059669',
            background: hoveredAdd ? '#f0fdf9' : '#f8fafc',
            border: `1.5px solid ${hoveredAdd ? '#a7f3d0' : '#e2e8f0'}`,
            cursor: 'pointer',
            padding: '11px 20px',
            borderRadius: '14px',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
        >
          <div style={{
            width: '22px', height: '22px',
            borderRadius: '7px',
            background: hoveredAdd ? '#10b981' : '#e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '16px', lineHeight: 1,
            transition: 'background 0.2s ease',
            fontWeight: '700',
          }}>+</div>
          Add Ingredient
        </button>

        {/* Calculate */}
        <button
          className="calculate-btn"
          onClick={calculateNutrition}
          disabled={loading}
          style={{
            minHeight: '52px',
            padding: '0 36px',
            borderRadius: '16px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px', fontWeight: '800',
            letterSpacing: '0.01em', color: '#fff',
            background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(5,150,105,0.3)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(5,150,105,0.35)';
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(5,150,105,0.3)';
            }
          }}
        >
          {loading ? (
            <svg className="nc-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          {loading ? 'Analyzing Recipe…' : 'Analyze Recipe Nutrition'}
        </button>
      </div>

      {/* ── Error ────────────────────────────────────────────── */}
      {error && (
        <div style={{
          display: 'flex', gap: '14px', alignItems: 'flex-start',
          background: '#fef2f2',
          border: '1.5px solid #fecaca',
          borderRadius: '16px',
          padding: '18px 20px',
          animation: 'nc-fadein 0.3s ease',
        }}>
          <div style={{
            flexShrink: 0, width: '34px', height: '34px', borderRadius: '10px',
            background: '#fee2e2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="8" fill="#fca5a5" />
              <path d="M8 4.5v4M8 10.5v.5" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '800', color: '#991b1b' }}>Unable to calculate</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c', lineHeight: 1.55 }}>{error}</p>
          </div>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────── */}
      {results && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Not-found warning */}
          {results.not_found && results.not_found.length > 0 && (
            <div style={{
              display: 'flex', gap: '10px', alignItems: 'center',
              padding: '13px 16px',
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              color: '#92400e',
              borderRadius: '14px',
              fontSize: '13px', fontWeight: '600',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#fde68a" />
                <path d="M8 4.5v4M8 10.5v.5" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span><strong>No data for:</strong> {results.not_found.join(', ')}</span>
            </div>
          )}

          {/* Total nutrition label */}
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            padding: '28px',
          }}>
            <NutritionLabel data={results} showAlert={showAlert} />
          </div>

          {/* Per-ingredient breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '3px', height: '14px', background: 'linear-gradient(180deg, #06b6d4, #0284c7)', borderRadius: '4px' }} />
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>
                Ingredient Breakdown
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              {results.ingredients?.map((ingredient: NutritionData, idx: number) => (
                <div key={idx} style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#a7f3d0';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.03)';
                  }}
                >
                  {/* Ingredient header */}
                  <div style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#fafffe',
                  }}>
                    <div style={{
                      width: '30px', height: '30px',
                      borderRadius: '9px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '12px', fontWeight: '800',
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>
                        {ingredient.ingredient}
                      </h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                        {ingredient.quantity_g}g portion
                      </p>
                    </div>
                  </div>

                  {/* Nutrient grid */}
                  <div style={{
                    padding: '14px 16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '8px',
                  }}>
                    {ingredient.nutrients?.map((nutrient: Nutrient, nIdx: number) => {
                      const isCalorie = nutrient.name.includes('Energy');
                      return (
                        <div key={nIdx} style={{
                          background: isCalorie ? '#f0fdf9' : '#f8fafc',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          border: isCalorie ? '1px solid #a7f3d0' : '1px solid #f1f5f9',
                        }}>
                          <p style={{
                            margin: '0 0 4px',
                            fontSize: '10px',
                            color: '#94a3b8',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            {nutrient.name.replace(', by difference', '').replace(' (fat)', '')}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                            <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                              {nutrient.amount < 1 ? nutrient.amount.toFixed(2) : Math.round(nutrient.amount)}
                            </span>
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>
                              {nutrient.unit === 'kcal' ? 'cal' : nutrient.unit}
                            </span>
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
        @keyframes nc-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nc-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .nc-spin { animation: nc-spin 0.75s linear infinite; }
      `}</style>
    </div>
  );
};

export default NutritionCalculator;