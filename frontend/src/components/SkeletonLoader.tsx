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
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent)',
    }}
    animate={{ x: ['-100%', '100%'] }}
    transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
  />
);

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  marginBottom?: string | number;
}

const SkeletonBase: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  marginBottom = 0,
}) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      marginBottom,
      background: '#e9f5f0',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
    }}
  >
    <Shimmer />
  </div>
);

export const SkeletonSearch = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      padding: '24px',
      background: '#ffffff',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}
  >
    {/* Search input row */}
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <SkeletonBase width={40} height={40} borderRadius="50%" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SkeletonBase width="35%" height={11} borderRadius={6} />
        <SkeletonBase width="70%" height={22} borderRadius={8} />
      </div>
    </div>

    {/* Divider */}
    <div style={{ height: '1px', background: '#f1f5f9' }} />

    {/* History chips */}
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <SkeletonBase width={42} height={11} borderRadius={6} />
      <SkeletonBase width={64} height={26} borderRadius={100} />
      <SkeletonBase width={88} height={26} borderRadius={100} />
      <SkeletonBase width={56} height={26} borderRadius={100} />
    </div>
  </div>
);

export const SkeletonLabel = () => (
  <div
    style={{
      width: '100%',
      maxWidth: '420px',
      background: '#ffffff',
      padding: '28px',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}
  >
    {/* Food name & meta */}
    <div style={{ marginBottom: '22px' }}>
      <SkeletonBase width="28%" height={10} borderRadius={5} marginBottom={10} />
      <SkeletonBase width="62%" height={30} borderRadius={10} marginBottom={18} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <SkeletonBase width="75%" height={13} borderRadius={6} />
          <SkeletonBase width="45%" height={11} borderRadius={6} />
        </div>
        <SkeletonBase width={76} height={56} borderRadius={18} />
      </div>
    </div>

    {/* Calories block */}
    <div
      style={{
        background: '#f0fdf9',
        borderRadius: '16px',
        padding: '16px 18px',
        marginBottom: '22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <SkeletonBase width={70} height={11} borderRadius={5} />
        <SkeletonBase width={48} height={36} borderRadius={10} />
      </div>
      <SkeletonBase width={52} height={52} borderRadius="50%" />
    </div>

    {/* Divider */}
    <div style={{ height: '2px', background: '#f1f5f9', borderRadius: '2px', marginBottom: '18px' }} />

    {/* Nutrient rows */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '7px',
            }}
          >
            <div style={{ display: 'flex', gap: '9px', alignItems: 'center', flex: 1 }}>
              <SkeletonBase width={18} height={18} borderRadius={5} />
              <SkeletonBase width={`${30 + (i * 7) % 30}%`} height={13} borderRadius={6} />
            </div>
            <SkeletonBase width={52} height={13} borderRadius={6} />
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: '5px',
              background: '#f1f5f9',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Shimmer />
          </div>
        </div>
      ))}
    </div>
  </div>
);