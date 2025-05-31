import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

// API endpoint (would be configured from environment in real app)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Types
interface Collection {
  id: string;
  name: string;
  description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  document_count: number;
  status_counts?: {[key: string]: number};
}

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

const CollectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CollectionCard = styled(Link)`
  display: block;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
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

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  
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
        // Always fetch from the API
        const response = await axios.get(`${API_URL}/api/collections`);
        setCollections(response.data);
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
    return <CollectionsContainer>Loading collections...</CollectionsContainer>;
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
          {collections.map((collection) => (
            <CollectionCard key={collection.id} to={`/collections/${collection.id}`}>
              <CollectionName>{collection.name}</CollectionName>
              <CollectionDescription>{collection.description}</CollectionDescription>
              
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
                      {/* Display statuses in order: draft, pending, approved, rejected */}
                      {['draft', 'pending', 'approved', 'rejected'].map(status => 
                        collection.status_counts && collection.status_counts[status] ? (
                          <StatusBadge key={status} status={status}>
                            {collection.status_counts[status]} {status}
                          </StatusBadge>
                        ) : null
                      )}
                    </StatusBadgesContainer>
                  )}
                </CollectionStats>
                <span>Updated {new Date(collection.updated_at).toLocaleDateString()}</span>
              </CollectionMeta>
            </CollectionCard>
          ))}
        </CollectionGrid>
      )}
    </CollectionsContainer>
  );
};

export default Collections;
