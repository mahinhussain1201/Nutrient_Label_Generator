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

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '14px', padding: '48px 20px',
        background: '#fff', borderRadius: '22px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <div style={{ position: 'relative', width: '44px', height: '44px' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid #d1fae5',
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#14b8a6',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>Finding matches…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      width: '100%', maxWidth: '640px', margin: '0 auto',
      background: '#fff', borderRadius: '22px', overflow: 'hidden',
      border: '1px solid #f1f5f9',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    }}>

      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(52,211,153,0.07)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '11px', flexShrink: 0,
            background: 'linear-gradient(135deg, #34d399, #14b8a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: '0 3px 10px rgba(20,184,166,0.35)',
          }}>🔍</div>
          <div>
            <h3 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '800', color: '#fff' }}>
              Multiple matches found
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Select the specific item you meant
            </p>
          </div>
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <span style={{
              fontSize: '12px', fontWeight: '700',
              background: 'rgba(52,211,153,0.15)', color: '#34d399',
              border: '1px solid rgba(52,211,153,0.25)',
              borderRadius: '20px', padding: '3px 10px',
            }}>{items.length} results</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const isSelected = selectedIndex === index;
          return (
            <button
              key={index}
              onClick={() => handleSelect(item, index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                width: '100%', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '13px 20px',
                background: isSelected ? '#ecfdf5' : isHovered ? '#f8fafc' : '#fff',
                border: 'none',
                borderBottom: index < items.length - 1 ? '1px solid #f8fafc' : 'none',
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
            >
              {/* Index badge */}
              <div style={{
                flexShrink: 0, width: '26px', height: '26px', borderRadius: '8px',
                background: isHovered || isSelected ? 'linear-gradient(135deg, #34d399, #14b8a6)' : '#f1f5f9',
                color: isHovered || isSelected ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '800',
                transition: 'all 0.15s',
                boxShadow: isHovered ? '0 2px 8px rgba(20,184,166,0.3)' : 'none',
              }}>{index + 1}</div>

              {/* Label */}
              <span style={{
                flexGrow: 1, fontSize: '14px', fontWeight: '600',
                color: isSelected ? '#065f46' : isHovered ? '#0f172a' : '#334155',
                transition: 'color 0.12s',
              }}>{item}</span>

              {/* Arrow */}
              <svg
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{
                  flexShrink: 0,
                  color: isHovered || isSelected ? '#14b8a6' : '#e2e8f0',
                  transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
                  transition: 'all 0.15s',
                }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 20px', background: '#f8fafc',
        borderTop: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{ fontSize: '14px' }}>⌨️</span>
        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
          Click any item to load its nutrition data
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default FoodSelector;