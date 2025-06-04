/**
 * QAPairList Component
 *
 * This component displays a list of QA pairs for a collection.
 */

import React, { useState } from 'react';
import styled from 'styled-components';

import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { QAPair, QAPairFilters } from '../types';
import { filterQAPairs, formatDate, sortQAPairs } from '../utils';

interface QAPairListProps {
  qaPairs: QAPair[];
  collectionId: string;
  onEditQAPair: (qaPairId: string) => void;
}

// Styled components
const ListContainer = styled(Card)`
  overflow: hidden;
`;

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 120px 120px 100px;
  gap: 1rem;
  background-color: #f9fafb;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
`;

const ListItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 120px 120px 100px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;

  &:hover {
    background-color: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Question = styled.div`
  font-weight: 500;
  color: #111827;
`;

const Answer = styled.div`
  color: #4b5563;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Date = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const Status = styled.div<{ status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;

  ${({ status }) => {
    switch (status) {
      case 'approved':
        return `
          background-color: #d1fae5;
          color: #065f46;
        `;
      case 'ready_for_review':
        return `
          background-color: #fef3c7;
          color: #92400e;
        `;
      case 'revision_requested':
        return `
          background-color: #fee2e2;
          color: #b91c1c;
        `;
      case 'rejected':
        return `
          background-color: #fecaca;
          color: #991b1b;
        `;
      default:
        return `
          background-color: #e5e7eb;
          color: #374151;
        `;
    }
  }}
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6b7280;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

/**
 * QA Pair List Component
 */
const QAPairList: React.FC<QAPairListProps> = ({
  qaPairs,
  collectionId,
  onEditQAPair,
}) => {
  // State for filters
  const [filters, setFilters] = useState<QAPairFilters>({
    search: '',
    status: [],
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });

  // Apply filters and sorting
  const filteredQAPairs = filterQAPairs(qaPairs, {
    search: filters.search,
    status: filters.status,
  });

  const sortedQAPairs = sortQAPairs(
    filteredQAPairs,
    filters.sortBy,
    filters.sortOrder
  );

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  // Handle status filter change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      status: value === 'all' ? [] : [value],
    });
  };

  // Status options for select dropdown
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'ready_for_review', label: 'Ready for Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'revision_requested', label: 'Revision Requested' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div>
      <FiltersContainer>
        <Input
          type="text"
          placeholder="Search Q&A pairs..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          size="medium"
          fullWidth
        />
        <Select
          value={
            filters.status && filters.status.length > 0
              ? filters.status[0]
              : 'all'
          }
          onChange={handleStatusChange}
          options={statusOptions}
          size="medium"
        />
      </FiltersContainer>

      <ListContainer>
        <ListHeader>
          <div>Question</div>
          <div>Answer</div>
          <div>Created</div>
          <div>Status</div>
          <div>Actions</div>
        </ListHeader>

        {sortedQAPairs.length === 0 ? (
          <EmptyState>No QA pairs found.</EmptyState>
        ) : (
          sortedQAPairs.map(qaPair => (
            <ListItem key={qaPair.id}>
              <Question>{qaPair.question}</Question>
              <Answer>{qaPair.answer}</Answer>
              <Date>{formatDate(qaPair.created_at)}</Date>
              <Status status={qaPair.status}>
                {qaPair.status.replace('_', ' ')}
              </Status>
              <Actions>
                <Button
                  onClick={() => onEditQAPair(qaPair.id)}
                  variant="outline"
                  size="small"
                >
                  Edit
                </Button>
              </Actions>
            </ListItem>
          ))
        )}
      </ListContainer>
    </div>
  );
};

export default QAPairList;
