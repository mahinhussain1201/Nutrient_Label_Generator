import { useState, useEffect, useRef } from 'react';
import { searchFoods } from '../utils/nutritionApi';
import type { FoodItem } from '../utils/nutritionApi';

interface IngredientSearchProps {
  onAddIngredient: (ingredient: { id: string; name: string; amount: number }) => void;
}

export default function IngredientSearch({ onAddIngredient }: IngredientSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('100');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.trim().length < 2) { setSuggestions([]); return; }
      setIsLoading(true);
      try {
        const results = await searchFoods(query);
        setSuggestions(results);
        setIsDropdownOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setQuery(food.name);
    setIsDropdownOpen(false);
  };

  const handleAddIngredient = () => {
    if (!selectedFood || !amount) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    onAddIngredient({ id: selectedFood.id, name: selectedFood.name, amount: amountNum });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    setQuery('');
    setAmount('100');
    setSelectedFood(null);
  };

  const canAdd = !!selectedFood && !!amount && parseFloat(amount) > 0;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
          background: 'linear-gradient(135deg, #34d399, #14b8a6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', boxShadow: '0 2px 8px rgba(20,184,166,0.3)',
        }}>+</div>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#334155' }}>Add an ingredient</p>
        {selectedFood && (
          <span style={{
            marginLeft: 'auto', fontSize: '11px', fontWeight: '700',
            background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0',
            borderRadius: '20px', padding: '2px 10px',
          }}>✓ Selected</span>
        )}
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Search field + dropdown */}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }} ref={dropdownRef}>
          {/* Search icon */}
          <div style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: inputFocused ? '#14b8a6' : '#94a3b8',
            transition: 'color 0.2s', zIndex: 1,
          }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
              <path d="M13.5 13.5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (selectedFood) setSelectedFood(null); }}
            onFocus={() => { setInputFocused(true); if (suggestions.length > 0) setIsDropdownOpen(true); }}
            onBlur={() => setInputFocused(false)}
            placeholder="Search for a food item…"
            style={{
              width: '100%', padding: '12px 40px 12px 38px',
              fontSize: '14px', fontWeight: '500', color: '#0f172a',
              background: selectedFood ? '#f0fdf4' : inputFocused ? '#fff' : '#f8fafc',
              border: `2px solid ${selectedFood ? '#6ee7b7' : inputFocused ? '#34d399' : '#e2e8f0'}`,
              borderRadius: '14px', outline: 'none', boxSizing: 'border-box',
              boxShadow: inputFocused ? '0 0 0 3px rgba(52,211,153,0.12)' : 'none',
              transition: 'all 0.2s',
            }}
          />

          {/* Spinner / clear */}
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            {isLoading ? (
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: '2px solid #d1fae5', borderTopColor: '#14b8a6',
                animation: 'spin 0.7s linear infinite',
              }} />
            ) : query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSuggestions([]); setSelectedFood(null); }}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%', border: 'none',
                  background: '#f1f5f9', color: '#94a3b8', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
              >✕</button>
            )}
          </div>

          {/* Dropdown */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', zIndex: 20, top: 'calc(100% + 6px)', left: 0, right: 0,
              background: '#fff', border: '1.5px solid #e2e8f0',
              borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              maxHeight: '240px', overflowY: 'auto', padding: '6px 0',
            }}>
              {suggestions.map((food, idx) => {
                const isActive = selectedFood?.id === food.id;
                const isHovered = hoveredId === food.id;
                return (
                  <div
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    onMouseEnter={() => setHoveredId(food.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', cursor: 'pointer',
                      background: isActive ? '#ecfdf5' : isHovered ? '#f8fafc' : '#fff',
                      borderBottom: idx < suggestions.length - 1 ? '1px solid #f8fafc' : 'none',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{
                      flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px',
                      background: isActive ? 'linear-gradient(135deg, #34d399, #14b8a6)' : isHovered ? '#f0fdf4' : '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '800',
                      color: isActive ? '#fff' : '#94a3b8',
                      transition: 'all 0.15s',
                    }}>{idx + 1}</div>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: isActive ? '#065f46' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {food.name}
                      </p>
                      {food.group && (
                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{food.group}</p>
                      )}
                    </div>
                    {isActive && (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="#14b8a6">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Amount field */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
            min="1"
            step="1"
            placeholder="100"
            style={{
              width: '80px', padding: '12px 28px 12px 12px',
              fontSize: '14px', fontWeight: '700', color: '#0f172a',
              background: amountFocused ? '#fff' : '#f8fafc',
              border: `2px solid ${amountFocused ? '#34d399' : '#e2e8f0'}`,
              borderRadius: '14px', outline: 'none', textAlign: 'center',
              boxSizing: 'border-box',
              boxShadow: amountFocused ? '0 0 0 3px rgba(52,211,153,0.12)' : 'none',
              transition: 'all 0.2s',
            }}
          />
          <span style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', pointerEvents: 'none',
          }}>g</span>
        </div>

        {/* Add button */}
        <button
          onClick={handleAddIngredient}
          disabled={!canAdd}
          style={{
            padding: '12px 20px', border: 'none', borderRadius: '14px',
            fontSize: '14px', fontWeight: '700', cursor: canAdd ? 'pointer' : 'not-allowed',
            background: justAdded
              ? '#ecfdf5'
              : canAdd
                ? 'linear-gradient(135deg, #34d399, #14b8a6)'
                : '#e2e8f0',
            color: justAdded ? '#065f46' : canAdd ? '#fff' : '#94a3b8',
            boxShadow: canAdd && !justAdded ? '0 3px 12px rgba(20,184,166,0.35)' : 'none',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={e => { if (canAdd && !justAdded) (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 18px rgba(20,184,166,0.45)'; }}
          onMouseLeave={e => { if (canAdd && !justAdded) (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 12px rgba(20,184,166,0.35)'; }}
        >
          {justAdded ? (
            <>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Added!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add
            </>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}