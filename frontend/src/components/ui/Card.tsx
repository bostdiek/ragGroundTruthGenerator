import React, {
  ForwardRefExoticComponent,
  HTMLAttributes,
  ReactNode,
  RefAttributes,
} from 'react';
import styled, { css } from 'styled-components';

import { borderRadius, colors, shadows, spacing } from './theme';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  children?: ReactNode;
}

// Define types for the compound components
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
}

interface CardSubtitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

interface CardActionsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

// Define the type for the compound component structure
interface CardComponent
  extends ForwardRefExoticComponent<CardProps & RefAttributes<HTMLDivElement>> {
  Header: ForwardRefExoticComponent<
    CardHeaderProps & RefAttributes<HTMLDivElement>
  >;
  Title: ForwardRefExoticComponent<
    CardTitleProps & RefAttributes<HTMLHeadingElement>
  >;
  Subtitle: ForwardRefExoticComponent<
    CardSubtitleProps & RefAttributes<HTMLHeadingElement>
  >;
  Content: ForwardRefExoticComponent<
    CardContentProps & RefAttributes<HTMLDivElement>
  >;
  Actions: ForwardRefExoticComponent<
    CardActionsProps & RefAttributes<HTMLDivElement>
  >;
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

// Card Header component
const StyledCardHeader = styled.div`
  padding: ${spacing.md};
  border-bottom: 1px solid ${colors.grey[200]};
`;

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledCardHeader ref={ref} {...props}>
        {children}
      </StyledCardHeader>
    );
  }
);

CardHeader.displayName = 'Card.Header';

// Card Title component
const StyledCardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: ${colors.grey[900]};
`;

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledCardTitle ref={ref} {...props}>
        {children}
      </StyledCardTitle>
    );
  }
);

CardTitle.displayName = 'Card.Title';

// Card Subtitle component
const StyledCardSubtitle = styled.h4`
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  font-weight: 400;
  color: ${colors.grey[600]};
`;

const CardSubtitle = React.forwardRef<HTMLHeadingElement, CardSubtitleProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledCardSubtitle ref={ref} {...props}>
        {children}
      </StyledCardSubtitle>
    );
  }
);

CardSubtitle.displayName = 'Card.Subtitle';

// Card Content component
const StyledCardContent = styled.div`
  padding: ${spacing.md};
`;

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledCardContent ref={ref} {...props}>
        {children}
      </StyledCardContent>
    );
  }
);

CardContent.displayName = 'Card.Content';

// Card Actions component
const StyledCardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${spacing.sm} ${spacing.md};
  border-top: 1px solid ${colors.grey[200]};
  gap: ${spacing.sm};
`;

const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledCardActions ref={ref} {...props}>
        {children}
      </StyledCardActions>
    );
  }
);

CardActions.displayName = 'Card.Actions';

// Main Card component
const CardBase = React.forwardRef<HTMLDivElement, CardProps>(
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

CardBase.displayName = 'Card';

// Create the compound component with proper typing
const Card = CardBase as CardComponent;
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Content = CardContent;
Card.Actions = CardActions;

export default Card;
