import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { Document } from '../../../types';
import CollectionsService from '../../collections/api/collections.service';
import { RetrievalProvider, RetrievalWorkflow } from '../../retrieval';
import { AnswerEditor, QuestionInput } from '../components';

// Types
interface CreateQAProps {
  isEditMode?: boolean;
}

// Styled Components
const CreateQAContainer = styled.div`
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

const StepIndicator = styled.div`
  display: flex;
  margin-bottom: 2rem;
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  align-items: center;
  margin-right: 2rem;

  opacity: ${props => (props.active || props.completed ? '1' : '0.5')};

  &:last-child {
    margin-right: 0;
  }
`;

const StepNumber = styled.div<{ active: boolean; completed: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${props => {
    if (props.completed) return '#0078d4';
    if (props.active) return 'white';
    return '#f3f3f3';
  }};
  border: 2px solid
    ${props => (props.completed || props.active ? '#0078d4' : '#ddd')};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  font-weight: 500;
  color: ${props => {
    if (props.completed) return 'white';
    if (props.active) return '#0078d4';
    return '#666';
  }};

  &:after {
    content: ${props => (props.completed ? '"✓"' : 'none')};
  }
`;

const StepLabel = styled.div<{ active: boolean }>`
  font-weight: ${props => (props.active ? '500' : 'normal')};
`;

const StatusLine = styled.div<{ status: string }>`
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  background-color: ${props => {
    switch (props.status) {
      case 'ready_for_review':
        return '#e3f2fd';
      case 'approved':
        return '#e6f7e6';
      case 'rejected':
        return '#ffebee';
      case 'revision_requested':
        return '#fff8e1';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'ready_for_review':
        return '#1976d2';
      case 'approved':
        return '#2e7d32';
      case 'rejected':
        return '#c62828';
      case 'revision_requested':
        return '#f57c00';
      default:
        return '#333';
    }
  }};
  border-radius: 4px;
  font-weight: 500;
`;

const AlertMessage = styled.div<{ type: 'error' | 'success' }>`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  background-color: ${props =>
    props.type === 'error' ? '#ffebee' : '#e6f7e6'};
  color: ${props => (props.type === 'error' ? '#c62828' : '#2e7d32')};
  border: 1px solid ${props => (props.type === 'error' ? '#ef9a9a' : '#a5d6a7')};
`;

