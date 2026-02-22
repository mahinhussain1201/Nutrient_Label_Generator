import React, { useState } from 'react';
import { searchNutrition, searchMultipleIngredients, Ingredient, NutritionData, MultipleNutritionResponse } from '../utils/api';
import NutritionLabel from './NutritionLabel';

const NutritionCalculator = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity_g: 100 }]);
  const [result, setResult] = useState<NutritionData | MultipleNutritionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMultipleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients = ingredients.filter(i => i.name.trim() !== '');
    if (validIngredients.length === 0) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await searchMultipleIngredients(validIngredients);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nutrition data');
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity_g: 100 }]);

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated.length === 0 ? [{ name: '', quantity_g: 100 }] : updated);
  };

  const filledCount = ingredients.filter(i => i.name.trim() !== '').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'start' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #34d399, #14b8a6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', boxShadow: '0 4px 12px rgba(20,184,166,0.3)', flexShrink: 0
            }}>🧾</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>Recipe Builder</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Add ingredients to calculate total nutrition</p>
            </div>
          </div>
          {filledCount > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '600', color: '#065f46' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              {filledCount} ingredient{filledCount !== 1 ? 's' : ''} added
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleMultipleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Ingredient list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            {ingredients.map((ingredient, index) => (
              <div key={index} style={{
                display: 'flex', gap: '10px', alignItems: 'flex-end',
                background: '#fff', border: '1.5px solid #e2e8f0',
                borderRadius: '16px', padding: '14px 14px 14px 16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'border-color 0.15s, box-shadow 0.15s'
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#99f6e4';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(20,184,166,0.1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                }}
              >
                {/* Badge */}
                <div style={{
                  flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%',
                  background: ingredient.name.trim() ? 'linear-gradient(135deg, #34d399, #14b8a6)' : '#f1f5f9',
                  color: ingredient.name.trim() ? '#fff' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '800', marginBottom: '2px', transition: 'all 0.2s'
                }}>{index + 1}</div>

                {/* Name */}
                <div style={{ flexGrow: 1 }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
                    Ingredient
                  </label>
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    placeholder="e.g. oats, banana..."
                    style={{
                      width: '100%', padding: '9px 12px', fontSize: '14px', fontWeight: '500',
                      color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
                      borderRadius: '10px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.15s'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#34d399'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Quantity */}
                <div style={{ width: '76px', flexShrink: 0 }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
                    Grams
                  </label>
                  <input
                    type="number"
                    value={ingredient.quantity_g}
                    onChange={(e) => updateIngredient(index, 'quantity_g', Number(e.target.value))}
                    min="1"
                    style={{
                      width: '100%', padding: '9px 8px', fontSize: '14px', fontWeight: '700',
                      color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
                      borderRadius: '10px', outline: 'none', textAlign: 'center', boxSizing: 'border-box', transition: 'all 0.15s'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#34d399'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  aria-label="Remove ingredient"
                  style={{
                    flexShrink: 0, width: '34px', height: '34px', border: 'none',
                    background: '#f8fafc', borderRadius: '10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#cbd5e1', transition: 'all 0.15s', marginBottom: '1px'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = '#cbd5e1'; }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={addIngredient}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: '14px',
                border: '2px dashed #cbd5e1', background: 'transparent',
                color: '#64748b', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '6px', transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = '#34d399'; el.style.color = '#059669'; el.style.background = '#ecfdf5';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = '#cbd5e1'; el.style.color = '#64748b'; el.style.background = 'transparent';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Item
            </button>

            <button
              type="submit"
              disabled={isLoading || ingredients.every(i => !i.name.trim())}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: '14px', border: 'none',
                background: (isLoading || ingredients.every(i => !i.name.trim()))
                  ? '#e2e8f0'
                  : 'linear-gradient(135deg, #34d399, #14b8a6)',
                color: (isLoading || ingredients.every(i => !i.name.trim())) ? '#94a3b8' : '#fff',
                fontSize: '14px', fontWeight: '700', cursor: (isLoading || ingredients.every(i => !i.name.trim())) ? 'not-allowed' : 'pointer',
                boxShadow: (isLoading || ingredients.every(i => !i.name.trim())) ? 'none' : '0 4px 14px rgba(20,184,166,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s', letterSpacing: '0.02em'
              }}
            >
              {isLoading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Calculating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Calculate Total
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', gap: '12px', alignItems: 'flex-start',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '14px', padding: '14px 16px'
          }}>
            <div style={{ flexShrink: 0, width: '20px', height: '20px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
              <span style={{ fontSize: '11px' }}>✕</span>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#991b1b' }}>Error</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c' }}>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ minHeight: '400px', position: 'relative' }}>
        {result ? (
          <div>
            <NutritionLabel data={result} />
            {'not_found' in result && result.not_found && result.not_found.length > 0 && (
              <div style={{
                marginTop: '12px', padding: '12px 16px',
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: '14px', fontSize: '13px', color: '#92400e'
              }}>
                <strong>Note:</strong> Data not found for: {result.not_found.join(', ')}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            height: '100%', minHeight: '380px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            border: '2px dashed #e2e8f0', borderRadius: '20px',
            background: 'linear-gradient(135deg, #f8fafc, #f0fdf4)',
            padding: '40px', gap: '16px'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '18px',
              background: '#f1f5f9', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '26px'
            }}>📊</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#94a3b8' }}>No results yet</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>Add ingredients and hit Calculate Total</p>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default NutritionCalculator;