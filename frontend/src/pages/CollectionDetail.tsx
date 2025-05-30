import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

interface QAPair {
  id: string;
  question: string;
  answer: string;
  custom_rules: string[];
  documents: any[];
  collection_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  reviewed_by?: string;
  review_status: string;
}

// Styled Components
const DetailContainer = styled.div`
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

const HeaderContent = styled.div``;

const Title = styled.h1`
  color: #333;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #666;
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

const QAList = styled.div`
  margin-top: 2rem;
`;

const QAItem = styled(Link)`
  display: block;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
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

const ReviewStatus = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'approved': return '#e6f7e6';
      case 'rejected': return '#fce8e8';
      default: return '#f0f0f0';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'approved': return '#2e7d32';
      case 'rejected': return '#d32f2f';
      default: return '#666';
    }
  }};
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
 * Collection Detail page component.
 * Displays details of a collection and its Q&A pairs.
 */
const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        // In a real app, this would fetch from the API
        // For demo purposes, we'll use mock data
        setTimeout(() => {
          const mockCollection: Collection = {
            id: id || '1',
            name: 'Maintenance Manuals',
            description: 'Questions and answers related to maintenance procedures',
            tags: ['maintenance', 'procedures', 'manuals'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            owner_id: 'demo_user_id',
            item_count: 3
          };
          
          const mockQAPairs: QAPair[] = [
            {
              id: '1',
              question: 'How do I replace the air filter in a Model X?',
              answer: 'To replace the air filter in a Model X, follow these steps:\n\n1. Open the hood\n2. Locate the air filter housing\n3. Remove the cover\n4. Replace the filter\n5. Replace the cover\n6. Close the hood',
              custom_rules: ['Use numbered lists for step-by-step instructions'],
              documents: [
                { id: 'doc1', title: 'Model X Maintenance Manual', source: 'manuals' }
              ],
              collection_id: id || '1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: 'demo_user_id',
              reviewed_by: 'reviewer_id',
              review_status: 'approved'
            },
            {
              id: '2',
              question: 'What are the signs of a clogged air filter?',
              answer: 'Signs of a clogged air filter include:\n\n- Reduced fuel efficiency\n- Unusual smells from the ventilation system\n- Decreased engine performance\n- Increased engine noise',
              custom_rules: ['Use bullet points for lists'],
              documents: [
                { id: 'doc3', title: 'Wiki: Common Maintenance Issues', source: 'wiki' }
              ],
              collection_id: id || '1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: 'demo_user_id',
              review_status: 'pending'
            },
            {
              id: '3',
              question: 'How often should air filters be replaced?',
              answer: 'Air filters should be replaced every 12 months or 12,000 miles, whichever comes first. However, if you drive in dusty conditions or heavy traffic, you may need to replace it more frequently.',
              custom_rules: [],
              documents: [
                { id: 'doc2', title: 'Maintenance Schedule', source: 'manuals' }
              ],
              collection_id: id || '1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: 'demo_user_id',
              reviewed_by: 'reviewer_id',
              review_status: 'approved'
            }
          ];
          
          setCollection(mockCollection);
          setQAPairs(mockQAPairs);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching collection data:', err);
        setError('Failed to load collection data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCollectionData();
  }, [id]);
  
  if (loading) {
    return <DetailContainer>Loading collection details...</DetailContainer>;
  }
  
  if (error) {
    return <DetailContainer>{error}</DetailContainer>;
  }
  
  if (!collection) {
    return <DetailContainer>Collection not found</DetailContainer>;
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
        </HeaderContent>
        
        <CreateButton to={`/create-qa/${collection.id}`}>
          Create New Q&A
        </CreateButton>
      </Header>
      
      <QAList>
        {qaPairs.length === 0 ? (
          <EmptyState>
            <EmptyStateTitle>No Q&A Pairs Yet</EmptyStateTitle>
            <EmptyStateDescription>
              Create your first question and answer pair for this collection.
            </EmptyStateDescription>
            <CreateButton to={`/create-qa/${collection.id}`}>
              Create New Q&A
            </CreateButton>
          </EmptyState>
        ) : (
          qaPairs.map(qa => (
            <QAItem key={qa.id} to={`/review-qa/${qa.id}`}>
              <Question>{qa.question}</Question>
              <AnswerPreview>{qa.answer}</AnswerPreview>
              <QAMeta>
                <span>Created: {new Date(qa.created_at).toLocaleDateString()}</span>
                <ReviewStatus status={qa.review_status}>
                  {qa.review_status.charAt(0).toUpperCase() + qa.review_status.slice(1)}
                </ReviewStatus>
              </QAMeta>
            </QAItem>
          ))
        )}
      </QAList>
    </DetailContainer>
  );
};

export default CollectionDetail;
