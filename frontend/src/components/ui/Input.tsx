import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import styled, { css } from 'styled-components';

import {
  borderRadius,
  colors,
  spacing,
  transitions,
  typography,
} from './theme';

export type InputSize = 'small' | 'medium' | 'large';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  size?: InputSize;
  fullWidth?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: inline-flex;
  flex-direction: column;
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  margin: ${spacing.sm} 0;
`;

const InputLabel = styled.label<{ error?: boolean }>`
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.sm};
  color: ${({ error }) => (error ? colors.error.main : colors.text.secondary)};
  margin-bottom: ${spacing.xs};
`;

const StyledInput = styled.input<{
  error?: boolean;
  size?: InputSize;
  hasStartAdornment?: boolean;
  hasEndAdornment?: boolean;
}>`
  font-family: ${typography.fontFamily.primary};
  background-color: ${colors.common.white};
  border: 1px solid
    ${({ error }) => (error ? colors.error.main : colors.grey[300])};
  border-radius: ${borderRadius.md};
  padding: ${({ size }) => {
    switch (size) {
      case 'small':
        return spacing.xs;
      case 'large':
        return spacing.md;
      case 'medium':
      default:
        return spacing.sm;
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'small':
        return typography.fontSize.sm;
      case 'large':
        return typography.fontSize.lg;
      case 'medium':
      default:
        return typography.fontSize.md;
    }
  }};
  color: ${colors.text.primary};
  transition: all ${transitions.duration.short} ${transitions.easing.easeInOut};
  width: 100%;
  box-sizing: border-box;
  height: ${({ size }) => {
    switch (size) {
      case 'small':
        return '32px';
      case 'large':
        return '48px';
      case 'medium':
      default:
        return '40px';
    }
  }};
  padding-left: ${({ hasStartAdornment }) =>
    hasStartAdornment ? '36px' : spacing.md};
  padding-right: ${({ hasEndAdornment }) =>
    hasEndAdornment ? '36px' : spacing.md};

  &:focus {
    outline: none;
    border-color: ${({ error }) =>
      error ? colors.error.main : colors.primary.main};
    box-shadow: 0 0 0 1px
      ${({ error }) => (error ? colors.error.main : colors.primary.main)};
  }

  &:disabled {
    background-color: ${colors.grey[100]};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${colors.grey[400]};
  }
`;

const HelperText = styled.span<{ error?: boolean }>`
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.xs};
  color: ${({ error }) => (error ? colors.error.main : colors.text.secondary)};
  margin-top: ${spacing.xs};
`;

const Adornment = styled.div<{ position: 'start' | 'end' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.grey[500]};

  ${({ position }) =>
    position === 'start'
      ? css`
          left: ${spacing.sm};
        `
      : css`
          right: ${spacing.sm};
        `}
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error = false,
      size = 'medium',
      fullWidth = false,
      startAdornment,
      endAdornment,
      id,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID for the input if not provided
    const [inputId] = useState(
      () => id || `input-${Math.random().toString(36).substring(2, 9)}`
    );

    return (
      <InputContainer fullWidth={fullWidth}>
        {label && (
          <InputLabel htmlFor={inputId} error={error}>
            {label}
          </InputLabel>
        )}

        {startAdornment && (
          <Adornment position="start">{startAdornment}</Adornment>
        )}

        <StyledInput
          ref={ref}
          id={inputId}
          size={size}
          error={error}
          hasStartAdornment={!!startAdornment}
          hasEndAdornment={!!endAdornment}
          aria-invalid={error}
          {...props}
        />

        {endAdornment && <Adornment position="end">{endAdornment}</Adornment>}

        {helperText && <HelperText error={error}>{helperText}</HelperText>}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export default Input;
