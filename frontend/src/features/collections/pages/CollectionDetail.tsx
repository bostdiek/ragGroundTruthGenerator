import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import {
  formatStatusLabel as sharedFormatStatusLabel,
  StatusBadge as SharedStatusBadge,
  StatusFilterGroup,
  StatusFilterPill as SharedStatusFilterPill,
} from '../../../components/ui/StatusPill';
import CollectionsService from '../api/collections.service';

// Types
interface Collection {
  id: string;
  name: string;
  description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  document_count: number;
  status_counts?: { [key: string]: number };
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
  custom_rules?: string[];
  documents: any[];
  collection_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  reviewed_by?: string;
  status: string;
}

// Status constants
const STATUSES = [
  'all',
  'ready_for_review',
  'revision_requested',
  'approved',
  'rejected',
];

// Styled Components
const DetailContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  color: #333;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #666;
  margin-bottom: 1rem;
  max-width: 800px;
  line-height: 1.6;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  background-color: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
`;

const ActionButton = styled(Link)`
  display: inline-block;
  background-color: #0078d4;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  margin-left: 1rem;

  &:hover {
    background-color: #106ebe;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #666;
  text-decoration: none;
  margin-bottom: 1rem;

  &:hover {
    color: #0078d4;
  }

  &:before {
    content: '←';
    margin-right: 0.5rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
`;

// Changed to <label> to support htmlFor attribute
const FilterLabel = styled.label`
  margin-right: 1rem;
  font-weight: 500;
  color: #555;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 250px;

  &:focus {
    outline: none;
    border-color: #0078d4;
  }
`;

const QAList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QACard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const QAHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const Question = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
  margin-right: 1rem;
  flex-grow: 1;
`;

// Using shared components for consistency across the application

const AnswerPreview = styled.div`
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const QAFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #888;
`;

const QAActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionLink = styled(Link)`
  color: #0078d4;
  text-decoration: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;

  &:hover {
    background-color: #f0f7ff;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #f5f5f5;
  border-radius: 8px;
`;

const EmptyStateTitle = styled.h2`
  margin-bottom: 1rem;
  color: #333;
`;

const EmptyStateDescription = styled.p`
  margin-bottom: 2rem;
  color: #666;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const PaginationButton = styled.button<{ disabled?: boolean }>`
  background-color: ${props => (props.disabled ? '#f0f0f0' : 'white')};
  color: ${props => (props.disabled ? '#ccc' : '#333')};
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};

  &:hover:not(:disabled) {
    background-color: #f9f9f9;
    border-color: #ccc;
  }
`;

const PageInfo = styled.div`
  display: flex;
  align-items: center;
  margin: 0 1rem;
  color: #666;
`;

/**
 * Helper function to format status labels for display
 */
// Using the shared formatStatusLabel function from StatusPill component

/**
 * Helper function to truncate text to a certain length
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * CollectionDetail page component.
 * Displays details of a collection and its QA pairs.
 */
const CollectionDetail: React.FC = () => {
  // Support both 'id' and 'collectionId' route params for consistency with tests and routes
  const params = useParams<{ id?: string; collectionId?: string }>();
  const id = params.id ?? params.collectionId;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [filteredQaPairs, setFilteredQaPairs] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        if (!id) return;

        const collectionData = await CollectionsService.getCollection(id);
        setCollection(collectionData);

        const qaPairsData = await CollectionsService.getQAPairs(id);
        setQaPairs(qaPairsData);
        setFilteredQaPairs(qaPairsData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching collection details:', err);
        setError('Failed to load collection details. Please try again later.');
        setLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [id]);

  // Effect to filter QA pairs when status or search query changes
  useEffect(() => {
    if (!qaPairs.length) return;

    let filtered = [...qaPairs];

    // Apply status filter
    if (activeStatus !== 'all') {
      filtered = filtered.filter(qa => qa.status === activeStatus);
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        qa =>
          qa.question.toLowerCase().includes(query) ||
          qa.answer.toLowerCase().includes(query)
      );
    }

    setFilteredQaPairs(filtered);
    setCurrentPage(1);
  }, [qaPairs, activeStatus, searchQuery]);

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    setActiveStatus(newStatus);
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQaPairs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQaPairs.length / itemsPerPage);

  if (loading) {
    return <LoadingState>Loading collection details...</LoadingState>;
  }

  if (error || !collection) {
    return <DetailContainer>{error || 'Collection not found'}</DetailContainer>;
  }

  return (
    <DetailContainer>
      <BackButton to="/collections">Back to Collections</BackButton>

      <Header>
        <HeaderContent>
          <Title>{collection.name}</Title>
          <Description>{collection.description}</Description>

          <TagsContainer>
            {collection.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </TagsContainer>
        </HeaderContent>
        {/* Edit Collection button for navigation */}
        <ActionButton to={`/collections/${collection.id}/edit`} role="button">
          Edit Collection
        </ActionButton>
        {/* Create Q&A Pair link */}
        <ActionButton to={`/create-qa/${collection.id}`}>
          Create Q&A Pair
        </ActionButton>
      </Header>

      <FilterContainer>
        <FilterGroup>
          <FilterLabel>Status:</FilterLabel>
          <StatusFilterGroup role="group" aria-label="Filter by status">
            {STATUSES.map(status => (
              <SharedStatusFilterPill
                key={status}
                status={status}
                active={activeStatus === status}
                onClick={() => handleStatusChange(status)}
                aria-pressed={activeStatus === status}
              >
                {sharedFormatStatusLabel(status)}
              </SharedStatusFilterPill>
            ))}
          </StatusFilterGroup>
        </FilterGroup>

        <SearchInput
          type="text"
          placeholder="Search questions or answers..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          aria-label="Search questions or answers"
        />
      </FilterContainer>

      {currentItems.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No Q&A Pairs Found</EmptyStateTitle>
          <EmptyStateDescription>
            {activeStatus === 'all' && searchQuery === ''
              ? 'Create your first Q&A pair to get started.'
              : 'Try changing your filters to see more results.'}
          </EmptyStateDescription>
          {activeStatus === 'all' && searchQuery === '' && (
            <ActionButton to={`/create-qa/${collection.id}`}>
              Create Q&A Pair
            </ActionButton>
          )}
        </EmptyState>
      ) : (
        <>
          <QAList>
            {currentItems.map(qa => (
              <QACard key={qa.id}>
                <QAHeader>
                  <Question>{qa.question}</Question>
                  <SharedStatusBadge status={qa.status}>
                    {sharedFormatStatusLabel(qa.status)}
                  </SharedStatusBadge>
                </QAHeader>

                <AnswerPreview>{truncateText(qa.answer, 300)}</AnswerPreview>

                <QAFooter>
                  <span>
                    Created {new Date(qa.created_at).toLocaleDateString()}
                  </span>

                  <QAActions>
                    {(qa.status === 'approved' || qa.status === 'rejected') && (
                      <ActionLink to={`/review-qa/${qa.id}`}>View</ActionLink>
                    )}
                    {(qa.status === 'ready_for_review' ||
                      qa.status === 'revision_requested') && (
                      <ActionLink to={`/review-qa/${qa.id}`}>Review</ActionLink>
                    )}
                  </QAActions>
                </QAFooter>
              </QACard>
            ))}
          </QAList>

          {filteredQaPairs.length > itemsPerPage && (
            <PaginationContainer>
              <PaginationButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </PaginationButton>

              <PageInfo>
                Page {currentPage} of {totalPages}
              </PageInfo>

              <PaginationButton
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}
    </DetailContainer>
  );
};

export default CollectionDetail;
