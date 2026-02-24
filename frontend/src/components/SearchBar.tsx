import { useState, useEffect, useRef } from 'react';
import { fetchSuggestions } from '../utils/api';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  hideSuggestions?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, hideSuggestions }) => {
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
      setSuggestions([]);
      setShowSuggestions(false);
      setFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setSuggestions([]);
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

          <input
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="Search food…"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '18px 180px 18px 56px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#0f172a',
              background: focused ? '#fff' : 'rgba(255,255,255,0.6)',
              border: `1px solid ${focused ? '#10b981' : '#e2e8f0'}`,
              borderRadius: '20px',
              outline: 'none',
              boxSizing: 'border-box',
              backdropFilter: 'blur(12px)',
              boxShadow: focused
                ? '0 0 0 4px rgba(16,185,129,0.08), 0 10px 30px -10px rgba(0,0,0,0.08)'
                : '0 2px 8px rgba(0,0,0,0.02)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isLoading ? 0.7 : 1,
            }}
          />
          <div style={{
            position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
            color: focused ? '#10b981' : '#94a3b8', transition: 'color 0.3s',
            pointerEvents: 'none', display: 'flex'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          {/* Clear button */}
          {query && !isLoading && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }}
              style={{
                position: 'absolute', right: '144px', top: '50%', transform: 'translateY(-50%)',
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
            className="search-submit-btn"
            disabled={!canSubmit}
            style={{
              position: 'absolute', right: '6px', top: '6px', bottom: '6px',
              padding: '0 24px',
              background: canSubmit
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : '#f1f5f9',
              color: canSubmit ? '#fff' : '#94a3b8',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: canSubmit ? '0 4px 12px rgba(16,185,129,0.25)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
              zIndex: 10,
            }}
          >
            {isLoading ? (
              <>
                <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span className="search-btn-label">Analyzing</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span className="search-btn-label">Analyze</span>
              </>
            )}
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && !isLoading && !hideSuggestions && (
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
      {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '0 4px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{
            fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em',
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            color: '#065f46', border: '1px solid #a7f3d0',
            padding: '2px 9px', borderRadius: '20px',
          }}>Tip</span>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Separate ingredients with commas</span>
        </div>
      </div> */}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Responsive: shrink input padding and button on small screens */
        @media (max-width: 480px) {
          .search-input {
            padding: 13px 100px 13px 44px !important;
            font-size: 14px !important;
            border-radius: 14px !important;
          }
          .search-submit-btn {
            padding: 0 12px !important;
            font-size: 13px !important;
            border-radius: 10px !important;
            right: 6px !important;
          }
          .search-btn-label {
            display: none;
          }
          .search-clear-btn {
            right: 68px !important;
          }
        }

        @media (max-width: 360px) {
          .search-input {
            padding: 12px 76px 12px 40px !important;
            font-size: 13px !important;
          }
          .search-submit-btn {
            padding: 0 10px !important;
          }
          .search-clear-btn {
            right: 60px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;