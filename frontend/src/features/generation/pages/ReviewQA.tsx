import MDEditor from '@uiw/react-md-editor';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import rehypeSanitize from 'rehype-sanitize';
import styled from 'styled-components';

import DocumentCard from '../../../components/ui/DocumentCard';
import RevisionModal from '../../../components/ui/RevisionModal';
import CollectionsService from '../../collections/api/collections.service';

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
  relevance_score?: number;
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
  background: none;
  border: none;
  color: #0078d4;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  padding: 0;
  margin-bottom: 1rem;

  &:hover {
    text-decoration: underline;
  }

  &:before {
    content: '←';
    margin-right: 0.5rem;
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

const QuestionBox = styled.div`
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const Question = styled.p`
  font-size: 1.2rem;
  margin: 0;
  color: #333;
  line-height: 1.6;
`;

const AnswerBox = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 1.5rem;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: 1rem;

  background-color: ${props => {
    switch (props.status) {
      case 'approved':
        return '#e6f7e6';
      case 'rejected':
        return '#ffebee';
      case 'revision_requested':
        return '#fff8e1';
      case 'ready_for_review':
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
      case 'revision_requested':
        return '#f57c00';
      case 'ready_for_review':
      default:
        return '#1976d2';
    }
  }};
`;

const DocumentsSection = styled.div`
  margin-top: 2rem;
`;

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const MetadataBox = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
`;

const MetadataItem = styled.div`
  margin-bottom: 0.5rem;
  display: flex;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MetadataLabel = styled.span`
  font-weight: 500;
  margin-right: 0.5rem;
  min-width: 120px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
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

const SecondaryButton = styled(Button)`
  background-color: white;
  color: #333;
  border: 1px solid #ddd;

  &:hover {
    background-color: #f3f3f3;
  }
`;

const DangerButton = styled(Button)`
  background-color: #d13438;

  &:hover {
    background-color: #c62828;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #d13438;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

/**
 * Helper function to format status labels for display
 */
const formatStatusLabel = (status: string): string => {
  switch (status) {
    case 'ready_for_review':
      return 'Ready for Review';
    case 'revision_requested':
      return 'Revision Requested';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * ReviewQA page component.
 * Displays a QA pair for review and allows approval or rejection.
 */
const ReviewQA: React.FC = () => {
  const { qaId } = useParams<{ qaId: string }>();
  const navigate = useNavigate();

  const [qaPair, setQaPair] = useState<QAPair | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchQAPair = async () => {
      try {
        if (!qaId) return;

        const qaPairData = await CollectionsService.getQAPair(qaId);
        setQaPair(qaPairData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching QA pair:', err);
        setError('Failed to load QA pair. Please try again later.');
        setLoading(false);
      }
    };

    fetchQAPair();
  }, [qaId]);

  const handleStatusUpdate = async (
    newStatus: 'approved' | 'rejected' | 'revision_requested'
  ) => {
    if (!qaPair) return;

    setIsUpdatingStatus(true);

    try {
      const metadata = qaPair.metadata || {};

      if (newStatus === 'revision_requested' && revisionFeedback) {
        metadata.revision_feedback = revisionFeedback;
      }

      await CollectionsService.updateQAPair(qaPair.id, {
        status: newStatus,
        metadata,
      });

      // Refresh the QA pair data
      const updatedQAPair = await CollectionsService.getQAPair(qaPair.id);
      setQaPair(updatedQAPair);

      // Close the revision modal if it's open
      setShowRevisionModal(false);
      setRevisionFeedback('');
    } catch (err) {
      console.error('Error updating QA pair status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleGoBack = () => {
    if (qaPair?.collection_id) {
      navigate(`/collections/${qaPair.collection_id}`);
    } else {
      navigate('/collections');
    }
  };

  const handleRevisionRequest = () => {
    setShowRevisionModal(true);
  };

  const handleRevisionSubmit = (feedback: string) => {
    setRevisionFeedback(feedback);
    handleStatusUpdate('revision_requested');
  };

  const handleRevisionCancel = () => {
    setShowRevisionModal(false);
    setRevisionFeedback('');
  };

  if (loading) {
    return <LoadingSpinner>Loading Q&A pair...</LoadingSpinner>;
  }

  if (error || !qaPair) {
    return <ReviewContainer>{error || 'Q&A pair not found'}</ReviewContainer>;
  }

  return (
    <ReviewContainer>
      <BackButton onClick={handleGoBack}>Back to Collection</BackButton>

      <Header>
        <HeaderContent>
          <Title>
            Review Q&A Pair
            <StatusBadge status={qaPair.status || 'ready_for_review'}>
              {formatStatusLabel(qaPair.status || 'ready_for_review')}
            </StatusBadge>
          </Title>
          <Subtitle>
            Review this question-answer pair for accuracy and quality
          </Subtitle>
        </HeaderContent>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Section>
        <SectionTitle>Question</SectionTitle>
        <QuestionBox>
          <Question>{qaPair.question}</Question>
        </QuestionBox>

        <SectionTitle>Answer</SectionTitle>
        <AnswerBox>
          <MDEditor.Markdown
            source={qaPair.answer}
            rehypePlugins={[[rehypeSanitize]]}
          />
        </AnswerBox>

        <DocumentsSection>
          <SectionTitle>
            Referenced Documents ({qaPair.documents.length})
          </SectionTitle>

          <DocumentsGrid>
            {qaPair.documents.map(document => (
              <DocumentCard key={document.id} doc={document} />
            ))}
          </DocumentsGrid>
        </DocumentsSection>

        <MetadataBox>
          <MetadataItem>
            <MetadataLabel>Created by:</MetadataLabel>
            <span>{qaPair.created_by || 'Unknown'}</span>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Last updated:</MetadataLabel>
            <span>
              {qaPair.updated_at
                ? new Date(qaPair.updated_at).toLocaleString()
                : 'Unknown'}
            </span>
          </MetadataItem>
          {qaPair.metadata?.revision_feedback && (
            <MetadataItem>
              <MetadataLabel>Revision feedback:</MetadataLabel>
              <span>{qaPair.metadata.revision_feedback}</span>
            </MetadataItem>
          )}
        </MetadataBox>

        {qaPair.status !== 'approved' && (
          <ButtonGroup>
            <Button
              onClick={() => handleStatusUpdate('approved')}
              disabled={isUpdatingStatus}
            >
              Approve
            </Button>

            <SecondaryButton
              onClick={handleRevisionRequest}
              disabled={isUpdatingStatus}
            >
              Request Revision
            </SecondaryButton>

            <DangerButton
              onClick={() => handleStatusUpdate('rejected')}
              disabled={isUpdatingStatus}
            >
              Reject
            </DangerButton>
          </ButtonGroup>
        )}
      </Section>

      <RevisionModal
        isOpen={showRevisionModal}
        onClose={handleRevisionCancel}
        onSubmit={handleRevisionSubmit}
        isSubmitting={isUpdatingStatus}
      />
    </ReviewContainer>
  );
};

export default ReviewQA;
