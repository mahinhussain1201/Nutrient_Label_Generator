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

const PremiumAlert: React.FC<PremiumAlertProps> = ({ alert, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setIsVisible(true);
      if (alert.type === 'success') {
        const timer = setTimeout(() => {
          handleClose();
        }, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [alert]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!alert && !isVisible) return null;

  const isToast = alert?.type === 'success';

  return (
    <div style={{
      position: 'fixed',
      inset: isToast ? 'auto 20px 20px auto' : '0',
      display: 'flex',
      alignItems: isToast ? 'flex-end' : 'center',
      justifyContent: isToast ? 'flex-end' : 'center',
      zIndex: 9999,
      pointerEvents: isToast && !isVisible ? 'none' : 'auto',
      background: isToast ? 'transparent' : (isVisible ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0)'),
      backdropFilter: isToast ? 'none' : (isVisible ? 'blur(4px)' : 'none'),
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '28px',
        padding: isToast ? '18px 28px' : '36px',
        boxShadow: isToast 
          ? '0 20px 50px -12px rgba(0,0,0,0.15)' 
          : '0 30px 60px -12px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        maxWidth: isToast ? 'none' : '400px',
        width: isToast ? 'auto' : '90%',
        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isToast ? 'center' : 'stretch',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: alert?.type === 'success' ? '#f0fdf4' : alert?.type === 'confirm' ? '#fef2f2' : '#fff1f2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
          }}>
            {alert?.type === 'success' ? '✅' : alert?.type === 'confirm' ? '🗑️' : '⚠️'}
          </div>
          <p style={{
            margin: 0, fontSize: '15px', fontWeight: '600', color: '#1e293b',
            lineHeight: 1.5
          }}>
            {alert?.message}
          </p>
        </div>

        {/* Actions */}
        {!isToast && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={() => { alert?.onCancel?.(); handleClose(); }}
              style={{
                flex: 1, padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0',
                background: '#fff', color: '#64748b', fontSize: '14px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#1e293b';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => { alert?.onConfirm?.(); handleClose(); }}
              style={{
                flex: 1, padding: '14px', borderRadius: '16px', border: 'none',
                background: alert?.type === 'confirm' ? '#ef4444' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontSize: '14px', fontWeight: '800',
                cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: alert?.type === 'confirm' 
                  ? '0 8px 20px -4px rgba(239, 68, 68, 0.3)' 
                  : '0 8px 20px -4px rgba(16, 185, 129, 0.3)',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = alert?.type === 'confirm' 
                  ? '0 12px 24px -4px rgba(239, 68, 68, 0.4)' 
                  : '0 12px 24px -4px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = alert?.type === 'confirm' 
                  ? '0 8px 20px -4px rgba(239, 68, 68, 0.3)' 
                  : '0 8px 20px -4px rgba(16, 185, 129, 0.3)';
              }}
            >
              {alert?.type === 'confirm' ? 'Confirm' : 'Got it'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumAlert;
