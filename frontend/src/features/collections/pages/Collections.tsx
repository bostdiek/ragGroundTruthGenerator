import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import Card from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  formatStatusLabel as sharedFormatStatusLabel,
  StatusBadge as SharedStatusBadge,
} from '../../../components/ui/StatusPill';
import CollectionsService, {
  Collection as ServiceCollection,
} from '../api/collections.service';

// Types
type Collection = ServiceCollection;

// Styled Components
const CollectionsContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
`;

// Use a styled Link that looks like a button
const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #0078d4;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #106ebe;
  }
`;

const CollectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

// Use the Link to wrap the Card for navigation
const CollectionCardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

// Use the shared Card component with hover effect
const CollectionCard = styled(Card)`
  height: 100%;
`;

const CollectionName = styled.h2`
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
  color: #333;
`;

const CollectionDescription = styled.p`
  margin-bottom: 1rem;
  color: #666;
  line-height: 1.6;
`;

const CollectionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.9rem;
  color: #888;
  margin-top: 1rem;
`;

const CollectionStats = styled.div`
  display: flex;
  flex-direction: column;
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

const StatusBadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

// Using the shared StatusBadge component
const StatusBadge = styled(SharedStatusBadge)`
  // Add the bullet point before the status badge
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
        case 'revision_requested':
          return '#f57c00';
        case 'ready_for_review':
        default:
          return '#1976d2';
      }
    }};
  }
`;

/**
 * Helper function to format status labels for display and make them lowercase
 * for the collections page badges (which use a different formatting style)
 */
const formatStatusLabel = (status: string): string => {
  // Use the shared function but convert to lowercase for this specific usage
  return sharedFormatStatusLabel(status).toLowerCase();
};

/**
 * Collections page component.
 * Displays a list of collections and allows creating new ones.
 */
const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        // Use the collections service
        const data = await CollectionsService.getCollections();
        setCollections(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('Failed to load collections. Please try again later.');
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <CollectionsContainer>
        <Header>
          <Title>Collections</Title>
          <CreateButton to="/collections/new">Create Collection</CreateButton>
        </Header>

        <CollectionGrid>
          {/* Show skeleton loaders while loading */}
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index}>
              <Skeleton height="30px" width="60%" margin="0 0 12px 0" />
              <Skeleton height="60px" margin="0 0 12px 0" />
              <Skeleton height="20px" width="30%" margin="0 0 12px 0" />
              <Skeleton height="40px" margin="0 0 12px 0" />
            </div>
          ))}
        </CollectionGrid>
      </CollectionsContainer>
    );
  }

  if (error) {
    return <CollectionsContainer>{error}</CollectionsContainer>;
  }

  return (
    <CollectionsContainer>
      <Header>
        <Title>Collections</Title>
        <CreateButton to="/collections/new">Create Collection</CreateButton>
      </Header>

      {collections.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No Collections Yet</EmptyStateTitle>
          <EmptyStateDescription>
            Create your first collection to start generating Q&A pairs.
          </EmptyStateDescription>
          <CreateButton to="/collections/new">Create Collection</CreateButton>
        </EmptyState>
      ) : (
        <CollectionGrid>
          {collections.map(collection => (
            <CollectionCardLink
              key={collection.id}
              to={`/collections/${collection.id}`}
            >
              <CollectionCard
                variant="elevated"
                padding="medium"
                elevation="low"
              >
                <CollectionName>{collection.name}</CollectionName>
                <CollectionDescription>
                  {collection.description}
                </CollectionDescription>

                <TagsContainer>
                  {collection.tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </TagsContainer>

                <CollectionMeta>
                  <CollectionStats>
                    <span>{collection.document_count} Q&A Pairs</span>
                    {collection.status_counts && (
                      <StatusBadgesContainer>
                        {/* Display statuses in order: ready_for_review, revision_requested, approved, rejected */}
                        {[
                          'ready_for_review',
                          'revision_requested',
                          'approved',
                          'rejected',
                        ].map(status =>
                          collection.status_counts &&
                          collection.status_counts[status] ? (
                            <StatusBadge key={status} status={status}>
                              {collection.status_counts[status]}{' '}
                              {formatStatusLabel(status)}
                            </StatusBadge>
                          ) : null
                        )}
                      </StatusBadgesContainer>
                    )}
                  </CollectionStats>
                  <span>
                    Updated{' '}
                    {new Date(collection.updated_at).toLocaleDateString()}
                  </span>
                </CollectionMeta>
              </CollectionCard>
            </CollectionCardLink>
          ))}
        </CollectionGrid>
      )}
    </CollectionsContainer>
  );
};

export default Collections;
