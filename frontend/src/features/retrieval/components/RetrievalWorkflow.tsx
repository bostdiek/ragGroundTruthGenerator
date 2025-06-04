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
    isReady,

    // Source-related
    sources,
    isLoadingSources,
    sourcesError,
    selectedSources,
    selectSource,

    // Document-related
    documents,
    isLoadingDocuments,
    documentsError,
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

  // Handler for document selection
  const handleDocumentSelection = (document: any) => {
    selectDocument(document, !isDocumentSelected(document.id));
  };

  // Helper to check if a document is selected
  const isDocumentSelected = (documentId: string) => {
    return selectedDocuments.some((doc: any) => doc.id === documentId);
  };

  // Handler for next step navigation
  const handleNextStep = async () => {
    if (currentStep === 1) {
      setStatus('searching');
      // Trigger document search when moving to step 2
      if (question && selectedSources.length > 0) {
        await fetchRecommendedDocuments(question);
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
      setStatus('selecting_documents');
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
    return (
      <StepContainer>
        <DocumentDiscovery />
      </StepContainer>
    );
  };

  // Render summary step
  const renderSummaryStep = () => {
    return (
      <StepContainer>
        <SummaryTitle>Selected Documents</SummaryTitle>

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
          Find and select the most relevant documents for generating AI ground
          truth.
        </Subtitle>
      </div>

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
          <StepLabel active={currentStep === 2}>Find Documents</StepLabel>
        </div>

        <div style={{ position: 'relative' }}>
          <StepDot active={currentStep === 3} completed={false}>
            3
          </StepDot>
          <StepLabel active={currentStep === 3}>Review Selection</StepLabel>
        </div>
      </StepsIndicator>

      {error && (
        <Alert variant="error" title="Error">
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
            {currentStep === 2 ? 'Review Selection' : 'Next'}
          </Button>
        ) : (
          <Button variant="primary" onClick={handleCompleteWorkflow}>
            Complete Retrieval
          </Button>
        )}
      </NavigationContainer>

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
