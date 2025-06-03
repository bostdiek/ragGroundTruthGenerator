import React, { HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { colors, borderRadius, shadows, spacing } from './theme';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  elevation?: 'none' | 'low' | 'medium' | 'high';
}

const StyledCard = styled.div<CardProps>`
  background-color: ${colors.common.white};
  border-radius: ${borderRadius.md};
  overflow: hidden;
  box-sizing: border-box;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  /* Variant */
  ${({ variant }) =>
    variant === 'outlined'
      ? css`
          border: 1px solid ${colors.grey[300]};
        `
      : css`
          border: none;
        `}

  /* Elevation */
  ${({ elevation }) => {
    switch (elevation) {
      case 'none':
        return css`
          box-shadow: ${shadows.none};
        `;
      case 'low':
        return css`
          box-shadow: ${shadows.sm};
        `;
      case 'high':
        return css`
          box-shadow: ${shadows.lg};
        `;
      case 'medium':
      default:
        return css`
          box-shadow: ${shadows.md};
        `;
    }
  }}

  /* Padding */
  ${({ padding }) => {
    switch (padding) {
      case 'none':
        return css`
          padding: 0;
        `;
      case 'small':
        return css`
          padding: ${spacing.sm};
        `;
      case 'large':
        return css`
          padding: ${spacing.xl};
        `;
      case 'medium':
      default:
        return css`
          padding: ${spacing.md};
        `;
    }
  }}
`;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { 
      children, 
      variant = 'elevated', 
      padding = 'medium', 
      fullWidth = false, 
      elevation = 'medium',
      ...props 
    }, 
    ref
  ) => {
    return (
      <StyledCard
        ref={ref}
        variant={variant}
        padding={padding}
        fullWidth={fullWidth}
        elevation={elevation}
        {...props}
      >
        {children}
      </StyledCard>
    );
  }
);

// Card subcomponents
const CardHeader = styled.div`
  padding: ${spacing.md};
  padding-bottom: ${spacing.sm};
  border-bottom: 1px solid ${colors.grey[200]};
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  margin: 0;
  color: ${colors.text.primary};
`;

const CardSubtitle = styled.h4`
  font-size: 0.875rem;
  margin: ${spacing.xs} 0 0;
  color: ${colors.text.secondary};
  font-weight: 400;
`;

const CardContent = styled.div`
  padding: ${spacing.md};
`;

const CardActions = styled.div`
  display: flex;
  padding: ${spacing.sm} ${spacing.md};
  border-top: 1px solid ${colors.grey[200]};
  justify-content: flex-end;
  
  & > * {
    margin-left: ${spacing.sm};
  }
`;

// Add displayName for all components
Card.displayName = 'Card';

// Export subcomponents as part of Card
export const CardComponents = {
  Header: CardHeader,
  Title: CardTitle,
  Subtitle: CardSubtitle,
  Content: CardContent,
  Actions: CardActions,
};

export default Object.assign(Card, CardComponents);
