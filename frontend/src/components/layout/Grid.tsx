import React from 'react';
import styled, { css } from 'styled-components';

import { breakpoints, spacing } from '../ui/theme';

// Grid component
export interface GridProps {
  container?: boolean;
  item?: boolean;
  xs?: number; // 1-12 columns for extra small screens
  sm?: number; // 1-12 columns for small screens
  md?: number; // 1-12 columns for medium screens
  lg?: number; // 1-12 columns for large screens
  xl?: number; // 1-12 columns for extra large screens
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none';
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  className?: string;
  children?: React.ReactNode;
}

const getSpacingValue = (size: GridProps['spacing']) => {
  switch (size) {
    case 'xs':
      return spacing.xs;
    case 'sm':
      return spacing.sm;
    case 'md':
      return spacing.md;
    case 'lg':
      return spacing.lg;
    case 'xl':
      return spacing.xl;
    case 'none':
    default:
      return '0';
  }
};

const getColumnWidth = (size: number) => {
  return `${(size / 12) * 100}%`;
};

const StyledGrid = styled.div<GridProps>`
  box-sizing: border-box;

  ${props =>
    props.container &&
    css`
      display: flex;
      flex-wrap: ${props.wrap || 'wrap'};
      flex-direction: ${props.direction || 'row'};
      justify-content: ${props.justifyContent || 'flex-start'};
      align-items: ${props.alignItems || 'flex-start'};
      width: 100%;
      margin: ${props.spacing && props.spacing !== 'none'
        ? `-${getSpacingValue(props.spacing)}`
        : '0'};

      & > * {
        padding: ${props.spacing && props.spacing !== 'none'
          ? getSpacingValue(props.spacing)
          : '0'};
      }
    `}

  ${props =>
    props.item &&
    props.xs &&
    css`
      flex-basis: ${getColumnWidth(props.xs)};
      max-width: ${getColumnWidth(props.xs)};
    `}
  
  ${props =>
    props.item &&
    props.sm &&
    css`
      @media (min-width: ${breakpoints.sm}) {
        flex-basis: ${getColumnWidth(props.sm)};
        max-width: ${getColumnWidth(props.sm)};
      }
    `}
  
  ${props =>
    props.item &&
    props.md &&
    css`
      @media (min-width: ${breakpoints.md}) {
        flex-basis: ${getColumnWidth(props.md)};
        max-width: ${getColumnWidth(props.md)};
      }
    `}
  
  ${props =>
    props.item &&
    props.lg &&
    css`
      @media (min-width: ${breakpoints.lg}) {
        flex-basis: ${getColumnWidth(props.lg)};
        max-width: ${getColumnWidth(props.lg)};
      }
    `}
  
  ${props =>
    props.item &&
    props.xl &&
    css`
      @media (min-width: ${breakpoints.xl}) {
        flex-basis: ${getColumnWidth(props.xl)};
        max-width: ${getColumnWidth(props.xl)};
      }
    `}
`;

export const Grid: React.FC<GridProps> = props => {
  return <StyledGrid {...props} />;
};

// Flex component
export interface FlexProps {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  alignContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'stretch';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none';
  className?: string;
  children?: React.ReactNode;
}

const StyledFlex = styled.div<FlexProps>`
  display: flex;
  flex-direction: ${({ direction }) => direction || 'row'};
  justify-content: ${({ justifyContent }) => justifyContent || 'flex-start'};
  align-items: ${({ alignItems }) => alignItems || 'flex-start'};
  align-content: ${({ alignContent }) => alignContent || 'flex-start'};
  flex-wrap: ${({ wrap }) => wrap || 'nowrap'};
  gap: ${({ gap }) => (gap && gap !== 'none' ? getSpacingValue(gap) : '0')};
`;

export const Flex: React.FC<FlexProps> = props => {
  return <StyledFlex {...props} />;
};

// Export both components
export default { Grid, Flex };
