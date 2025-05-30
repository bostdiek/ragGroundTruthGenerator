import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import axios from 'axios';

// API endpoint (would be configured from environment in real app)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Types
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

interface Document {
  id: string;
  title: string;
  content: string;
  source: string;
  url?: string;
}

// Styled Components
const ReviewContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.3rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const QuestionText = styled.p`
  font-size: 1.1rem;
  color: #333;
  line-height: 1.6;
`;

const DocumentsList = styled.div`
  margin-top: 1rem;
`;

const DocumentItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.5rem;
`;

const DocumentTitle = styled.h3`
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const DocumentContent = styled.p`
  color: #666;
  font-size: 0.9rem;
  white-space: pre-line;
`;

const DocumentSource = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #888;
`;

const RulesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 1rem 0;
`;

const RuleItem = styled.li`
  padding: 0.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  color: #666;
`;

const TabContainer = styled.div`
  margin-bottom: 1rem;
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.active ? '#fff' : '#f5f5f5'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#0078d4' : 'transparent'};
  color: ${props => props.active ? '#0078d4' : '#666'};
  font-weight: ${props => props.active ? '500' : 'normal'};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#fff' : '#eee'};
  }
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #888;
  margin-top: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  gap: 1rem;
`;

const Button = styled.button`
  background-color: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #106ebe;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ApproveButton = styled(Button)`
  background-color: #107c10;
  
  &:hover {
    background-color: #0b5a0b;
  }
`;

const RejectButton = styled(Button)`
  background-color: #d83b01;
  
  &:hover {
    background-color: #a02b01;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #f3f3f3;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #e6e6e6;
  }
