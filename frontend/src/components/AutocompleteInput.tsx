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
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  style,
  focusStyle,
  blurStyle,
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
        setShowSuggestions(false);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const currentStyle = {
    ...style,
    ...(focused ? focusStyle : blurStyle),
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

      {showSuggestions && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)', overflow: 'hidden', zIndex: 100,
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => {
                onSelect(suggestion);
                setShowSuggestions(false);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              style={{
                padding: '10px 14px',
                fontSize: '13px',
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
              <span style={{ color: highlightedIndex === index ? '#14b8a6' : '#94a3b8', marginRight: '8px' }}>•</span>
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