// More styled components
const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
`;

/* Used in other files or as reference for styling - keeping for consistency */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PrimaryButton = styled(Button)`
  background-color: #1976d2;
  color: white;
  border: none;

  &:hover {
    background-color: #1565c0;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const BackButton = styled(Button)`
  background-color: white;
  color: #333;
  border: 1px solid #ddd;

  &:hover {
    background-color: #f5f5f5;
  }
`;

/**
 * CreateQA page component.
 * Allows creating or editing a QA pair.
 */
const CreateQA: React.FC<CreateQAProps> = ({ isEditMode = false }) => {
  const { collectionId, qaId } = useParams<{
    collectionId: string;
    qaId: string;
  }>();
  const navigate = useNavigate();

  // State for the current step in the workflow
  const [currentStep, setCurrentStep] = useState(1);

  // Question state
  const [question, setQuestion] = useState('');

  // Document selection state
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);

  // Answer generation state
  const [answer, setAnswer] = useState('');

  // Edit mode state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [originalQA, setOriginalQA] = useState<any | null>(null);
  const [status, setStatus] = useState<string>('ready_for_review');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when in edit mode
  useEffect(() => {
    // If in edit mode, fetch the existing QA pair
    if (isEditMode && qaId) {
      const fetchQAPair = async () => {
        try {
          const qa = await CollectionsService.getQAPair(qaId);
          setOriginalQA(qa);
          setQuestion(qa.question);
          setAnswer(qa.answer);
          setSelectedDocuments(qa.documents || []);
          setStatus(qa.status);

          // If the QA pair has documents, we can skip to the answer step
          if (qa.documents && qa.documents.length > 0) {
            setCurrentStep(4);
          }
        } catch (error) {
          console.error('Error fetching QA pair:', error);
          // Handle error appropriately
        }
      };

      fetchQAPair();
    }
  }, [isEditMode, qaId]);

  // Save the QA pair
  const saveQAPair = async () => {
    if (!question.trim() || !answer.trim() || selectedDocuments.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const qaPairData = {
        question,
        answer,
        documents: selectedDocuments,
        status: 'ready_for_review' as
          | 'ready_for_review'
          | 'approved'
          | 'rejected'
          | 'revision_requested',
      };

      let savedQA;

      if (isEditMode && qaId) {
        // Update existing QA pair
        savedQA = await CollectionsService.updateQAPair(qaId, qaPairData);
        // Navigate to the review page for edited QA pairs
        navigate(`/review-qa/${savedQA.id}`);
      } else if (collectionId) {
        // Create new QA pair
        savedQA = await CollectionsService.createQAPair(
          collectionId,
          qaPairData
        );
        // Skip review page for new QA pairs, go directly back to collection
        navigate(`/collections/${collectionId}`);
      } else {
        throw new Error('Missing collection ID');
      }
    } catch (error) {
      console.error('Error saving QA pair:', error);
      setError(
        `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation between steps
  const goToStep = (step: number, documentsToValidate?: Document[]) => {
    // Validate before allowing step navigation
    if (step === 2 && !question.trim()) {
      return; // Don't proceed if question is empty
    }

    // For step 3 validation, use provided documents or current selectedDocuments
    const docsToCheck = documentsToValidate || selectedDocuments;
    if (step === 3 && docsToCheck.length === 0) {
      return; // Don't proceed if no documents selected
    }

    setCurrentStep(step);
  };

  // Handle question change
  const handleQuestionChange = (newQuestion: string) => {
    setQuestion(newQuestion);
  };

  // Handle document selection from retrieval feature
  const handleDocumentsSelected = (documents: Document[]) => {
    setSelectedDocuments(documents);
    // Pass the documents to validate against to avoid timing issues
    goToStep(3, documents);
  };

  // Handle answer change
  const handleAnswerChange = (newAnswer: string) => {
    setAnswer(newAnswer);
  };

  return (
    <CreateQAContainer>
      <Header>
        <Title>{isEditMode ? 'Review Q&A Pair' : 'Create Q&A Pair'}</Title>
        <Subtitle>
          {isEditMode
            ? 'Review and update this question-answer pair'
            : 'Create a new question-answer pair for your collection'}
        </Subtitle>
      </Header>

      <StepIndicator>
        <Step active={currentStep === 1} completed={currentStep > 1}>
          <StepNumber active={currentStep === 1} completed={currentStep > 1}>
            {currentStep > 1 ? '' : '1'}
          </StepNumber>
          <StepLabel active={currentStep === 1}>Define Question</StepLabel>
        </Step>

        <Step active={currentStep === 2} completed={currentStep > 2}>
          <StepNumber active={currentStep === 2} completed={currentStep > 2}>
            {currentStep > 2 ? '' : '2'}
          </StepNumber>
          <StepLabel active={currentStep === 2}>Select Documents</StepLabel>
        </Step>

        <Step active={currentStep === 3} completed={currentStep > 3}>
          <StepNumber active={currentStep === 3} completed={currentStep > 3}>
            {currentStep > 3 ? '' : '3'}
          </StepNumber>
          <StepLabel active={currentStep === 3}>Create Answer</StepLabel>
        </Step>
      </StepIndicator>

      {isEditMode && status !== 'ready_for_review' && (
        <StatusLine status={status}>
          This Q&A pair is currently marked as: {status.replace('_', ' ')}
        </StatusLine>
      )}

      {error && <AlertMessage type="error">{error}</AlertMessage>}
      {/* Step 1: Define Question */}
      {currentStep === 1 && (
        <QuestionInput
          question={question}
          onQuestionChange={handleQuestionChange}
          onNextStep={() => goToStep(2)}
        />
      )}

      {/* Step 2: Select Documents using Retrieval Feature */}
      {currentStep === 2 && (
        <RetrievalProvider>
          <div>
            <RetrievalWorkflow
              question={question}
              onDocumentsSelected={handleDocumentsSelected}
            />
            <ButtonsContainer>
              <BackButton onClick={() => goToStep(1)}>Back</BackButton>
            </ButtonsContainer>
          </div>
        </RetrievalProvider>
      )}

      {/* Step 3: Create Answer */}
      {currentStep === 3 && (
        <AnswerEditor
          question={question}
          answer={answer}
          onAnswerChange={handleAnswerChange}
          selectedDocuments={selectedDocuments}
          onPreviousStep={() => goToStep(2)}
          onSave={saveQAPair}
          isSaving={isLoading}
        />
      )}
    </CreateQAContainer>
  );
};

export default CreateQA;
