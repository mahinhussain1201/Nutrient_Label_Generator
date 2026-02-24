import { useState, useEffect, useRef } from 'react';
import { fetchSuggestions } from '../utils/api';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  focusStyle?: React.CSSProperties;
  blurStyle?: React.CSSProperties;
  onSearch?: () => void;
  isLoading?: boolean;
  isInvalid?: boolean;
  hideSuggestions?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  style,
  focusStyle,
  blurStyle,
  onSearch,
  isLoading,
  isInvalid,
  hideSuggestions,
}) => {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.trim().length >= 2) {
        const results = await fetchSuggestions(value);
        setSuggestions(results);
        if (focused) setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [value]);

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
        const selected = suggestions[highlightedIndex];
        onSelect(selected);
        setSuggestions([]);
        setShowSuggestions(false);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const currentStyle = {
    ...style,
    ...(focused ? focusStyle : blurStyle),
    ...(isInvalid && { borderColor: '#f87171', background: '#fef2f2', boxShadow: '0 0 0 4px rgba(248,113,113,0.1)' }),
  };

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)} // Small delay to allow click
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={currentStyle}
      />

      {onSearch && !isLoading && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSearch(); }}
          style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4px', borderRadius: '8px', transition: 'all 0.2s',
          }}
          title="Show all matches"
          onMouseEnter={e => e.currentTarget.style.background = '#f0fdfa'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      )}

      {isLoading && (
        <div style={{
          position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
          width: '18px', height: '18px', borderRadius: '50%',
          border: '2.5px solid #d1fae5', borderTopColor: '#10b981',
          animation: 'spin 0.8s linear infinite',
        }} />
      )}

      {showSuggestions && !hideSuggestions && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
          boxShadow: '0 12px 30px -10px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 100,
          animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => {
                onSelect(suggestion);
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              style={{
                padding: '12px 16px 12px 42px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#475569',
                cursor: 'pointer',
                background: highlightedIndex === index ? '#f8fafc' : 'transparent',
                borderBottom: index === suggestions.length - 1 ? 'none' : '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ 
                color: highlightedIndex === index ? '#10b981' : '#cbd5e1', 
                marginRight: '12px',
                fontSize: '16px'
              }}>•</span>
              <span style={{ color: highlightedIndex === index ? '#0f172a' : 'inherit' }}>
                {suggestion}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
