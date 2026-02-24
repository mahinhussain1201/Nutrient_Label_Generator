import React, { useEffect, useState } from 'react';

export interface AlertOptions {
  type: 'success' | 'confirm' | 'error';
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface PremiumAlertProps {
  alert: AlertOptions | null;
  onClose: () => void;
}

const ICONS = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#d1fae5" />
      <path d="M5.5 10.5l3 3 6-6" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  confirm: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#fee2e2" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#fef3c7" />
      <path d="M10 6v5M10 13.5v.5" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const ACCENT = {
  success: { bg: '#f0fdf9', border: '#a7f3d0', icon: '#059669' },
  confirm: { bg: '#fef2f2', border: '#fecaca', icon: '#ef4444' },
  error:   { bg: '#fffbeb', border: '#fde68a', icon: '#d97706' },
};

const PremiumAlert: React.FC<PremiumAlertProps> = ({ alert, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = React.useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    if (alert) {
      setTimeout(() => setIsVisible(true), 0);
      if (alert.type === 'success') {
        const timer = setTimeout(() => handleClose(), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setTimeout(() => setIsVisible(false), 0);
    }
  }, [alert, handleClose]);

  if (!alert && !isVisible) return null;

  const isToast = alert?.type === 'success';
  const type = alert?.type ?? 'success';
  const accent = ACCENT[type];

  return (
    <div style={{
      position: 'fixed',
      inset: isToast ? 'auto 24px 24px auto' : '0',
      display: 'flex',
      alignItems: isToast ? 'flex-end' : 'center',
      justifyContent: isToast ? 'flex-end' : 'center',
      zIndex: 9999,
      pointerEvents: isToast && !isVisible ? 'none' : 'auto',
      background: isToast ? 'transparent' : (isVisible ? 'rgba(15,23,42,0.3)' : 'rgba(15,23,42,0)'),
      backdropFilter: isToast ? 'none' : (isVisible ? 'blur(6px)' : 'none'),
      transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: isToast ? '18px' : '24px',
        padding: isToast ? '14px 20px' : '32px',
        boxShadow: isToast
          ? '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
          : '0 24px 60px -12px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.06)',
        border: `1.5px solid ${accent.border}`,
        maxWidth: isToast ? 'none' : '400px',
        width: isToast ? 'auto' : '90%',
        transform: isVisible
          ? 'scale(1) translateY(0)'
          : isToast ? 'scale(0.92) translateY(12px)' : 'scale(0.94) translateY(16px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: isToast ? '0' : '24px',
      }}>

        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {/* Icon badge */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: accent.bg,
            border: `1px solid ${accent.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {ICONS[type]}
          </div>

          <p style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            lineHeight: 1.55,
            flex: 1,
          }}>
            {alert?.message}
          </p>

          {/* Close X for toast */}
          {isToast && (
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '6px',
                transition: 'color 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#475569')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Action buttons — modal only */}
        {!isToast && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { alert?.onCancel?.(); handleClose(); }}
              style={{
                flex: 1,
                padding: '13px',
                borderRadius: '13px',
                border: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#334155';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              Cancel
            </button>

            <button
              onClick={() => { alert?.onConfirm?.(); handleClose(); }}
              style={{
                flex: 1,
                padding: '13px',
                borderRadius: '13px',
                border: 'none',
                background: type === 'confirm'
                  ? 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: type === 'confirm'
                  ? '0 4px 14px rgba(239,68,68,0.3)'
                  : '0 4px 14px rgba(5,150,105,0.3)',
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = type === 'confirm'
                  ? '0 6px 20px rgba(239,68,68,0.4)'
                  : '0 6px 20px rgba(5,150,105,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = type === 'confirm'
                  ? '0 4px 14px rgba(239,68,68,0.3)'
                  : '0 4px 14px rgba(5,150,105,0.3)';
              }}
            >
              {type === 'confirm' ? 'Confirm' : 'Got it'}
            </button>
          </div>
        )}

        {/* Auto-dismiss progress bar for toast */}
        {isToast && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            borderRadius: '0 0 18px 18px',
            background: accent.icon,
            opacity: 0.35,
            animation: 'pa-shrink 3s linear forwards',
          }} />
        )}
      </div>

      <style>{`
        @keyframes pa-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default PremiumAlert;