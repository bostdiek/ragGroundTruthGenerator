import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Alert, Button, Card } from '../../../components';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  transitions,
  typography,
} from '../../../components/ui/theme';
import { Document } from '../../../types';
import { useRetrievalContext } from '../context/RetrievalContext';
import DocumentDiscovery from './DocumentDiscovery';
import SourceSelector from './SourceSelector';

// Props interface matching RetrievalSelector for drop-in replacement
interface RetrievalWorkflowProps {
  question: string;
  onDocumentsSelected?: (documents: Document[]) => void;
}

// Styled components using the design system
const WorkflowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const StepContainer = styled.div`
  padding: ${spacing.lg};
  background-color: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.sm};
  transition: all ${transitions.duration.medium} ${transitions.easing.easeInOut};
`;

const StepsIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${spacing.xl};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${colors.grey[300]};
    z-index: 0;
    transform: translateY(-50%);
  }
`;

const StepDot = styled.div<{ active: boolean; completed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ active, completed }) =>
    active || completed ? colors.primary.main : colors.background.paper};
  border: 2px solid
    ${({ active, completed }) =>
      active || completed ? colors.primary.main : colors.grey[300]};
  color: ${({ active, completed }) =>
    active || completed ? colors.primary.contrastText : colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${typography.fontWeight.semiBold};
  position: relative;
  z-index: 1;
  transition: all ${transitions.duration.short} ${transitions.easing.easeInOut};
`;

const StepLabel = styled.div<{ active: boolean }>`
  font-size: ${typography.fontSize.sm};
  color: ${({ active }) =>
    active ? colors.text.primary : colors.text.secondary};
  font-weight: ${({ active }) =>
    active ? typography.fontWeight.semiBold : typography.fontWeight.medium};
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
`;

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${spacing.xl};
`;

const Title = styled.h1`
  font-size: ${typography.fontSize.xxxl};
  font-weight: ${typography.fontWeight.semiBold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.lg};
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: ${typography.fontSize.lg};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.xl};
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const Summary = styled.div`
  padding: ${spacing.lg};
  background-color: ${colors.secondary.light};
  border-radius: ${borderRadius.md};
  margin-top: ${spacing.lg};
`;

const SummaryTitle = styled.h3`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semiBold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.md};
`;

const SummaryItem = styled.div`
  margin-bottom: ${spacing.md};
  padding-bottom: ${spacing.md};
  border-bottom: 1px solid ${colors.grey[200]};

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const SummaryLabel = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.xs};
`;

const SummaryValue = styled.div`
  font-size: ${typography.fontSize.md};
  color: ${colors.text.primary};
`;

const SelectedDocumentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  margin-top: ${spacing.lg};
  padding: ${spacing.md};
  border: 2px solid ${colors.primary.main};
  border-radius: ${borderRadius.md};
  background-color: ${colors.primary.light};
`;

const DocumentsReadyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${colors.success.main};
  color: white;
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.sm};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semiBold};
  margin-left: ${spacing.sm};

  &:before {
    content: '✓';
    margin-right: ${spacing.xs};
  }
`;

const SelectedDocumentItem = styled(Card)`
  padding: ${spacing.md};
  position: relative;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: ${spacing.md};
  right: ${spacing.md};
  background: transparent;
  border: none;
  color: ${colors.error.main};
  cursor: pointer;
  font-size: ${typography.fontSize.md};
`;

const QuestionContainer = styled.div`
  background-color: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.md};
  margin-bottom: ${spacing.lg};
  box-shadow: ${shadows.sm};
`;

const QuestionTitle = styled.h3`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semiBold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`;

const QuestionEditForm = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const QuestionInput = styled.input`
  flex: 1;
  padding: ${spacing.md};
  border: 1px solid ${colors.grey[300]};
  border-radius: ${borderRadius.md};
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.md};

  &:focus {
    outline: none;
    border-color: ${colors.primary.main};
    box-shadow: 0 0 0 2px ${colors.primary.main}20;
  }
`;

const QuestionDisplay = styled.div`
  padding: ${spacing.md};
  background-color: ${colors.grey[50]};
  border: 1px solid ${colors.grey[200]};
  border-radius: ${borderRadius.md};
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.md};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
  min-height: 48px;
  display: flex;
  align-items: center;
`;

