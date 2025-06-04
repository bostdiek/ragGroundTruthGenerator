import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { Document, Source } from '../../../types';
import CollectionsService from '../../collections/api/collections.service';
import RetrievalService from '../../retrieval/api/retrieval.service';
import {
  AdvancedDocumentSelector,
  AnswerEditor,
  DocumentSelector,
  QuestionInput,
  SourceSelector,
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

  // Source selection state
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [sourcesError, setSourcesError] = useState<string | null>(null);

  // Document search and selection state
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [recommendedDocuments, setRecommendedDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

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

  // Fetch available sources when the component mounts
  useEffect(() => {
    const fetchSources = async () => {
      setIsLoadingSources(true);
      setSourcesError(null);
      try {
        const availableSources = await RetrievalService.getSources();
        setSources(availableSources);
      } catch (error) {
        console.error('Error fetching sources:', error);
        setSourcesError('Failed to load data sources. Please try again.');
      } finally {
        setIsLoadingSources(false);
      }
    };

    fetchSources();
  }, []);

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

  // Handle source selection
  const handleSourceSelection = (sourceId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSources(prev => [...prev, sourceId]);
    } else {
      setSelectedSources(prev => prev.filter(id => id !== sourceId));
    }
  };

  // Fetch recommended documents based on the question and selected sources
  const fetchRecommendedDocuments = async () => {
    if (!question.trim() || selectedSources.length === 0) {
      return;
    }

    setIsLoadingDocuments(true);
    setDocumentsError(null);

    try {
      const documents = await RetrievalService.getRecommendedDocuments(
        question,
        selectedSources
      );
      setRecommendedDocuments(documents);
    } catch (error) {
      console.error('Error fetching recommended documents:', error);
      setDocumentsError('Failed to fetch relevant documents. Please try again.');
    } finally {
      setIsLoadingDocuments(false);
    }
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
          <StepLabel active={currentStep === 2}>Select Sources</StepLabel>
        </Step>

        <Step active={currentStep === 3} completed={currentStep > 3}>
          <StepNumber active={currentStep === 3} completed={currentStep > 3}>
            {currentStep > 3 ? '' : '3'}
          </StepNumber>
          <StepLabel active={currentStep === 3}>Select Documents</StepLabel>
        </Step>

        <Step active={currentStep === 4} completed={false}>
          <StepNumber active={currentStep === 4} completed={false}>
            {currentStep > 4 ? '' : '4'}
          </StepNumber>
          <StepLabel active={currentStep === 4}>Create Answer</StepLabel>
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

      {/* Step 2: Select Sources */}
      {currentStep === 2 && (
        <div>
          <SourceSelector
            sources={sources}
            selectedSources={selectedSources}
            onSelectSource={handleSourceSelection}
            isLoading={isLoadingSources}
            error={sourcesError}
          />
          <ButtonsContainer>
            <BackButton onClick={() => goToStep(1)}>Back</BackButton>
            <PrimaryButton
              onClick={() => {
                fetchRecommendedDocuments();
                goToStep(3);
              }}
              disabled={selectedSources.length === 0}
            >
              Next: Find Documents
            </PrimaryButton>
          </ButtonsContainer>
        </div>
      )}

      {/* Step 3: Select Documents */}
      {currentStep === 3 && (
        <div>
          <h2>Select relevant documents for your answer</h2>
          {isLoadingDocuments ? (
            <div>Loading relevant documents...</div>
          ) : documentsError ? (
            <div style={{ color: 'red' }}>{documentsError}</div>
          ) : (
            <DocumentSelector
              documents={recommendedDocuments}
              selectedDocuments={selectedDocuments}
              onSelectDocument={(document: Document) => {
                const isAlreadySelected = selectedDocuments.some(doc => doc.id === document.id);
                if (isAlreadySelected) {
                  setSelectedDocuments(selectedDocuments.filter(doc => doc.id !== document.id));
                } else {
                  setSelectedDocuments([...selectedDocuments, document]);
                }
              }}
            />
          )}
          <ButtonsContainer>
            <BackButton onClick={() => goToStep(2)}>Back</BackButton>
            <PrimaryButton
              onClick={() => goToStep(4)}
              disabled={selectedDocuments.length === 0}
            >
              Next: Create Answer
            </PrimaryButton>
          </ButtonsContainer>
        </div>
      )}

      {/* Step 4: Create Answer */}
      {currentStep === 4 && (
        <AnswerEditor
          question={question}
          answer={answer}
          onAnswerChange={handleAnswerChange}
          selectedDocuments={selectedDocuments}
          onPreviousStep={() => goToStep(3)}
          onSave={saveQAPair}
        />
      )}
    </CreateQAContainer>
  );
};

export default CreateQA;
