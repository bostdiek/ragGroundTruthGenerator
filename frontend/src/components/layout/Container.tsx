import React from 'react';
import styled from 'styled-components';

import { breakpoints, spacing } from '../ui/theme';

export interface ContainerProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  className?: string;
  children: React.ReactNode;
}

const StyledContainer = styled.div<{
  maxWidth: ContainerProps['maxWidth'];
  padding: boolean;
}>`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;

  ${({ padding }) =>
    padding &&
    `
    padding-left: ${spacing.md};
    padding-right: ${spacing.md};
    
    @media (min-width: ${breakpoints.sm}) {
      padding-left: ${spacing.lg};
      padding-right: ${spacing.lg};
    }
  `}

  max-width: ${({ maxWidth }) => {
    switch (maxWidth) {
      case 'xs':
        return '600px';
      case 'sm':
        return '960px';
      case 'md':
        return '1280px';
      case 'lg':
        return '1440px';
      case 'xl':
        return '1920px';
      case 'full':
      default:
        return '100%';
    }
  }};
`;

export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'md',
  padding = true,
  className,
  children,
  ...rest
}) => {
  return (
    <StyledContainer
      maxWidth={maxWidth}
      padding={padding}
      className={className}
      data-testid="container"
      {...rest}
    >
      {children}
    </StyledContainer>
  );
};

export default Container;
