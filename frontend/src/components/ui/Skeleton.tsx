import React from 'react';
import styled, { keyframes } from 'styled-components';

import { borderRadius, colors, spacing } from './theme';

// Skeleton shimmer animation
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Basic Skeleton component for text, rectangular shapes
const SkeletonBase = styled.div<{
  width?: string;
  height?: string;
  borderRadius?: string;
  margin?: string;
}>`
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '20px'};
  border-radius: ${({ borderRadius }) => borderRadius || '6px'};
  margin: ${({ margin }) => margin || '0'};
  background: ${colors.grey[200]};
  background-image: linear-gradient(
    90deg,
    ${colors.grey[200]} 0px,
    ${colors.grey[300]} 40px,
    ${colors.grey[200]} 80px
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
`;

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  margin?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  margin,
  variant = 'text',
  animation = true,
}) => {
  // Adjust border radius based on variant
  let radiusValue = borderRadius;
  if (!borderRadius) {
    if (variant === 'circular') {
      radiusValue = '50%';
    } else if (variant === 'text') {
      radiusValue = '4px';
    } else {
      radiusValue = '6px';
    }
  }

  return (
    <SkeletonBase
      width={width}
      height={height || (variant === 'circular' ? width : '20px')}
      borderRadius={radiusValue}
      margin={margin}
    />
  );
};

// Predefined skeleton variations
export const TextSkeleton = styled(Skeleton).attrs({
  variant: 'text',
  height: '16px',
  margin: `${spacing.xs} 0`,
})``;

export const TitleSkeleton = styled(Skeleton).attrs({
  variant: 'text',
  height: '24px',
  width: '70%',
  margin: `${spacing.sm} 0`,
})``;

export const CircleSkeleton = styled(Skeleton).attrs({
  variant: 'circular',
})``;

export const RectSkeleton = styled(Skeleton).attrs({
  variant: 'rectangular',
})``;

// Spinner component for loading states
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  thickness?: number;
}

const SpinnerContainer = styled.div<SpinnerProps>`
  display: inline-block;
  width: ${({ size }) => {
    switch (size) {
      case 'small':
        return '16px';
      case 'large':
        return '40px';
      case 'medium':
      default:
        return '24px';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'small':
        return '16px';
      case 'large':
        return '40px';
      case 'medium':
      default:
        return '24px';
    }
  }};
  border: ${({ thickness }) => thickness || 2}px solid ${colors.grey[300]};
  border-top: ${({ thickness }) => thickness || 2}px solid
    ${({ color }) => color || colors.primary.main};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color,
  thickness,
}) => {
  return <SpinnerContainer size={size} color={color} thickness={thickness} />;
};

// Loading overlay for blocking UI during loading
const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 100;
`;

export interface LoadingOverlayProps {
  isLoading: boolean;
  children?: React.ReactNode;
  spinnerSize?: SpinnerProps['size'];
  spinnerColor?: string;
  text?: string;
}

const LoadingText = styled.div`
  margin-top: ${spacing.md};
  color: ${colors.text.primary};
  font-size: 14px;
`;

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  spinnerSize = 'large',
  spinnerColor,
  text,
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div style={{ position: 'relative' }}>
      {children}
      <OverlayContainer>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Spinner size={spinnerSize} color={spinnerColor} />
          {text && <LoadingText>{text}</LoadingText>}
        </div>
      </OverlayContainer>
    </div>
  );
};

// Simple loader component for inline loading states
export const Loader: React.FC<{ text?: string }> = ({
  text = 'Loading...',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
      }}
    >
      <Spinner size="small" />
      {text && <span style={{ marginLeft: spacing.sm }}>{text}</span>}
    </div>
  );
};

// Export everything
export default {
  Skeleton,
  TextSkeleton,
  TitleSkeleton,
  CircleSkeleton,
  RectSkeleton,
  Spinner,
  LoadingOverlay,
  Loader,
};
