import React, { ButtonHTMLAttributes } from 'react';
import styled, { css, keyframes } from 'styled-components';

import {
  borderRadius,
  colors,
  spacing,
  transitions,
  typography,
} from './theme';

// Define the spin animation
const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'text'
  | 'outline'
  | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

// Styled component for the Button
const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  font-family: ${typography.fontFamily.primary};
  font-weight: ${typography.fontWeight.medium};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  transition: all ${transitions.duration.medium} ${transitions.easing.easeInOut};
  outline: none;
  border: none;
  margin: 0;
  text-decoration: none;
  user-select: none;
  overflow: hidden;

  /* Handle width */
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  /* Handle size variants */
  ${({ size }) => {
    switch (size) {
      case 'small':
        return css`
          padding: ${spacing.xs} ${spacing.md};
          font-size: ${typography.fontSize.sm};
          min-height: 32px;
        `;
      case 'large':
        return css`
          padding: ${spacing.md} ${spacing.xl};
          font-size: ${typography.fontSize.lg};
          min-height: 48px;
        `;
      case 'medium':
      default:
        return css`
          padding: ${spacing.sm} ${spacing.lg};
          font-size: ${typography.fontSize.md};
          min-height: 40px;
        `;
    }
  }}

  /* Handle button variants */
  ${({ variant }) => {
    switch (variant) {
      case 'secondary':
        return css`
          background-color: ${colors.secondary.light};
          color: ${colors.secondary.main};

          &:hover:not(:disabled) {
            background-color: ${colors.secondary.light};
            filter: brightness(0.95);
          }

          &:active:not(:disabled) {
            background-color: ${colors.secondary.light};
            filter: brightness(0.9);
          }
        `;
      case 'text':
        return css`
          background-color: transparent;
          color: ${colors.primary.main};
          padding-left: ${spacing.sm};
          padding-right: ${spacing.sm};

          &:hover:not(:disabled) {
            background-color: rgba(0, 120, 212, 0.08);
          }

          &:active:not(:disabled) {
            background-color: rgba(0, 120, 212, 0.12);
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          color: ${colors.primary.main};
          border: 1px solid ${colors.primary.main};

          &:hover:not(:disabled) {
            background-color: rgba(0, 120, 212, 0.08);
          }

          &:active:not(:disabled) {
            background-color: rgba(0, 120, 212, 0.12);
          }
        `;
      case 'danger':
        return css`
          background-color: ${colors.error.main};
          color: ${colors.error.contrastText};

          &:hover:not(:disabled) {
            background-color: ${colors.error.dark};
          }

          &:active:not(:disabled) {
            background-color: ${colors.error.dark};
            filter: brightness(0.9);
          }
        `;
      case 'primary':
      default:
        return css`
          background-color: ${colors.primary.main};
          color: ${colors.primary.contrastText};

          &:hover:not(:disabled) {
            background-color: ${colors.primary.dark};
          }

          &:active:not(:disabled) {
            background-color: ${colors.primary.dark};
            filter: brightness(0.9);
          }
        `;
    }
  }}
  
  /* Disabled state */
  &:disabled {
    background-color: ${colors.grey[200]};
    color: ${colors.grey[500]};
    cursor: not-allowed;
  }

  /* Loading state */
  ${({ isLoading }) =>
    isLoading &&
    css`
      color: transparent;
      pointer-events: none;

      &::after {
        content: '';
        position: absolute;
        left: calc(50% - 0.75em);
        top: calc(50% - 0.75em);
        width: 1.5em;
        height: 1.5em;
        border-radius: 50%;
        border: 2px solid;
        border-color: currentColor transparent currentColor transparent;
        animation: ${spinAnimation} 1.2s linear infinite;
      }
    `}
`;

// Styled components for icons
const StartIconWrapper = styled.span`
  display: inherit;
  margin-right: ${spacing.sm};
  margin-left: calc(-1 * ${spacing.xs});
`;

const EndIconWrapper = styled.span`
  display: inherit;
  margin-left: ${spacing.sm};
  margin-right: calc(-1 * ${spacing.xs});
`;

// Button component with all the props
export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  isLoading = false,
  startIcon,
  endIcon,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      isLoading={isLoading}
      disabled={disabled || isLoading}
      {...props}
    >
      {startIcon && <StartIconWrapper>{startIcon}</StartIconWrapper>}
      {children}
      {endIcon && <EndIconWrapper>{endIcon}</EndIconWrapper>}
    </StyledButton>
  );
};

export default Button;
