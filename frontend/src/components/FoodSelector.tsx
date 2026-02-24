import React, { useState } from 'react';

interface FoodSelectorProps {
  items: string[];
  onSelect: (item: string) => void;
  isLoading?: boolean;
}

const FoodSelector: React.FC<FoodSelectorProps> = ({ items, onSelect, isLoading }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (item: string, index: number) => {
    setSelectedIndex(index);
    setTimeout(() => onSelect(item), 150);
  };

  if (isLoading) {
    return (
      <div style={{
        fontFamily: "'DM Sans', 'Outfit', ui-sans-serif, system-ui, sans-serif",
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '14px', padding: '48px 20px',
        background: '#ffffff', borderRadius: '22px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{ position: 'relative', width: '40px', height: '40px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #d1fae5' }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid transparent', borderTopColor: '#059669',
            animation: 'fs-spin 0.75s linear infinite',
          }} />
        </div>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.01em' }}>
          Finding matches…
        </p>
        <style>{`@keyframes fs-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Outfit', ui-sans-serif, system-ui, sans-serif",
      width: '100%', maxWidth: '640px', margin: '0 auto',
      background: '#ffffff', borderRadius: '22px', overflow: 'hidden',
      border: '1.5px solid #e2e8f0',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    }}>

      {/* ── Header ────────────────────────────────────────── */}
      <div style={{
        padding: '18px 22px',
        background: '#f8fafb',
        borderBottom: '1px solid #e9eef4',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        {/* Icon */}
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
        }}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="white">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>
            Multiple matches found
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
            Select the specific item you meant
          </p>
        </div>

        {/* Count badge */}
        <span style={{
          fontSize: '11px', fontWeight: '700',
          background: '#f0fdf9', color: '#059669',
          border: '1px solid #a7f3d0',
          borderRadius: '100px', padding: '3px 11px',
          letterSpacing: '0.02em', flexShrink: 0,
        }}>
          {items.length} results
        </span>
      </div>

      {/* ── List ──────────────────────────────────────────── */}
      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const isSelected = selectedIndex === index;
          const isActive = isHovered || isSelected;

          return (
            <button
              key={index}
              onClick={() => handleSelect(item, index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                width: '100%', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 20px',
                background: isSelected ? '#f0fdf9' : isHovered ? '#f8fafc' : '#ffffff',
                border: 'none',
                borderBottom: index < items.length - 1 ? '1px solid #f8fafc' : 'none',
                cursor: 'pointer',
                transition: 'background 0.12s ease',
                fontFamily: 'inherit',
              }}
            >
              {/* Index badge */}
              <div style={{
                flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px',
                background: isActive
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : '#f1f5f9',
                color: isActive ? '#ffffff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: '800',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 6px rgba(5,150,105,0.28)' : 'none',
              }}>
                {isSelected
                  ? <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  : index + 1
                }
              </div>

              {/* Label */}
              <span style={{
                flexGrow: 1, fontSize: '14px', fontWeight: '600',
                color: isSelected ? '#065f46' : isHovered ? '#0f172a' : '#334155',
                transition: 'color 0.12s ease',
                letterSpacing: '-0.01em',
              }}>
                {item}
              </span>

              {/* Chevron */}
              <svg
                width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{
                  flexShrink: 0,
                  color: isActive ? '#059669' : '#d1d5db',
                  transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
                  transition: 'all 0.15s ease',
                }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <div style={{
        padding: '10px 20px',
        background: '#f8fafb',
        borderTop: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', gap: '7px',
      }}>
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="1.75">
          <rect x="3" y="3" width="14" height="14" rx="2" />
          <path d="M7 10h6M10 7v6" strokeLinecap="round" />
        </svg>
        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
          Click any item to load its nutrition data
        </p>
      </div>

      <style>{`@keyframes fs-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default FoodSelector;