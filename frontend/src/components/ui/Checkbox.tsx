import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import styled from 'styled-components';
import { colors, typography, borderRadius, spacing, transitions } from './theme';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  indeterminate?: boolean;
}

const CheckboxContainer = styled.div`
  display: inline-flex;
  align-items: flex-start;
  position: relative;
  margin: ${spacing.xs} 0;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
  margin: 0;
  padding: 0;
`;

const StyledCheckbox = styled.div<{ checked: boolean; error?: boolean; disabled?: boolean; indeterminate?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background-color: ${({ checked, indeterminate }) => 
    checked || indeterminate ? colors.primary.main : colors.common.white};
  border: 1px solid ${({ checked, error, indeterminate }) => 
    checked || indeterminate
      ? colors.primary.main
      : error
      ? colors.error.main
      : colors.grey[400]};
  border-radius: ${borderRadius.sm};
  transition: all ${transitions.duration.short} ${transitions.easing.easeInOut};
  box-sizing: border-box;
  flex-shrink: 0;
  
  ${({ disabled }) =>
    disabled &&
    `
    background-color: ${colors.grey[100]};
    border-color: ${colors.grey[300]};
    cursor: not-allowed;
  `}
  
  &:hover {
    ${({ disabled }) =>
      !disabled &&
      `
      border-color: ${colors.primary.main};
    `}
  }
  
  /* Checkmark icon */
  &::after {
    content: '';
    display: ${({ checked, indeterminate }) => (checked || indeterminate ? 'block' : 'none')};
    width: ${({ indeterminate }) => (indeterminate ? '10px' : '5px')};
    height: ${({ indeterminate }) => (indeterminate ? '2px' : '10px')};
    border: solid ${({ disabled }) => (disabled ? colors.grey[500] : colors.common.white)};
    border-width: ${({ indeterminate }) => (indeterminate ? '0 0 2px 0' : '0 2px 2px 0')};
    transform: ${({ indeterminate }) => 
      indeterminate ? 'translateY(-50%)' : 'rotate(45deg) translate(-1px, -1px)'};
    position: relative;
    top: ${({ indeterminate }) => (indeterminate ? '0' : '-2px')};
  }
`;

const LabelText = styled.label<{ disabled?: boolean }>`
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.md};
  color: ${({ disabled }) => (disabled ? colors.text.disabled : colors.text.primary)};
  padding-left: ${spacing.sm};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
`;

const HelperText = styled.span<{ error?: boolean }>`
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.xs};
  color: ${({ error }) => (error ? colors.error.main : colors.text.secondary)};
  margin-top: ${spacing.xs};
  margin-left: calc(18px + ${spacing.sm});
`;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error = false,
      indeterminate = false,
      checked,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID for the checkbox if not provided
    const [checkboxId] = useState(() => id || `checkbox-${Math.random().toString(36).substring(2, 9)}`);
    
    // Use React's useEffect to set the indeterminate property
    // since it can't be set via HTML attributes
    React.useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    return (
      <div>
        <CheckboxContainer>
          <HiddenCheckbox
            ref={ref}
            id={checkboxId}
            checked={checked}
            disabled={disabled}
            aria-invalid={error}
            {...props}
          />
          <StyledCheckbox 
            checked={!!checked} 
            error={error}
            disabled={disabled}
            indeterminate={indeterminate && !checked}
          />
          {label && (
            <LabelText htmlFor={checkboxId} disabled={disabled}>
              {label}
            </LabelText>
          )}
        </CheckboxContainer>
        {helperText && <HelperText error={error}>{helperText}</HelperText>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