`;

/**
 * Review QA page component.
 * Allows reviewing and approving/rejecting a Q&A pair.
 */
const ReviewQA: React.FC = () => {
  const { qaId } = useParams<{ qaId: string }>();
  const navigate = useNavigate();
  
  const [qaPair, setQAPair] = useState<QAPair | null>(null);
  const [editedAnswer, setEditedAnswer] = useState('');
  const [activeTab, setActiveTab] = useState<'markdown' | 'preview'>('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchQAPair = async () => {
      try {
        // In a real app, this would fetch from the API
        // For demo purposes, we'll use mock data
        setTimeout(() => {
          const mockQAPair: QAPair = {
            id: qaId || '1',
            question: 'How do I replace the air filter in a Model X?',
            answer: '# Air Filter Replacement in Model X\n\nTo replace the air filter in a Model X, follow these steps:\n\n1. Open the hood of the vehicle\n2. Locate the air filter housing on the passenger side\n3. Remove the cover (may require releasing clips)\n4. Take out the old filter\n5. Insert the new filter with the same orientation\n6. Replace the cover securely\n7. Close the hood\n\n**Maintenance Schedule:** Air filters should be replaced every 12 months or 12,000 miles, whichever comes first.\n\n**Warning Signs:** If you notice unusual smells from the ventilation system or reduced fuel efficiency, your air filter may need replacement before the scheduled maintenance.',
            custom_rules: ['Use numbered lists for step-by-step instructions', 'Include maintenance schedule information'],
            documents: [
              {
                id: 'doc1',
                title: 'Model X Maintenance Manual',
                content: 'Chapter 5: Air Filter Replacement. To replace the air filter in a Model X, follow these steps:\n\n1. Open the hood\n2. Locate the air filter housing\n3. Remove the cover\n4. Replace the filter\n5. Replace the cover\n6. Close the hood',
                source: 'manuals',
                url: 'https://example.com/docs/model-x-manual.pdf'
              },
              {
                id: 'doc3',
                title: 'Wiki: Common Maintenance Procedures',
                content: 'Air filters should be replaced every 12 months or 12,000 miles, whichever comes first. Signs of a clogged air filter include reduced fuel efficiency and unusual smells from the ventilation system.',
                source: 'wiki',
                url: 'https://wiki.example.com/maintenance/common-procedures'
              }
            ],
            collection_id: '1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: 'demo_user_id',
            review_status: 'pending'
          };
          
          setQAPair(mockQAPair);
          setEditedAnswer(mockQAPair.answer);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching Q&A pair:', err);
        setError('Failed to load Q&A pair. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchQAPair();
  }, [qaId]);
  
  const handleApprove = async () => {
    if (!qaPair) return;
    
    setIsUpdating(true);
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll simulate an update
      setTimeout(() => {
        console.log('Approving Q&A pair:', qaPair.id);
        
        // Navigate back to the collection
        navigate(`/collections/${qaPair.collection_id}`);
        setIsUpdating(false);
      }, 1000);
    } catch (err) {
      console.error('Error approving Q&A pair:', err);
      setIsUpdating(false);
    }
  };
  
  const handleReject = async () => {
    if (!qaPair) return;
    
    setIsUpdating(true);
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll simulate an update
      setTimeout(() => {
        console.log('Rejecting Q&A pair:', qaPair.id);
        
        // Navigate back to the collection
        navigate(`/collections/${qaPair.collection_id}`);
        setIsUpdating(false);
      }, 1000);
    } catch (err) {
      console.error('Error rejecting Q&A pair:', err);
      setIsUpdating(false);
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    setActiveTab('markdown');
  };
  
  const handleSaveEdit = async () => {
    if (!qaPair) return;
    
    setIsUpdating(true);
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll simulate an update
      setTimeout(() => {
        console.log('Saving edited Q&A pair:', {
          ...qaPair,
          answer: editedAnswer
        });
        
        // Update the local state
        setQAPair({
          ...qaPair,
          answer: editedAnswer
        });
        
        setIsEditing(false);
        setActiveTab('preview');
        setIsUpdating(false);
      }, 1000);
    } catch (err) {
      console.error('Error saving edited Q&A pair:', err);
      setIsUpdating(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditedAnswer(qaPair?.answer || '');
    setIsEditing(false);
    setActiveTab('preview');
  };
  
  if (loading) {
    return <ReviewContainer>Loading Q&A pair...</ReviewContainer>;
  }
  
  if (error) {
    return <ReviewContainer>{error}</ReviewContainer>;
  }
  
  if (!qaPair) {
    return <ReviewContainer>Q&A pair not found</ReviewContainer>;
  }
  
  return (
    <ReviewContainer>
      <Header>
        <Title>Review Question & Answer</Title>
        <Subtitle>Collection: Maintenance Manuals</Subtitle>
      </Header>
      
      <Section>
        <SectionTitle>Question</SectionTitle>
        <Card>
          <QuestionText>{qaPair.question}</QuestionText>
        </Card>
      </Section>
      
      <Section>
        <SectionTitle>Referenced Documents</SectionTitle>
        <DocumentsList>
          {qaPair.documents.map((doc: Document, index) => (
            <DocumentItem key={index}>
              <DocumentTitle>{doc.title}</DocumentTitle>
              <DocumentContent>{doc.content}</DocumentContent>
              <DocumentSource>Source: {doc.source}</DocumentSource>
            </DocumentItem>
          ))}
        </DocumentsList>
      </Section>
      
      {qaPair.custom_rules.length > 0 && (
        <Section>
          <SectionTitle>Custom Rules Applied</SectionTitle>
          <RulesList>
            {qaPair.custom_rules.map((rule, index) => (
              <RuleItem key={index}>{rule}</RuleItem>
            ))}
          </RulesList>
        </Section>
      )}
      
      <Section>
        <SectionTitle>Answer</SectionTitle>
        <Card>
          <TabContainer>
            <TabButtons>
              <TabButton
                active={activeTab === 'markdown'}
                onClick={() => isEditing ? setActiveTab('markdown') : null}
                disabled={!isEditing}
              >
                Markdown
              </TabButton>
              <TabButton
                active={activeTab === 'preview'}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </TabButton>
            </TabButtons>
            
            {isEditing && activeTab === 'markdown' ? (
              <MDEditor
                value={editedAnswer}
                onChange={(value) => setEditedAnswer(value || '')}
                height={400}
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
                }}
              />
            ) : (
              <MDEditor.Markdown source={isEditing ? editedAnswer : qaPair.answer} />
            )}
          </TabContainer>
          
          <MetaInfo>
            <span>Created by: User ID {qaPair.created_by}</span>
            <span>Created: {new Date(qaPair.created_at).toLocaleDateString()}</span>
          </MetaInfo>
        </Card>
      </Section>
      
      <ButtonContainer>
        {isEditing ? (
          <>
            <SecondaryButton onClick={handleCancelEdit} disabled={isUpdating}>
              Cancel
            </SecondaryButton>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <>
            <SecondaryButton onClick={handleEdit} disabled={isUpdating}>
              Edit Answer
            </SecondaryButton>
            <RejectButton onClick={handleReject} disabled={isUpdating}>
              {isUpdating ? 'Rejecting...' : 'Reject'}
            </RejectButton>
            <ApproveButton onClick={handleApprove} disabled={isUpdating}>
              {isUpdating ? 'Approving...' : 'Approve'}
            </ApproveButton>
          </>
        )}
      </ButtonContainer>
    </ReviewContainer>
  );
};

export default ReviewQA;
