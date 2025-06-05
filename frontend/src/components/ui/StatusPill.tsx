import React from 'react';
import styled from 'styled-components';

// Define the type for status colors
type StatusType =
  | 'approved'
  | 'rejected'
  | 'revision_requested'
  | 'ready_for_review'
  | 'all'
  | string;

type StatusColorConfig = {
  background: string;
  activeBackground: string;
  text: string;
};

// Constants for status colors
const STATUS_COLORS: Record<StatusType, StatusColorConfig> = {
  approved: {
    background: '#e6f7e6',
    activeBackground: '#d4f0d4',
    text: '#2e7d32',
  },
  rejected: {
    background: '#ffebee',
    activeBackground: '#ffcdd2',
    text: '#c62828',
  },
  revision_requested: {
    background: '#fff8e1',
    activeBackground: '#ffe082',
    text: '#ef6c00',
  },
  ready_for_review: {
    background: '#e3f2fd',
    activeBackground: '#bbdefb',
    text: '#0277bd',
  },
  all: {
    background: '#f5f5f5',
    activeBackground: '#e0e0e0',
    text: '#424242',
  },
  // Default catch-all for any other status
  default: {
    background: '#e3f2fd',
    activeBackground: '#bbdefb',
    text: '#0277bd',
  },
};

// Base styling for all status pills
const BasePill = styled.span<{ status: string }>`
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;

  background-color: ${props => {
    const status = props.status as StatusType;
    return (STATUS_COLORS[status] || STATUS_COLORS.default).background;
  }};

  color: ${props => {
    const status = props.status as StatusType;
    return (STATUS_COLORS[status] || STATUS_COLORS.default).text;
  }};
`;

// StatusBadge component (display only)
const StyledStatusBadge = styled(BasePill)`
  // Additional badge-specific styling could be added here
`;

// StatusFilterPill component (interactive)
const StyledFilterPill = styled(BasePill).attrs({ as: 'button' })<{
  active: boolean;
}>`
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  margin-right: 0.5rem;

  background-color: ${props => {
    const status = props.status as StatusType;
    const statusColor = STATUS_COLORS[status] || STATUS_COLORS.default;
    return props.active ? statusColor.activeBackground : statusColor.background;
  }};

  // Add subtle outline when active
  box-shadow: ${props => (props.active ? '0 0 0 1px currentColor' : 'none')};

  &:hover {
    filter: brightness(0.95);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.5);
  }
`;

// Helper function to format status labels
export const formatStatusLabel = (status: string): string => {
  switch (status) {
    case 'ready_for_review':
      return 'Ready for Review';
    case 'revision_requested':
      return 'Revision Requested';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'all':
      return 'All';
    default:
      return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
};

// StatusBadge props
export interface StatusBadgeProps {
  status: string;
  children?: React.ReactNode;
  className?: string;
}

// StatusFilterPill props
export interface StatusFilterPillProps {
  status: string;
  active: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}

// StatusBadge component
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className,
}) => {
  return (
    <StyledStatusBadge status={status} className={className}>
      {children || formatStatusLabel(status)}
    </StyledStatusBadge>
  );
};

// Container for multiple filter pills
export const StatusFilterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

// StatusFilterPill component
export const StatusFilterPill: React.FC<StatusFilterPillProps> = ({
  status,
  active,
  onClick,
  children,
  className,
}) => {
  return (
    <StyledFilterPill
      status={status}
      active={active}
      onClick={onClick}
      aria-pressed={active}
      className={className}
    >
      {children || formatStatusLabel(status)}
    </StyledFilterPill>
  );
};

export default {
  StatusBadge,
  StatusFilterPill,
  StatusFilterGroup,
  formatStatusLabel,
};
