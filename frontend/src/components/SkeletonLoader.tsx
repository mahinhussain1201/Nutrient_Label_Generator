import React from 'react';
import { motion } from 'framer-motion';

const Shimmer = () => (
  <motion.div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    }}
    animate={{ x: ['-100%', '100%'] }}
    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
  />
);

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  marginBottom?: string | number;
}

const SkeletonBase: React.FC<SkeletonProps> = ({ width = '100%', height = 20, borderRadius = 8, marginBottom = 0 }) => (
  <div style={{ 
    width, height, borderRadius, marginBottom, 
    background: '#f1f5f9', position: 'relative', overflow: 'hidden' 
  }}>
    <Shimmer />
  </div>
);

export const SkeletonSearch = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', background: 'rgba(255,255,255,0.5)', borderRadius: '24px' }}>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <SkeletonBase width={40} height={40} borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <SkeletonBase width="40%" height={12} marginBottom={8} />
        <SkeletonBase width="70%" height={24} />
      </div>
    </div>
    <div style={{ display: 'flex', gap: '8px' }}>
      <SkeletonBase width={60} height={24} borderRadius={20} />
      <SkeletonBase width={120} height={24} borderRadius={20} />
    </div>
  </div>
);

export const SkeletonLabel = () => (
  <div style={{ 
    width: '100%', maxWidth: '420px', background: 'white', padding: '24px', 
    borderRadius: '24px', border: '1px solid #e2e8f0' 
  }}>
    <div style={{ marginBottom: '24px' }}>
      <SkeletonBase width="30%" height={10} marginBottom={8} />
      <SkeletonBase width="60%" height={32} marginBottom={16} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <SkeletonBase width="80%" height={14} marginBottom={4} />
          <SkeletonBase width="50%" height={12} />
        </div>
        <SkeletonBase width={80} height={60} borderRadius={18} />
      </div>
    </div>
    <SkeletonBase width="100%" height={80} borderRadius={16} marginBottom={24} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
              <SkeletonBase width={20} height={20} borderRadius={6} />
              <SkeletonBase width="40%" height={14} />
            </div>
            <SkeletonBase width={60} height={14} />
          </div>
          <SkeletonBase width="100%" height={4} borderRadius={2} />
        </div>
      ))}
    </div>
  </div>
);
