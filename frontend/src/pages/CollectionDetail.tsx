import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import CollectionsService from '../services/collections.service';

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
const STATUSES = ['all', 'draft', 'pending', 'approved', 'rejected'];

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
  margin-bottom: 0.5rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  background-color: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
`;

const CreateButton = styled(Link)`
  display: inline-block;
  background-color: #0078d4;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  
  &:hover {
    background-color: #106ebe;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? '#0078d4' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: ${props => props.active ? '500' : 'normal'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#106ebe' : '#e0e0e0'};
  }
`;

const StatusBadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1rem 0;
`;

const StatusBadge = styled.span<{ status: string; clickable?: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  
  background-color: ${props => {
    switch (props.status) {
      case 'approved':
        return '#e6f7e6';
      case 'rejected':
        return '#ffebee';
      case 'pending':
        return '#fff8e1';
      case 'draft':
      default:
        return '#e3f2fd';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'approved':
        return '#2e7d32';
      case 'rejected':
        return '#c62828';
      case 'pending':
        return '#f57c00';
      case 'draft':
      default:
        return '#1976d2';
    }
  }};
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 5px;
    background-color: ${props => {
      switch (props.status) {
        case 'approved':
          return '#2e7d32';
        case 'rejected':
          return '#c62828';
        case 'pending':
          return '#f57c00';
        case 'draft':
        default:
          return '#1976d2';
      }
    }};
  }
`;

const QAList = styled.div`
  margin-top: 1rem;
`;

const QAItem = styled.div`
  display: block;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const QAContent = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const Question = styled.h2`
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: #333;
`;

const AnswerPreview = styled.p`
  color: #666;
  margin-bottom: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const QAMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #888;
`;

const QAActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
  border-top: 1px solid #eee;
  padding-top: 1rem;
