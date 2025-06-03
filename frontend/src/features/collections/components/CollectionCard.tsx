/**
 * CollectionCard Component
 * 
 * This component displays a card representing a collection with key information.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Card from '../../../components/ui/Card';
import { Collection } from '../types';
import { formatDate } from '../utils';

interface CollectionCardProps {
  collection: Collection;
}

// Styled components
const StyledCard = styled(Card)`
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.25rem;
`;

const Description = styled.p`
  color: #666;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  background-color: #eef2ff;
  color: #4f46e5;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.875rem;
`;

const StatusCount = styled.div`
  display: flex;
  gap: 1rem;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

/**
 * Collection Card Component
 */
const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  return (
    <StyledLink to={`/collections/${collection.id}`}>
      <StyledCard variant="elevated" padding="medium">
        <div>
          <CardHeader>
            <Title>{collection.name}</Title>
          </CardHeader>
          
          <Description>{collection.description}</Description>
          
          {collection.tags && collection.tags.length > 0 && (
            <TagsContainer>
              {collection.tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </TagsContainer>
          )}
          
          <MetaInfo>
            <div>Created: {formatDate(collection.created_at)}</div>
            
            <StatusCount>
              {collection.status_counts && (
                <>
                  <Status>
                    <span>🟢</span>
                    <span>{collection.status_counts.approved || 0}</span>
                  </Status>
                  <Status>
                    <span>🟠</span>
                    <span>{collection.status_counts.ready_for_review || 0}</span>
                  </Status>
                </>
              )}
              <Status>
                <span>📄</span>
                <span>{collection.document_count}</span>
              </Status>
            </StatusCount>
          </MetaInfo>
        </div>
      </StyledCard>
    </StyledLink>
  );
};

export default CollectionCard;
