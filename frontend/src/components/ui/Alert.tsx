import React from 'react';
import styled, { css } from 'styled-components';

import {
  borderRadius,
  colors,
  spacing,
  transitions,
  typography,
} from './theme';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const getAlertColors = (variant: AlertVariant) => {
  switch (variant) {
    case 'success':
      return {
        background: colors.success.light,
        border: colors.success.main,
        icon: colors.success.main,
        text: colors.success.dark,
      };
    case 'error':
      return {
        background: colors.error.light,
        border: colors.error.main,
        icon: colors.error.main,
        text: colors.error.dark,
      };
    case 'warning':
      return {
        background: colors.warning.light,
        border: colors.warning.main,
        icon: colors.warning.main,
        text: colors.warning.dark,
      };
    case 'info':
    default:
      return {
        background: colors.info.light,
        border: colors.info.main,
        icon: colors.info.main,
        text: colors.info.dark,
      };
  }
};

const AlertContainer = styled.div<{
  variant: AlertVariant;
  fullWidth?: boolean;
}>`
  display: flex;
  padding: ${spacing.md};
  border-radius: ${borderRadius.md};
  background-color: ${({ variant }) => getAlertColors(variant).background};
  border-left: 4px solid ${({ variant }) => getAlertColors(variant).border};
  color: ${({ variant }) => getAlertColors(variant).text};
  margin: ${spacing.md} 0;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  box-sizing: border-box;
`;

const IconContainer = styled.div<{ variant: AlertVariant }>`
  display: flex;
  align-items: flex-start;
  margin-right: ${spacing.md};
  color: ${({ variant }) => getAlertColors(variant).icon};
  flex-shrink: 0;
`;

const ContentContainer = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-family: ${typography.fontFamily.primary};
  font-weight: ${typography.fontWeight.semiBold};
  font-size: ${typography.fontSize.md};
  margin-bottom: ${spacing.xs};
`;

const AlertContent = styled.div`
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.sm};
`;

const CloseButton = styled.button<{ variant: AlertVariant }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${spacing.xs};
  margin: -${spacing.xs};
  color: ${({ variant }) => getAlertColors(variant).text};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  margin-left: ${spacing.sm};
  flex-shrink: 0;
  transition: background-color ${transitions.duration.short}
    ${transitions.easing.easeInOut};

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: none;
  }
`;

// Default icons for each variant
const DefaultIcons = {
  success: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M8 12L11 15L16 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M15 9L9 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 9L15 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  warning: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 9V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 17.5V17.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),
  info: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 16V12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 8V8.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  icon,
  fullWidth = false,
}) => {
  const defaultIcon = DefaultIcons[variant];

  return (
    <AlertContainer variant={variant} fullWidth={fullWidth}>
      <IconContainer variant={variant}>{icon || defaultIcon}</IconContainer>
      <ContentContainer>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertContent>{children}</AlertContent>
      </ContentContainer>
      {onClose && (
        <CloseButton
          onClick={onClose}
          aria-label="Close alert"
          variant={variant}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CloseButton>
      )}
    </AlertContainer>
  );
};

export default Alert;