`;

const ActionButton = styled.button<{ variant?: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  background-color: ${props => props.variant === 'primary' ? '#0078d4' : '#f0f0f0'};
  color: ${props => props.variant === 'primary' ? 'white' : '#666'};
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#106ebe' : '#e0e0e0'};
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

const LoadingOrError = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

/**
 * Collection Detail page component.
 * Displays details of a collection and its Q&A pairs.
 */
const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [filteredQAPairs, setFilteredQAPairs] = useState<QAPair[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        // Fetch collection details from API
        const collectionResponse = await CollectionsService.getCollection(id || '');
        setCollection(collectionResponse);
        
        // Fetch QA pairs for this collection
        const qaPairsResponse = await CollectionsService.getQAPairs(id || '');
        setQAPairs(qaPairsResponse);
        setFilteredQAPairs(qaPairsResponse);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching collection data:', err);
        setError('Failed to load collection data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCollectionData();
  }, [id]);
  
  // Filter QA pairs when active filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredQAPairs(qaPairs);
    } else {
      setFilteredQAPairs(qaPairs.filter(qa => qa.status === activeFilter));
    }
  }, [activeFilter, qaPairs]);

  // Update QA pair status
  const updateQAStatus = async (qaId: string, newStatus: string) => {
    try {
      // Call the API to update the status
      await CollectionsService.updateQAPairStatus(qaId, newStatus);
      
      // Update local state
      const updatedQAPairs = qaPairs.map(qa => {
        if (qa.id === qaId) {
          return { ...qa, status: newStatus };
        }
        return qa;
      });
      
      setQAPairs(updatedQAPairs);
      
      // Re-filter the QA pairs
      if (activeFilter === 'all' || activeFilter === newStatus) {
        setFilteredQAPairs(
          activeFilter === 'all' 
            ? updatedQAPairs 
            : updatedQAPairs.filter(qa => qa.status === activeFilter)
        );
      } else {
        // If we're filtering for a different status, remove this QA pair from the filtered list
        setFilteredQAPairs(prev => prev.filter(qa => qa.id !== qaId));
      }
    } catch (err) {
      console.error('Error updating QA pair status:', err);
      // In a real app, we would show an error notification
    }
  };
  
  if (loading) {
    return <LoadingOrError>Loading collection details...</LoadingOrError>;
  }
  
  if (error) {
    return <LoadingOrError>{error}</LoadingOrError>;
  }
  
  if (!collection) {
    return <LoadingOrError>Collection not found</LoadingOrError>;
  }
  
  return (
    <DetailContainer>
      <Header>
        <HeaderContent>
          <Title>{collection.name}</Title>
          <Description>{collection.description}</Description>
          <TagsContainer>
            {collection.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </TagsContainer>
          
          {collection.status_counts && Object.keys(collection.status_counts).length > 0 && (
            <StatusBadgesContainer>
              {['draft', 'pending', 'approved', 'rejected'].map(status => 
                collection.status_counts && collection.status_counts[status] ? (
                  <StatusBadge 
                    key={status} 
                    status={status}
                    clickable
                    onClick={() => setActiveFilter(status)}
                  >
                    {collection.status_counts[status]} {status}
                  </StatusBadge>
                ) : null
              )}
            </StatusBadgesContainer>
          )}
        </HeaderContent>
        
        <CreateButton to={`/create-qa/${collection.id}`}>
          Create New Q&A
        </CreateButton>
      </Header>
      
      <FiltersContainer>
        {STATUSES.map(status => (
          <FilterButton 
            key={status} 
            active={activeFilter === status}
            onClick={() => setActiveFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </FilterButton>
        ))}
      </FiltersContainer>
      
      <QAList>
        {filteredQAPairs.length === 0 ? (
          <EmptyState>
            {activeFilter !== 'all' ? (
              <>
                <EmptyStateTitle>No {activeFilter} Q&A Pairs</EmptyStateTitle>
                <EmptyStateDescription>
                  There are no Q&A pairs with the "{activeFilter}" status.
                </EmptyStateDescription>
                <FilterButton 
                  active={false}
                  onClick={() => setActiveFilter('all')}
                >
                  Show All Q&A Pairs
                </FilterButton>
              </>
            ) : (
              <>
                <EmptyStateTitle>No Q&A Pairs Yet</EmptyStateTitle>
                <EmptyStateDescription>
                  Create your first question and answer pair for this collection.
                </EmptyStateDescription>
                <CreateButton to={`/create-qa/${collection.id}`}>
                  Create New Q&A
                </CreateButton>
              </>
            )}
          </EmptyState>
        ) : (
          filteredQAPairs.map(qa => (
            <QAItem key={qa.id}>
              <QAContent to={`/review-qa/${qa.id}`}>
                <Question>{qa.question}</Question>
                <AnswerPreview>{qa.answer}</AnswerPreview>
                <QAMeta>
                  <StatusBadge status={qa.status}>
                    {qa.status.charAt(0).toUpperCase() + qa.status.slice(1)}
                  </StatusBadge>
                  <span>Created: {new Date(qa.created_at).toLocaleDateString()}</span>
                </QAMeta>
              </QAContent>
              
              <QAActions>
                {/* Quick action buttons to change status */}
                {qa.status !== 'approved' && (
                  <ActionButton 
                    variant="primary"
                    onClick={() => updateQAStatus(qa.id, 'approved')}
                  >
                    Approve
                  </ActionButton>
                )}
                {qa.status !== 'rejected' && (
                  <ActionButton 
                    onClick={() => updateQAStatus(qa.id, 'rejected')}
                  >
                    Reject
                  </ActionButton>
                )}
                {qa.status !== 'pending' && (
                  <ActionButton 
                    onClick={() => updateQAStatus(qa.id, 'pending')}
                  >
                    Mark as Pending
                  </ActionButton>
                )}
                {qa.status !== 'draft' && (
                  <ActionButton 
                    onClick={() => updateQAStatus(qa.id, 'draft')}
                  >
                    Move to Draft
                  </ActionButton>
                )}
              </QAActions>
            </QAItem>
          ))
        )}
      </QAList>
    </DetailContainer>
  );
};

export default CollectionDetail;
