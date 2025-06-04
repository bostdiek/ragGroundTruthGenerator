import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { Document, Source } from '../../../types';
import CollectionsService from '../../collections/api/collections.service';
import RetrievalService from '../../retrieval/api/retrieval.service';
import {
  AdvancedDocumentSelector,
  AnswerEditor,
  QuestionInput,
} from '../components';

// Types
interface GenerationResponse {
  answer: string;
  model_used?: string;
  token_usage?: Record<string, number>;
}

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

  // Document search and selection state
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);

  // Answer generation state
  const [answer, setAnswer] = useState('');

  // Edit mode state
  const [originalQA, setOriginalQA] = useState<any | null>(null);
  const [status, setStatus] = useState<string>('ready_for_review');

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

          // If the QA pair has documents, we can consider step 2 complete
          if (qa.documents && qa.documents.length > 0) {
            setCurrentStep(3);
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
      return; // Don't proceed if required fields are missing
    }

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
      } else if (collectionId) {
        // Create new QA pair
        savedQA = await CollectionsService.createQAPair(
          collectionId,
          qaPairData
        );
      } else {
        throw new Error('Missing collection ID');
      }

      // Navigate to the review page for the saved QA pair
      navigate(`/review-qa/${savedQA.id}`);
    } catch (error) {
      console.error('Error saving QA pair:', error);
    }
  };

  // Navigation between steps
  const goToStep = (step: number) => {
    // Validate before allowing step navigation
    if (step === 2 && !question.trim()) {
      return; // Don't proceed if question is empty
    }

    if (step === 3 && selectedDocuments.length === 0) {
      return; // Don't proceed if no documents selected
    }

    setCurrentStep(step);
  };

  // Handle question change
  const handleQuestionChange = (newQuestion: string) => {
    setQuestion(newQuestion);
  };

  // Handle document selection change
  const handleDocumentSelectionChange = (documents: Document[]) => {
    setSelectedDocuments(documents);
  };

  // Handle answer change
  const handleAnswerChange = (newAnswer: string) => {
    setAnswer(newAnswer);
  };

  return (
    <CreateQAContainer>
      <Header>
        <Title>{isEditMode ? 'Edit Q&A Pair' : 'Create Q&A Pair'}</Title>
        <Subtitle>
          {isEditMode
            ? 'Update this question-answer pair with new information'
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

        <Step active={currentStep === 3} completed={false}>
          <StepNumber active={currentStep === 3} completed={false}>
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

      {/* Step 1: Define Question */}
      {currentStep === 1 && (
        <QuestionInput
          question={question}
          onQuestionChange={handleQuestionChange}
          onNextStep={() => goToStep(2)}
        />
      )}

      {/* Step 2: Select Documents */}
      {currentStep === 2 && (
        <AdvancedDocumentSelector
          selectedDocuments={selectedDocuments}
          onDocumentSelectionChange={handleDocumentSelectionChange}
          onNextStep={() => goToStep(3)}
          onPreviousStep={() => goToStep(1)}
        />
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
        />
      )}
    </CreateQAContainer>
  );
};

export default CreateQA;
