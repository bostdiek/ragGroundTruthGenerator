import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import CollectionsService from '../services/collections.service';
import DocumentCard from '../components/DocumentCard';
import RevisionModal from '../components/RevisionModal';

// Types
interface QAPair {
  id: string;
  question: string;
  answer: string;
  documents: Document[];
  status?: string;
  collection_id?: string;
  created_by?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

interface Document {
  id: string;
  title: string;
  content: string;
  source: {
    id: string;
    name: string;
    type?: string;
  };
  url?: string;
  metadata?: Record<string, unknown>;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  qa_pairs: QAPair[];
}

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Subtitle = styled.div`
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
`;

const BackButton = styled.button`
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:before {
    content: "←";
    margin-right: 0.5rem;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 6px;
  padding: 1.5rem;
  position: relative;
  border: 1px solid #e0e0e0;
`;

const QuestionText = styled.p`
  font-size: 1.1rem;
  line-height: 1.5;
  color: #333;
  margin-bottom: 1rem;
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
`;

const DocumentsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TabButtons = styled.div`
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const TabButton = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? '#0078d4' : 'transparent'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  gap: 1rem;
`;

const StatusBadge = styled.span<{ status?: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 1rem;
  color: white;
  background-color: ${({ status }) => {
    switch (status) {
      case 'approved':
        return '#107c10';
      case 'rejected':
        return '#d83b01';
      case 'pending':
      default:
        return '#0078d4';
    }
  }};
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const RulesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 1rem 0;
`;

const RuleItem = styled.li`
  padding: 0.75rem 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1rem;
  
  &:before {
    content: "📏 ";
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background-color: #fde7e9;
  color: #d83b01;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
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

const RevisionCommentsBox = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #fff8e1;
  border-left: 4px solid #f57c00;
  border-radius: 4px;
`;

const RevisionCommentsTitle = styled.h3`
  font-size: 1.1rem;
  color: #f57c00;
  margin-top: 0;
  margin-bottom: 0.5rem;
`;

const RevisionCommentsText = styled.p`
  margin: 0;
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-line;
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
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchQAPair = async () => {
      if (!qaId) return;
      
      try {
        // Fetch QA pair from API
        const qa = await CollectionsService.getQAPair(qaId);
        console.log("Fetched QA pair:", qa);
        console.log("QA pair status:", qa.status);
        console.log("QA pair metadata:", qa.metadata);
        if (qa.metadata?.revision_comments) {
          console.log("Revision comments found:", qa.metadata.revision_comments);
        } else {
          console.log("No revision comments in metadata");
        }
        
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
  const handleRequestRevision = () => setIsRevisionModalOpen(true);
  const handleReadyForReview = () => updateStatus('ready_for_review');
  
  const submitRevisionRequest = async (comments: string) => {
    if (!qaPair || !qaId) return;
    
    console.log("Submitting revision request with comments:", comments);
    
    setIsUpdating(true);
    try {
      // Call API to update status with revision comments
      const updated = await CollectionsService.updateQAPairStatusWithComments(qaId, 'revision_requested', comments);
      console.log("QA pair updated with revision comments:", updated);
      
      // Update local state
      setQAPair({
        ...qaPair,
        status: 'revision_requested',
        metadata: {
          ...qaPair.metadata,
          revision_comments: comments
        }
      });
      
      setIsRevisionModalOpen(false);
      setIsUpdating(false);
    } catch (err) {
      console.error('Error requesting revision for Q&A pair:', err);
      setIsUpdating(false);
      alert('Failed to submit revision request. Please try again.');
    }
  };
  
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
    return <LoadingMessage>Loading Q&A pair...</LoadingMessage>;
  }
  
  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }
  
  if (!qaPair) {
    return <ErrorMessage>Q&A pair not found</ErrorMessage>;
  }
  
  return (
    <PageContainer>
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
              {qaPair.status === 'ready_for_review' 
                ? 'Ready for Review' 
                : qaPair.status === 'revision_requested'
                  ? 'Revision Requested'
                  : qaPair.status 
                    ? qaPair.status.charAt(0).toUpperCase() + qaPair.status.slice(1)
                    : 'Pending'}
            </StatusBadge>
          </MetaInfo>
        </Card>
      </Section>
      
      {qaPair.documents && qaPair.documents.length > 0 && (
        <Section>
          <SectionTitle>Referenced Documents</SectionTitle>
          <DocumentsList>
            {qaPair.documents.map((doc, index) => (
              <DocumentCard key={index} doc={doc} />
            ))}
          </DocumentsList>
        </Section>
      )}
      
      {qaPair.metadata?.custom_rules && qaPair.metadata.custom_rules.length > 0 && (
        <Section>
          <SectionTitle>Custom Rules Applied</SectionTitle>
          <RulesList>
            {qaPair.metadata.custom_rules.map((rule: string, index: number) => (
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
            {qaPair.created_by && <span>Created by: {qaPair.created_by}</span>}
            {qaPair.updated_at && <span>Last updated: {new Date(qaPair.updated_at).toLocaleDateString()}</span>}
          </MetaInfo>
        </Card>
        
        {/* Display revision comments if status is revision_requested and we have comments */}
        {/* Debug info */}
        {qaPair.status === 'revision_requested' ? (
          qaPair.metadata?.revision_comments ? (
            <RevisionCommentsBox>
              <RevisionCommentsTitle>Revision Instructions</RevisionCommentsTitle>
              <RevisionCommentsText>{qaPair.metadata.revision_comments}</RevisionCommentsText>
            </RevisionCommentsBox>
          ) : (
            <div style={{ marginTop: '1rem', color: '#666' }}>
              No revision comments provided.
            </div>
          )
        ) : null}
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
            
            <SecondaryButton onClick={() => navigate(`/edit-qa/${qaId}`)} disabled={isUpdating}>
              Edit Question & Documents
            </SecondaryButton>
            
            {qaPair.status !== 'ready_for_review' && (
              <SecondaryButton onClick={handleReadyForReview} disabled={isUpdating}>
                Mark as Ready for Review
              </SecondaryButton>
            )}
            
            {qaPair.status !== 'revision_requested' && (
              <SecondaryButton onClick={handleRequestRevision} disabled={isUpdating}>
                Request Revision
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
      
      {/* Revision Request Modal */}
      <RevisionModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        onSubmit={submitRevisionRequest}
        isSubmitting={isUpdating}
      />
    </PageContainer>
  );
};

export default ReviewQA;