const QuestionHelpText = styled(SummaryLabel)`
  margin-top: ${spacing.sm};
  margin-bottom: 0;
`;

const WarningText = styled.span`
  color: ${colors.warning.main};
  margin-left: ${spacing.sm};
  display: block;
`;

/**
 * RetrievalWorkflow Component
 *
 * Manages the end-to-end document retrieval process:
 * 1. Source selection
 * 2. Document discovery (question-based search)
 * 3. Document selection
 * 4. Workflow completion
 */
const RetrievalWorkflow: React.FC<RetrievalWorkflowProps> = ({
  question,
  onDocumentsSelected,
}) => {
  // Use RetrievalContext instead of direct store/query access
  const {
    // Workflow state
    status,
    setStatus,
    error,

    // Source-related
    sources,
    isLoadingSources,
    sourcesError,
    selectedSources,
    selectSource,

    // Document-related
    documents,
    isLoadingDocuments,
    selectedDocuments,
    selectDocument,

    // Search state
    searchQuery,
    setSearchQuery,

    // Workflow actions
    startWorkflow,
    completeWorkflow,
    resetWorkflow,
    fetchRecommendedDocuments,
  } = useRetrievalContext();

  // Local state for step management
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [questionModified, setQuestionModified] = useState<boolean>(false);

  // Track if document tabs are visible to avoid showing error when we have tabs with documents
  const [documentTabsVisible, setDocumentTabsVisible] = useState(false);

  // Effect to initialize workflow
  useEffect(() => {
    if (status === 'idle') {
      startWorkflow();
    }
  }, [status, startWorkflow]);

  // Effect to set initial search query from question prop
  useEffect(() => {
    if (question && question !== searchQuery) {
      setSearchQuery(question);
      setQuestionModified(false);
    }
  }, [question, searchQuery, setSearchQuery]);

  // Debug effect to log sources data
  useEffect(() => {
    console.log('RetrievalWorkflow Debug:', {
      sources: sources,
      sourcesLength: sources?.length,
      isLoadingSources,
      sourcesError,
      selectedSources,
      currentStep,
      status,
    });
  }, [
    sources,
    isLoadingSources,
    sourcesError,
    selectedSources,
    currentStep,
    status,
  ]);

  // Debug effect to log state when it might cause the error banner to appear
  useEffect(() => {
    if (error && currentStep === 2) {
      console.log('Error banner debug:', {
        error,
        status,
        documentsLength: documents.length,
        isLoadingDocuments,
        step: currentStep,
      });
    }
  }, [error, status, documents, currentStep, isLoadingDocuments]);

  // Effect to update step based on status
  useEffect(() => {
    switch (status) {
      case 'selecting_sources':
        setCurrentStep(1);
        break;
      case 'searching':
        setCurrentStep(2);
        break;
      case 'selecting_documents':
        setCurrentStep(2);
        break;
      case 'completed':
        setCurrentStep(3);
        break;
      default:
        setCurrentStep(1);
    }
  }, [status]);

  // Handler for source selection
  const handleSourceSelection = (sourceId: string, isSelected: boolean) => {
    selectSource(sourceId, isSelected);
  };

  // Handler for next step navigation
  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Always trigger document search when moving from source selection to document discovery
      if (selectedSources.length > 0) {
        setStatus('searching');

        // Make sure we have a search query
        if (!searchQuery.trim() && question) {
          setSearchQuery(question);
        }

        // Use the current searchQuery from state instead of the original question prop
        if (searchQuery.trim()) {
          await fetchRecommendedDocuments(searchQuery);
          setQuestionModified(false);
        }
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Skip the review step (3) and directly complete the workflow
      if (selectedDocuments.length > 0) {
        completeWorkflow();

        // Call the callback to notify parent component of selected documents
        if (onDocumentsSelected) {
          onDocumentsSelected(selectedDocuments);
        }
      }
    }
  };

  // Handler for workflow completion
  const handleCompleteWorkflow = () => {
    completeWorkflow();

    // Call the callback to notify parent component of selected documents
    if (onDocumentsSelected) {
      onDocumentsSelected(selectedDocuments);
    }
  };

  // Handler for previous step navigation
  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setStatus('selecting_sources');
    } else if (currentStep === 3) {
      setStatus('selecting_documents');
    }
  };

  // Handler for workflow reset
  const handleReset = () => {
    resetWorkflow();
    startWorkflow();
  };

  // Handler to remove a selected document
  const handleRemoveDocument = (documentId: string) => {
    const docToRemove = selectedDocuments.find(
      (doc: any) => doc.id === documentId
    );
    if (docToRemove) {
      selectDocument(docToRemove, false);
    }
  };

  // Pass callback to DocumentDiscovery to report when tabs with documents are visible
  const handleDocumentTabsVisible = (visible: boolean) => {
    setDocumentTabsVisible(visible);
  };

  // Render source selection step
  const renderSourceSelectionStep = () => {
    return (
      <StepContainer>
        <SourceSelector
          sources={sources}
          selectedSources={selectedSources}
          onSelectSource={handleSourceSelection}
          isLoading={isLoadingSources}
          error={sourcesError ? 'Failed to load data sources' : null}
        />
      </StepContainer>
    );
  };

  // Render document discovery step
  const renderDocumentDiscoveryStep = () => {
    // Show selected sources summary
    const selectedSourcesInfo = sources
      .filter((source: any) => selectedSources.includes(source.id))
      .map((source: any) => source.name);

    return (
      <StepContainer>
        <SummaryItem style={{ marginBottom: spacing.lg }}>
          <SummaryLabel>Selected Sources:</SummaryLabel>
          <SummaryValue>
            {selectedSourcesInfo.length > 0
              ? selectedSourcesInfo.join(', ')
              : 'No sources selected'}
          </SummaryValue>
        </SummaryItem>

        <DocumentDiscovery
          autoSearch={true}
          hideSearchButton={true}
          hideQuestionInput={true}
          showSourceTabs={true}
          onDocumentTabsVisible={handleDocumentTabsVisible}
        />
      </StepContainer>
    );
  };

  // Render summary step
  const renderSummaryStep = () => {
    return (
      <StepContainer>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SummaryTitle>Selected Documents</SummaryTitle>
          {selectedDocuments.length > 0 && (
            <DocumentsReadyBadge>Ready for Generation</DocumentsReadyBadge>
          )}
        </div>

        {selectedDocuments.length === 0 ? (
          <Alert variant="warning" title="No documents selected">
            You haven't selected any documents. Go back to select documents or
            reset the workflow.
          </Alert>
        ) : (
          <SelectedDocumentsList>
            {selectedDocuments.map((doc: any) => (
              <SelectedDocumentItem key={doc.id}>
                <h4>{doc.title}</h4>
                <p>{doc.content?.substring(0, 150)}...</p>
                <RemoveButton
                  onClick={() => handleRemoveDocument(doc.id)}
                  aria-label="Remove document"
                >
                  ✕
                </RemoveButton>
              </SelectedDocumentItem>
            ))}
          </SelectedDocumentsList>
        )}

        <Summary>
          <SummaryTitle>Retrieval Summary</SummaryTitle>

          {selectedDocuments.length > 0 && (
            <p style={{ marginBottom: spacing.md, color: colors.success.dark }}>
              You've selected {selectedDocuments.length} document
              {selectedDocuments.length !== 1 ? 's' : ''} for answer generation.
              Click "Generate Answer" when you're ready to proceed.
            </p>
          )}

          <SummaryItem>
            <SummaryLabel>Selected Sources</SummaryLabel>
            <SummaryValue>
              {selectedSources.length > 0
                ? sources
                    .filter((source: any) =>
                      selectedSources.includes(source.id)
                    )
                    .map((source: any) => source.name)
                    .join(', ')
                : 'None'}
            </SummaryValue>
          </SummaryItem>

          <SummaryItem>
            <SummaryLabel>Search Query</SummaryLabel>
            <SummaryValue>{searchQuery || 'None'}</SummaryValue>
          </SummaryItem>

          <SummaryItem>
            <SummaryLabel>Selected Documents</SummaryLabel>
            <SummaryValue>{selectedDocuments.length}</SummaryValue>
          </SummaryItem>
        </Summary>
      </StepContainer>
    );
  };

  // Render current step based on workflow status
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderSourceSelectionStep();
      case 2:
        return renderDocumentDiscoveryStep();
      case 3:
        return renderSummaryStep();
      default:
        return null;
    }
  };

  // Determine if next button should be disabled
  const isNextDisabled = () => {
    if (currentStep === 1) {
      return selectedSources.length === 0;
    }
    if (currentStep === 2) {
      return selectedDocuments.length === 0;
    }
    return false;
  };

  return (
    <WorkflowContainer>
      <div>
        <Title>Document Retrieval</Title>
        <Subtitle>
          Select relevant documents to use as context for generating your
          answer. After selecting documents, click "Generate Answer" to proceed
          directly to the answer generation step.
        </Subtitle>
      </div>

      {/* Display current question */}
      <QuestionContainer>
        <QuestionTitle>Your Question</QuestionTitle>
        {currentStep === 1 ? (
          // Step 1: Show question as readonly text with clear indication it's set
          <div>
            <QuestionDisplay>{searchQuery || question}</QuestionDisplay>
            <QuestionHelpText>
              This is the question you entered. You can edit it when selecting
              documents in the next step.
            </QuestionHelpText>
          </div>
        ) : (
          // Step 2+: Show editable question form
          <>
            <QuestionEditForm>
              <QuestionInput
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setQuestionModified(true);
                }}
                placeholder="Enter your question"
              />
              <Button
                variant="primary"
                onClick={() => {
                  fetchRecommendedDocuments(searchQuery);
                  setQuestionModified(false);
                }}
                disabled={!searchQuery.trim() || selectedSources.length === 0}
              >
                Update Search
              </Button>
            </QuestionEditForm>
            <SummaryLabel style={{ marginTop: spacing.sm }}>
              You can edit your question at any time and click "Update Search"
              to find new relevant documents.
              {questionModified && (
                <WarningText>
                  Question has been modified. Click "Update Search" to refresh
                  results.
                </WarningText>
              )}
            </SummaryLabel>
          </>
        )}
      </QuestionContainer>

      <StepsIndicator>
        <div style={{ position: 'relative' }}>
          <StepDot active={currentStep === 1} completed={currentStep > 1}>
            1
          </StepDot>
          <StepLabel active={currentStep === 1}>Select Sources</StepLabel>
        </div>

        <div style={{ position: 'relative' }}>
          <StepDot active={currentStep === 2} completed={currentStep > 2}>
            2
          </StepDot>
          <StepLabel active={currentStep === 2}>Select Documents</StepLabel>
        </div>

        <div style={{ position: 'relative' }}>
          <StepDot active={currentStep === 3} completed={false}>
            3
          </StepDot>
          <StepLabel active={currentStep === 3}>Create Answer</StepLabel>
        </div>
      </StepsIndicator>

      {/* 
        Never show the error banner if:
        1. We're not in document selection step
        2. We have documents
        3. We're still loading/searching
        4. Our document results are showing in tabs (as seen in the screenshot)
      */}
      {error &&
        status === 'selecting_documents' &&
        documents.length === 0 &&
        !isLoadingDocuments &&
        !documentTabsVisible &&
        currentStep === 2 && (
          <Alert variant="error" title="No Documents Found">
            {error}
          </Alert>
        )}

      {renderCurrentStep()}

      <NavigationContainer>
        {currentStep > 1 ? (
          <Button variant="outline" onClick={handlePreviousStep}>
            Previous
          </Button>
        ) : (
          <div /> // Empty div to maintain flexbox spacing
        )}

        {currentStep < 3 ? (
          <Button
            variant="primary"
            onClick={handleNextStep}
            disabled={isNextDisabled()}
          >
            {currentStep === 2 ? 'Generate Answer' : 'Next'}
            {currentStep === 2 && selectedDocuments.length > 0 ? ' →' : ''}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleCompleteWorkflow}
            disabled={selectedDocuments.length === 0}
          >
            Generate Answer
          </Button>
        )}
      </NavigationContainer>

      {currentStep === 3 && selectedDocuments.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <Alert
            variant="success"
            title={`${selectedDocuments.length} document${selectedDocuments.length !== 1 ? 's' : ''} selected`}
          >
            Your selected documents are ready to use for answer generation.
            Click "Generate Answer" to proceed.
          </Alert>
        </div>
      )}

      {currentStep === 3 && (
        <Button
          variant="text"
          onClick={handleReset}
          style={{ alignSelf: 'center' }}
        >
          Reset and Start Over
        </Button>
      )}
    </WorkflowContainer>
  );
};

export default RetrievalWorkflow;
