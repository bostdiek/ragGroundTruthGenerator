import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

// API endpoint (would be configured from environment in real app)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Types
interface Collection {
  id: string;
  name: string;
  description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  owner_id: string;
  item_count: number;
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
  font-size: 0.9rem;
  color: #888;
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
        // In a real app, this would fetch from the API
        // For demo purposes, we'll use a mock response or fetch from a local endpoint
        if (process.env.NODE_ENV === 'development') {
          // Simulate API response in development
          setTimeout(() => {
            const mockCollections: Collection[] = [
              {
                id: '1',
                name: 'Maintenance Manuals',
                description: 'Questions and answers related to maintenance procedures',
                tags: ['maintenance', 'procedures', 'manuals'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                owner_id: 'demo_user_id',
                item_count: 10
              },
              {
                id: '2',
                name: 'SAP Notifications',
                description: 'Questions and answers related to SAP notifications',
                tags: ['sap', 'notifications', 'erp'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                owner_id: 'demo_user_id',
                item_count: 5
              }
            ];
            setCollections(mockCollections);
            setLoading(false);
          }, 500);
        } else {
          // Fetch from API in production
          const response = await axios.get(`${API_URL}/collections`);
          setCollections(response.data);
          setLoading(false);
        }
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
                <span>{collection.item_count} items</span>
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
