import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import CollectionsService from '../services/collections.service';

// Types
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  color: #333;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
`;

const BackButton = styled.button`
  background-color: #f3f3f3;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #e6e6e6;
  }
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

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
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

const LoadingOrError = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

/**
 * Review QA page component.
 * Allows reviewing and approving/rejecting a Q&A pair.
 */
const ReviewQA: React.FC = () => {
  const { qaId } = useParams<{ qaId: string }>();
  const navigate = useNavigate();
  
  const [qaPair, setQAPair] = useState<QAPair | null>(null);
  const [collectionName, setCollectionName] = useState<string>('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [activeTab, setActiveTab] = useState<'markdown' | 'preview'>('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchQAPair = async () => {
      if (!qaId) return;
      
      try {
        // Fetch QA pair from API
        const qa = await CollectionsService.getQAPair(qaId);
        setQAPair(qa);
        setEditedAnswer(qa.answer);
        
        // Fetch collection name
        if (qa.collection_id) {
          const collection = await CollectionsService.getCollection(qa.collection_id);
          setCollectionName(collection.name);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Q&A pair:', err);
        setError('Failed to load Q&A pair. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchQAPair();
  }, [qaId]);
  
  const updateStatus = async (newStatus: string) => {
    if (!qaPair || !qaId) return;
    
    setIsUpdating(true);
    try {
      // Call API to update status
      await CollectionsService.updateQAPairStatus(qaId, newStatus);
      
      // Update local state
      setQAPair({
        ...qaPair,
        status: newStatus
      });
      
      setIsUpdating(false);
    } catch (err) {
      console.error(`Error ${newStatus} Q&A pair:`, err);
      setIsUpdating(false);
    }
  };
  
  const handleApprove = () => updateStatus('approved');
  const handleReject = () => updateStatus('rejected');
  const handleMarkAsPending = () => updateStatus('pending');
  const handleMoveToDraft = () => updateStatus('draft');
  
  const handleEdit = () => {
    setIsEditing(true);
    setActiveTab('markdown');
  };
  
  const handleSaveEdit = async () => {
    if (!qaPair || !qaId) return;
    
    setIsUpdating(true);
    try {
      // In a real app, this would call the API
      // For this demo, we'll simulate an update
      setTimeout(() => {
        // Update the local state
        setQAPair({
          ...qaPair,
          answer: editedAnswer,
          updated_at: new Date().toISOString()
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
  
  const handleBackToCollection = () => {
    if (qaPair?.collection_id) {
      navigate(`/collections/${qaPair.collection_id}`);
    }
  };
  
  if (loading) {
    return <LoadingOrError>Loading Q&A pair...</LoadingOrError>;
  }
  
  if (error) {
    return <LoadingOrError>{error}</LoadingOrError>;
  }
  
  if (!qaPair) {
    return <LoadingOrError>Q&A pair not found</LoadingOrError>;
  }
  
  return (
    <ReviewContainer>
      <Header>
        <HeaderContent>
          <Title>Review Question & Answer</Title>
          <Subtitle>Collection: {collectionName || 'Unknown'}</Subtitle>
        </HeaderContent>
        
        <BackButton onClick={handleBackToCollection}>
          Back to Collection
        </BackButton>
      </Header>
      
      <Section>
        <SectionTitle>Question</SectionTitle>
        <Card>
          <QuestionText>{qaPair.question}</QuestionText>
          <MetaInfo>
            <StatusBadge status={qaPair.status}>
              {qaPair.status.charAt(0).toUpperCase() + qaPair.status.slice(1)}
            </StatusBadge>
          </MetaInfo>
        </Card>
      </Section>
      
      {qaPair.documents && qaPair.documents.length > 0 && (
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
      )}
      
      {qaPair.custom_rules && qaPair.custom_rules.length > 0 && (
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
            <span>Created by: {qaPair.created_by}</span>
            <span>Last updated: {new Date(qaPair.updated_at).toLocaleDateString()}</span>
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
            
            {qaPair.status !== 'draft' && (
              <SecondaryButton onClick={handleMoveToDraft} disabled={isUpdating}>
                Move to Draft
              </SecondaryButton>
            )}
            
            {qaPair.status !== 'pending' && (
              <SecondaryButton onClick={handleMarkAsPending} disabled={isUpdating}>
                Mark as Pending
              </SecondaryButton>
            )}
            
            {qaPair.status !== 'rejected' && (
              <RejectButton onClick={handleReject} disabled={isUpdating}>
                {isUpdating ? 'Rejecting...' : 'Reject'}
              </RejectButton>
            )}
            
            {qaPair.status !== 'approved' && (
              <ApproveButton onClick={handleApprove} disabled={isUpdating}>
                {isUpdating ? 'Approving...' : 'Approve'}
              </ApproveButton>
            )}
          </>
        )}
      </ButtonContainer>
    </ReviewContainer>
  );
};

export default ReviewQA;
