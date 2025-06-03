import React, { SelectHTMLAttributes, forwardRef, useState } from 'react';
import styled from 'styled-components';
import { colors, typography, borderRadius, spacing, transitions } from './theme';

export type SelectSize = 'small' | 'medium' | 'large';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  size?: SelectSize;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

const SelectContainer = styled.div<{ fullWidth?: boolean }>`
  display: inline-flex;
  flex-direction: column;
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  margin: ${spacing.sm} 0;
`;

const SelectLabel = styled.label<{ error?: boolean }>`
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.sm};
  color: ${({ error }) => (error ? colors.error.main : colors.text.secondary)};
  margin-bottom: ${spacing.xs};
`;

const StyledSelect = styled.select<{
  error?: boolean;
  size?: SelectSize;
}>`
  font-family: ${typography.fontFamily.primary};
  background-color: ${colors.common.white};
  border: 1px solid ${({ error }) => (error ? colors.error.main : colors.grey[300])};
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
  padding-left: ${spacing.md};
  padding-right: ${spacing.xl}; /* Extra space for the dropdown arrow */
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23616161' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right ${spacing.md} center;
  
  &:focus {
    outline: none;
    border-color: ${({ error }) => (error ? colors.error.main : colors.primary.main)};
    box-shadow: 0 0 0 1px ${({ error }) => (error ? colors.error.main : colors.primary.main)};
  }
  
  &:disabled {
    background-color: ${colors.grey[100]};
    cursor: not-allowed;
  }
`;

const HelperText = styled.span<{ error?: boolean }>`
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.xs};
  color: ${({ error }) => (error ? colors.error.main : colors.text.secondary)};
  margin-top: ${spacing.xs};
`;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error = false,
      size = 'medium',
      fullWidth = false,
      options,
      id,
      placeholder,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID for the select if not provided
    const [selectId] = useState(() => id || `select-${Math.random().toString(36).substring(2, 9)}`);

    return (
      <SelectContainer fullWidth={fullWidth}>
        {label && <SelectLabel htmlFor={selectId} error={error}>{label}</SelectLabel>}
        
        <StyledSelect
          ref={ref}
          id={selectId}
          size={size}
          error={error}
          aria-invalid={error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </StyledSelect>
        
        {helperText && <HelperText error={error}>{helperText}</HelperText>}
      </SelectContainer>
    );
  }
);

Select.displayName = 'Select';

export default Select;
