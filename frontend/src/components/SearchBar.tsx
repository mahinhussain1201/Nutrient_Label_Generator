import { useState, useEffect, useRef } from 'react';
import { fetchSuggestions } from '../utils/api';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        const results = await fetchSuggestions(query);
        setSuggestions(results);
        if (focused) setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (focused && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [focused, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
      setFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    setFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const canSubmit = !isLoading && !!query.trim();

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        {/* Main search row */}
        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
          {/* Search icon */}
          <div style={{
            position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: focused ? '#14b8a6' : '#94a3b8', transition: 'color 0.2s',
            zIndex: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="2" />
              <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search food or list ingredients…"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px 140px 16px 48px',
              fontSize: '15px',
              fontWeight: '500',
              color: '#0f172a',
              background: focused ? '#fff' : 'rgba(255,255,255,0.8)',
              border: `2px solid ${focused ? '#34d399' : '#e2e8f0'}`,
              borderRadius: '18px',
              outline: 'none',
              boxSizing: 'border-box',
              backdropFilter: 'blur(8px)',
              boxShadow: focused
                ? '0 0 0 4px rgba(52,211,153,0.12), 0 4px 20px rgba(0,0,0,0.06)'
                : '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.7 : 1,
            }}
          />

          {/* Clear button */}
          {query && !isLoading && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }}
              style={{
                position: 'absolute', right: '108px', top: '50%', transform: 'translateY(-50%)',
                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: '22px', height: '22px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8', fontSize: '10px', transition: 'all 0.15s',
                zIndex: 10,
              }}
            >✕</button>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              position: 'absolute', right: '6px', top: '6px', bottom: '6px',
              padding: '0 22px',
              background: canSubmit
                ? 'linear-gradient(135deg, #34d399, #14b8a6)'
                : '#e2e8f0',
              color: canSubmit ? '#fff' : '#94a3b8',
              border: 'none',
              borderRadius: '13px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '7px',
              boxShadow: canSubmit ? '0 3px 12px rgba(20,184,166,0.35)' : 'none',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              zIndex: 10,
            }}
          >
            {isLoading ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Analyzing
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Analyze
              </>
            )}
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            background: '#fff', borderRadius: '18px', border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 100,
          }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  padding: '12px 16px 12px 48px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#334155',
                  cursor: 'pointer',
                  background: highlightedIndex === index ? '#f0fdfa' : 'transparent',
                  borderBottom: index === suggestions.length - 1 ? 'none' : '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ color: highlightedIndex === index ? '#14b8a6' : '#94a3b8', marginRight: '12px' }}>•</span>
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom row: tip + suggestions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '0 4px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{
            fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em',
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            color: '#065f46', border: '1px solid #a7f3d0',
            padding: '2px 9px', borderRadius: '20px',
          }}>Tip</span>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Separate ingredients with commas</span>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SearchBar;