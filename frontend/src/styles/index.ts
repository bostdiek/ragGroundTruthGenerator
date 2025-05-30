/**
 * AI Ground Truth Generator - Global Styles
 * 
 * This file contains global style definitions and styled component helpers.
 * Import and use these styles in your components for consistent styling.
 */

import styled from 'styled-components';
import theme from './theme';

/**
 * Common styled components for consistent UI elements
 */

// Container components
export const PageContainer = styled.div`
  padding: ${theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`;

export const SectionContainer = styled.section`
  margin-bottom: ${theme.spacing.lg};
`;

export const CardContainer = styled.div`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

// Typography components
export const Title = styled.h1`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: ${theme.typography.fontWeightSemibold};
  margin-bottom: ${theme.spacing.md};
`;

export const Subtitle = styled.h2`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeightSemibold};
  margin-bottom: ${theme.spacing.md};
`;

export const SectionTitle = styled.h3`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.large};
  font-weight: ${theme.typography.fontWeightSemibold};
  margin-bottom: ${theme.spacing.sm};
`;

export const Paragraph = styled.p`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  line-height: 1.5;
  margin-bottom: ${theme.spacing.md};
`;

export const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.small};
  font-weight: ${theme.typography.fontWeightSemibold};
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.textSecondary};
`;

// Button components
export const Button = styled.button`
  display: inline-block;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.textInverse};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeightSemibold};
  cursor: pointer;
  transition: background-color ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${theme.colors.borderLight};
    color: ${theme.colors.textDisabled};
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  
  &:hover {
    background-color: ${theme.colors.primaryLight};
    color: ${theme.colors.primary};
  }
  
  &:disabled {
    border-color: ${theme.colors.borderLight};
    color: ${theme.colors.textDisabled};
    background-color: transparent;
  }
`;

export const LinkButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: ${theme.typography.fontSize.base};
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  
  &:hover {
    color: ${theme.colors.primaryDark};
  }
  
  &:disabled {
    color: ${theme.colors.textDisabled};
    cursor: not-allowed;
  }
`;

// Form components
export const Form = styled.form`
  margin-bottom: ${theme.spacing.lg};
`;

export const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

export const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  transition: border-color ${theme.transitions.fast};
  
  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  min-height: 120px;
  transition: border-color ${theme.transitions.fast};
  
  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  transition: border-color ${theme.transitions.fast};
  
  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

// Layout components
export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SpaceBetween = styled(FlexRow)`
  justify-content: space-between;
`;

export const Center = styled(FlexRow)`
  justify-content: center;
`;

// Utility components
export const Badge = styled.span<{ variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' }>`
  display: inline-block;
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.tiny};
  font-weight: ${theme.typography.fontWeightSemibold};
  text-transform: uppercase;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background-color: ${theme.colors.success}15;
          color: ${theme.colors.success};
        `;
      case 'warning':
        return `
          background-color: ${theme.colors.warning}15;
          color: ${theme.colors.warning};
        `;
      case 'error':
        return `
          background-color: ${theme.colors.error}15;
          color: ${theme.colors.error};
        `;
      case 'info':
        return `
          background-color: ${theme.colors.info}15;
          color: ${theme.colors.info};
        `;
      default:
        return `
          background-color: ${theme.colors.primary}15;
          color: ${theme.colors.primary};
        `;
    }
  }}
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.borderLight};
  margin: ${theme.spacing.md} 0;
`;

export const Tag = styled.span`
  display: inline-block;
  padding: ${theme.spacing.xxs} ${theme.spacing.xs};
  background-color: ${theme.colors.backgroundLight};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.small};
  margin-right: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.xs};
`;

export const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.small};
  margin-top: ${theme.spacing.xs};
`;

// Responsive helpers
export const Hide = styled.div<{ below?: keyof typeof theme.breakpoints }>`
  ${props => props.below && `
    @media (max-width: ${theme.breakpoints[props.below]}) {
      display: none;
    }
  `}
`;

export const Show = styled.div<{ below?: keyof typeof theme.breakpoints }>`
  display: none;
  
  ${props => props.below && `
    @media (max-width: ${theme.breakpoints[props.below]}) {
      display: block;
    }
  `}
`;

export default {
  theme,
};
