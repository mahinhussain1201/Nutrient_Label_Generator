import React, { useState } from 'react';
import axios from 'axios';

const NutritionCalculator = () => {
  const [ingredients, setIngredients] = useState([{ name: '', quantity: 100 }]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index].name = value;
    setIngredients(newIngredients);
  };

  const handleQuantityChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index].quantity = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: 100 }]);

  const removeIngredient = (index) => {
    if (ingredients.length > 1) setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const selectSuggestion = (suggestion) => {
    const newIngredients = [...ingredients];
    newIngredients[currentIngredientIndex].name = suggestion.name;
    setIngredients(newIngredients);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const calculateNutrition = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = ingredients
        .filter(ing => ing.name.trim() !== '')
        .map(ing => ({ name: ing.name, quantity_g: parseFloat(ing.quantity) || 0 }));
      if (payload.length === 0) { setError('Please add at least one ingredient'); setLoading(false); return; }
      const response = await axios.post('http://localhost:5000/api/nutrition/multiple', payload);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to calculate nutrition. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (num) => parseFloat(num).toFixed(2);

  const nutrientAccent = (name) => {
    if (name.includes('Calorie') || name.includes('Energy')) return '#f97316';
    if (name.includes('Protein')) return '#3b82f6';
    if (name.includes('Fat')) return '#eab308';
    if (name.includes('Carb')) return '#22c55e';
    return '#8b5cf6';
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 50%, #ecfeff 100%)', padding: '40px 16px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'linear-gradient(135deg, #34d399, #14b8a6)', borderRadius: '20px', fontSize: '28px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(20,184,166,0.3)' }}>🥗</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', margin: '0 0 6px' }}>Nutrition Calculator</h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Enter your ingredients for a full nutritional breakdown</p>
        </div>

        {/* Input Card */}
        <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 40px rgba(0,0,0,0.08)', padding: '32px', marginBottom: '24px', border: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 0, marginBottom: '20px' }}>Ingredients</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ingredients.map((ingredient, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                className="ingredient-row">
                <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                  {index + 1}
                </div>
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder="e.g. chicken breast, brown rice..."
                    style={{ width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', color: '#1f2937', outline: 'none', boxSizing: 'border-box', transition: 'all 0.15s' }}
                    onFocus={e => { e.target.style.borderColor = '#34d399'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
                  />
                  {showSuggestions && currentIngredientIndex === index && suggestions.length > 0 && (
                    <ul style={{ position: 'absolute', zIndex: 20, width: '100%', marginTop: '4px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '4px 0', listStyle: 'none' }}>
                      {suggestions.map((s, idx) => (
                        <li key={s.id || idx} onClick={() => selectSuggestion(s)}
                          style={{ padding: '10px 16px', fontSize: '14px', cursor: 'pointer', color: idx === activeSuggestion ? '#059669' : '#374151', background: idx === activeSuggestion ? '#ecfdf5' : 'transparent' }}>
                          {s.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    min="1"
                    style={{ width: '72px', padding: '12px 8px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', fontWeight: '600', textAlign: 'center', color: '#1f2937', outline: 'none' }}
                    onFocus={e => { e.target.style.borderColor = '#34d399'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase' }}>g</span>
                </div>
                {ingredients.length > 1 ? (
                  <button onClick={() => removeIngredient(index)}
                    style={{ flexShrink: 0, width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#d1d5db', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.target.style.color = '#ef4444'; e.target.style.background = '#fef2f2'; }}
                    onMouseLeave={e => { e.target.style.color = '#d1d5db'; e.target.style.background = 'transparent'; }}
                    title="Remove">✕</button>
                ) : <div style={{ width: '32px' }} />}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
            <button onClick={addIngredient}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', color: '#059669', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '10px', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#ecfdf5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Add Ingredient
            </button>
            <button onClick={calculateNutrition} disabled={loading}
              style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '700', color: '#fff', background: loading ? '#d1d5db' : 'linear-gradient(135deg, #34d399, #14b8a6)', boxShadow: loading ? 'none' : '0 4px 16px rgba(20,184,166,0.35)', transition: 'all 0.2s', letterSpacing: '0.02em' }}>
              {loading ? '⏳ Calculating...' : 'Calculate Nutrition →'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '16px', fontSize: '14px', marginBottom: '20px' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {results.not_found?.length > 0 && (
              <div style={{ padding: '14px 18px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '16px', fontSize: '14px' }}>
                <strong>⚠️ No data found for:</strong> {results.not_found.join(', ')}
              </div>
            )}

            {/* Total Nutrition */}
            <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 40px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1f2937' }}>Total Nutrition</h2>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#f3f4f6', padding: '4px 12px', borderRadius: '20px' }}>All Ingredients</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '10px 28px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nutrient</th>
                    <th style={{ padding: '10px 20px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Amount</th>
                    <th style={{ padding: '10px 28px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {results.total_nutrients.map((n, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #f9fafb' }}>
                      <td style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '600', color: nutrientAccent(n.name) }}>{n.name}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>{fmt(n.amount)}</td>
                      <td style={{ padding: '12px 28px', textAlign: 'right', fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>{n.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Per Ingredient */}
            <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 40px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1f2937' }}>Breakdown by Ingredient</h2>
              </div>
              {results.ingredients.map((ingredient, idx) => (
                <div key={idx} style={{ padding: '24px 28px', borderTop: idx > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #34d399, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '800', flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: '700', color: '#1f2937', textTransform: 'capitalize' }}>{ingredient.ingredient}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{ingredient.quantity_g}g serving</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                    {ingredient.nutrients.map((nutrient, nIdx) => (
                      <div key={nIdx} style={{ background: '#f9fafb', borderRadius: '14px', padding: '12px 14px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>{nutrient.name}</p>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: nutrientAccent(nutrient.name) }}>
                          {fmt(nutrient.amount)}<span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500', marginLeft: '4px' }}>{nutrient.unit}</span>
                        </p>
                        {nutrient.per_100g && (
                          <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#c4b5fd' }}>{fmt(nutrient.per_100g)} / 100g</p>
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
    </div>
  );
};

export default NutritionCalculator;