import React, { useEffect, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';

import {
  borderRadius,
  colors,
  shadows,
  spacing,
  transitions,
  zIndex,
} from './theme';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
  children: React.ReactNode;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${zIndex.modal};
  animation: ${css`
      ${fadeIn}`} ${transitions.duration.medium} ${transitions.easing.easeOut};
`;

const ModalContent = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  background-color: ${colors.common.white};
  border-radius: ${borderRadius.md};
  box-shadow: ${shadows.lg};
  max-width: ${({ size }) => {
    switch (size) {
      case 'small':
        return '400px';
      case 'large':
        return '800px';
      case 'medium':
      default:
        return '600px';
    }
  }};
  width: 100%;
  max-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  animation: ${css`
      ${slideIn}`} ${transitions.duration.medium} ${transitions.easing.easeOut};
  margin: ${spacing.md};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md} ${spacing.lg};
  border-bottom: 1px solid ${colors.grey[200]};
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: ${colors.text.primary};
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  transition: background-color ${transitions.duration.short}
    ${transitions.easing.easeInOut};

  &:hover {
    background-color: ${colors.grey[100]};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.primary.light};
  }
`;

const ModalBody = styled.div`
  padding: ${spacing.lg};
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${spacing.md} ${spacing.lg};
  border-top: 1px solid ${colors.grey[200]};
  gap: ${spacing.sm};
`;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  footer,
  size = 'medium',
  closeOnEsc = true,
  closeOnOutsideClick = true,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEsc]);

  // Handle outside click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent ref={modalRef} size={size} role="dialog" aria-modal="true">
        {title && (
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
            <CloseButton onClick={onClose} aria-label="Close modal">
              <svg
                width="18"
                height="18"
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
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
