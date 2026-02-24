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
    if (focused && suggestions.length > 0) setShowSuggestions(true);
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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>

          {/* Search icon */}
          <div style={{
            position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)',
            color: focused ? '#059669' : '#94a3b8',
            transition: 'color 0.25s ease',
            pointerEvents: 'none',
            display: 'flex',
            zIndex: 2,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* Input */}
          <input
            type="text"
            className="sb-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="Search any food or ingredient…"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px 160px 16px 50px',
              fontSize: '15px',
              fontWeight: '500',
              color: '#0f172a',
              background: focused ? '#ffffff' : '#f8fafb',
              border: `1.5px solid ${focused ? '#059669' : '#e2e8f0'}`,
              borderRadius: '16px',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: focused
                ? '0 0 0 3px rgba(5,150,105,0.1), 0 4px 16px rgba(0,0,0,0.06)'
                : '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isLoading ? 0.65 : 1,
              fontFamily: 'inherit',
            }}
          />

          {/* Clear button */}
          {query && !isLoading && (
            <button
              type="button"
              className="sb-clear"
              onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }}
              style={{
                position: 'absolute', right: '130px', top: '50%', transform: 'translateY(-50%)',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '24px', height: '24px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '11px',
                fontWeight: '700',
                transition: 'all 0.15s ease',
                zIndex: 10,
                lineHeight: 1,
              }}
            >✕</button>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="sb-submit"
            disabled={!canSubmit}
            style={{
              position: 'absolute', right: '6px', top: '6px', bottom: '6px',
              padding: '0 20px',
              background: canSubmit
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : '#f1f5f9',
              color: canSubmit ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '0.02em',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '7px',
              boxShadow: canSubmit ? '0 2px 10px rgba(5,150,105,0.3)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              zIndex: 10,
              fontFamily: 'inherit',
            }}
          >
            {isLoading ? (
              <>
                <svg className="sb-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span className="sb-label">Analyzing</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span className="sb-label">Analyze</span>
              </>
            )}
          </button>
        </form>

        {/* Suggestions dropdown */}
        {showSuggestions && !isLoading && !hideSuggestions && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            zIndex: 100,
          }}>
            {suggestions.map((suggestion, index) => {
              const isHighlighted = highlightedIndex === index;
              const isLast = index === suggestions.length - 1;
              return (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    padding: '11px 16px 11px 46px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: isHighlighted ? '#065f46' : '#334155',
                    cursor: 'pointer',
                    background: isHighlighted ? '#f0fdf9' : 'transparent',
                    borderBottom: isLast ? 'none' : '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'background 0.12s ease, color 0.12s ease',
                    position: 'relative',
                  }}
                >
                  {/* Leading dot / chevron */}
                  <span style={{
                    position: 'absolute',
                    left: '18px',
                    color: isHighlighted ? '#10b981' : '#cbd5e1',
                    fontSize: '16px',
                    lineHeight: 1,
                    transition: 'color 0.12s ease',
                  }}>
                    {isHighlighted ? '→' : '·'}
                  </span>
                  {suggestion}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes sb-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .sb-spin { animation: sb-spin 0.75s linear infinite; }

        .sb-clear:hover {
          background: #e2e8f0 !important;
          color: #475569 !important;
        }

        .sb-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(5,150,105,0.35) !important;
        }

        .sb-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .sb-input {
            padding: 14px 108px 14px 44px !important;
            font-size: 14px !important;
            border-radius: 14px !important;
          }
          .sb-submit {
            padding: 0 14px !important;
            border-radius: 10px !important;
          }
          .sb-label { display: none; }
          .sb-clear { right: 80px !important; }
        }

        @media (max-width: 360px) {
          .sb-input {
            padding: 12px 88px 12px 40px !important;
            font-size: 13px !important;
          }
          .sb-submit { padding: 0 10px !important; }
          .sb-clear { right: 66px !important; }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;