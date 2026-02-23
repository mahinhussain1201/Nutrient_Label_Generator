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
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        padding: isToast ? '16px 24px' : '32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
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

        {!isToast && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={() => { alert?.onCancel?.(); handleClose(); }}
              style={{
                flex: 1, padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0',
                background: '#fff', color: '#64748b', fontSize: '14px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              Cancel
            </button>
            <button
              onClick={() => { alert?.onConfirm?.(); handleClose(); }}
              style={{
                flex: 1, padding: '12px', borderRadius: '14px', border: 'none',
                background: alert?.type === 'confirm' ? '#ef4444' : '#10b981',
                color: '#fff', fontSize: '14px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: alert?.type === 'confirm' ? '0 8px 16px rgba(239, 68, 68, 0.2)' : '0 8px 16px rgba(16, 185, 129, 0.2)'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {alert?.type === 'confirm' ? 'Confirm' : 'OK'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumAlert;
