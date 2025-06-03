import React from 'react';
import styled from 'styled-components';
import { colors, spacing, typography } from '../ui/theme';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${spacing.md};
`;

export const Form: React.FC<FormProps> = ({ children, onSubmit, ...props }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <StyledForm onSubmit={handleSubmit} {...props}>
      {children}
    </StyledForm>
  );
};

export interface FormGroupProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
}

const getSpacingValue = (spacing: FormGroupProps['spacing']) => {
  switch (spacing) {
    case 'xs':
      return '8px';
    case 'sm':
      return '12px';
    case 'lg':
      return '24px';
    case 'md':
    default:
      return '16px';
  }
};

const FormGroupContainer = styled.div<{
  direction: 'row' | 'column';
  spacing: FormGroupProps['spacing'];
}>`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  width: 100%;
  gap: ${({ spacing }) => getSpacingValue(spacing)};
  margin-bottom: ${spacing.md};
`;

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  direction = 'column',
  spacing = 'md',
}) => {
  return (
    <FormGroupContainer direction={direction} spacing={spacing}>
      {children}
    </FormGroupContainer>
  );
};

export interface FormErrorProps {
  children: React.ReactNode;
}

const ErrorContainer = styled.div`
  color: ${colors.error.main};
  font-size: ${typography.fontSize.sm};
  margin-top: ${spacing.xs};
  margin-bottom: ${spacing.sm};
`;

export const FormError: React.FC<FormErrorProps> = ({ children }) => {
  if (!children) return null;
  
  return <ErrorContainer role="alert">{children}</ErrorContainer>;
};

export interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'space-between';
}

const ActionsContainer = styled.div<{ align: FormActionsProps['align'] }>`
  display: flex;
  justify-content: ${({ align }) => {
    switch (align) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      case 'space-between':
        return 'space-between';
      default:
        return 'flex-end';
    }
  }};
  gap: ${spacing.md};
  margin-top: ${spacing.lg};
`;

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
}) => {
  return <ActionsContainer align={align}>{children}</ActionsContainer>;
};

export interface FormLabelProps {
  children: React.ReactNode;
  htmlFor: string;
  required?: boolean;
}

const LabelContainer = styled.label`
  display: block;
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.xs};
  font-weight: ${typography.fontWeight.medium};
`;

const RequiredAsterisk = styled.span`
  color: ${colors.error.main};
  margin-left: ${spacing.xs};
`;

export const FormLabel: React.FC<FormLabelProps> = ({
  children,
  htmlFor,
  required = false,
}) => {
  return (
    <LabelContainer htmlFor={htmlFor}>
      {children}
      {required && <RequiredAsterisk>*</RequiredAsterisk>}
    </LabelContainer>
  );
};

export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const FieldContainer = styled.div`
  margin-bottom: ${spacing.md};
  width: 100%;
`;

const HintText = styled.div`
  font-size: ${typography.fontSize.xs};
  color: ${colors.text.secondary};
  margin-top: ${spacing.xs};
`;

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  htmlFor,
  error,
  hint,
  required = false,
}) => {
  // Generate a unique ID if not provided
  const [fieldId] = React.useState(() => htmlFor || `field-${Math.random().toString(36).substring(2, 9)}`);
  
  return (
    <FieldContainer>
      {label && (
        <FormLabel htmlFor={fieldId} required={required}>
          {label}
        </FormLabel>
      )}
      
      {/* We're not modifying the children to avoid type issues */}
      {children}
      
      {error && <FormError>{error}</FormError>}
      
      {hint && !error && <HintText id={`${fieldId}-hint`}>{hint}</HintText>}
    </FieldContainer>
  );
};

export default {
  Form,
  FormGroup,
  FormField,
  FormError,
  FormActions,
  FormLabel,
};
