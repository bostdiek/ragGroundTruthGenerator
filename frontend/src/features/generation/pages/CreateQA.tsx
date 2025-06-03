import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import CollectionsService from '../../collections/api/collections.service';
import RetrievalService from '../../retrieval/api/retrieval.service';
import GenerationService from '../api/generation.service';
import { Document, Source } from '../../../types';

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

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.3rem;
`;

const QuestionInput = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  min-height: 100px;
  margin-bottom: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #0078d4;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
  }
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
  margin-right: 1rem;
  
  &:hover {
    background-color: #106ebe;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
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

const SearchContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #0078d4;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
  }
`;

const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const DocumentCard = styled.div<{ selected: boolean }>`
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#0078d4' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.selected ? '#0078d4' : '#aaa'};
    background-color: ${props => props.selected ? 'rgba(0, 120, 212, 0.05)' : '#f9f9f9'};
  }
  
  background-color: ${props => props.selected ? 'rgba(0, 120, 212, 0.05)' : 'white'};
`;

const DocumentTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
`;

const DocumentContent = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const DocumentSource = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #888;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const SourceTabs = styled.div`
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ddd;
`;

const SourceTab = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-bottom: 2px solid ${props => props.active ? '#0078d4' : 'transparent'};
  color: ${props => props.active ? '#0078d4' : '#333'};
  font-weight: ${props => props.active ? '500' : 'normal'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #0078d4;
  }
`;

const ErrorMessage = styled.div`
  color: #d13438;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #fde7e9;
  border-radius: 4px;
`;

const DocumentList = styled.div`
  margin-top: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
`;

const DocumentListItem = styled.div<{ selected: boolean }>`
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: ${props => props.selected ? 'rgba(0, 120, 212, 0.05)' : 'white'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.selected ? 'rgba(0, 120, 212, 0.1)' : '#f9f9f9'};
  }
`;

const DocumentCheck = styled.div<{ selected: boolean }>`
  width: 18px;
  height: 18px;
  border: 2px solid ${props => props.selected ? '#0078d4' : '#aaa'};
  border-radius: 3px;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &:after {
    content: '';
    display: ${props => props.selected ? 'block' : 'none'};
    width: 10px;
    height: 10px;
    background-color: #0078d4;
  }
`;

const DocumentInfo = styled.div`
  flex-grow: 1;
`;

const NoResults = styled.div`
  padding: 2rem;
  text-align: center;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 4px;
`;

const AnswerSection = styled.div`
  margin-top: 2rem;
`;

const EditorContainer = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const ActionButtons = styled.div`
  display: flex;
`;

const ModelInfo = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #666;
`;

const InfoItem = styled.div`
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  margin-bottom: 2rem;
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  align-items: center;
  margin-right: 2rem;
  
  opacity: ${props => props.active || props.completed ? '1' : '0.5'};
  
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
  border: 2px solid ${props => props.completed || props.active ? '#0078d4' : '#ddd'};
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
    content: ${props => props.completed ? '"✓"' : 'none'};
  }
`;

const StepLabel = styled.div<{ active: boolean }>`
  font-weight: ${props => props.active ? '500' : 'normal'};
`;

const StatusLine = styled.div<{ status: string }>`
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  background-color: ${props => {
    switch (props.status) {
      case 'ready_for_review': return '#e3f2fd';
      case 'approved': return '#e6f7e6';
      case 'rejected': return '#ffebee';
      case 'revision_requested': return '#fff8e1';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'ready_for_review': return '#1976d2';
      case 'approved': return '#2e7d32';
      case 'rejected': return '#c62828';
      case 'revision_requested': return '#f57c00';
      default: return '#333';
    }
  }};
  border-radius: 4px;
  font-weight: 500;
`;

const generateTooltip = (docs: Document[]) => {
  if (docs.length === 0) return "No documents selected yet";
  if (docs.length === 1) return `1 document selected: ${docs[0].title}`;
  return `${docs.length} documents selected`;
};

/**
 * CreateQA page component.
 * Allows creating or editing a QA pair.
 */
const CreateQA: React.FC<CreateQAProps> = ({ isEditMode = false }) => {
  const { collectionId, qaId } = useParams<{ collectionId: string; qaId: string }>();
  const navigate = useNavigate();
  
  // State for the current step in the workflow
  const [currentStep, setCurrentStep] = useState(1);
  
  // Question state
  const [question, setQuestion] = useState('');
  
  // Document search and selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Sources state
  const [sources, setSources] = useState<Source[]>([]);
  const [activeSource, setActiveSource] = useState<string>('all');
  
  // Answer generation state
  const [answer, setAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<{
    model?: string;
    tokens?: Record<string, number>;
  } | null>(null);
  
  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Edit mode state
  const [originalQA, setOriginalQA] = useState<any | null>(null);
  const [status, setStatus] = useState<string>('ready_for_review');
  
  // Fetch sources on component mount
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const sourcesData = await RetrievalService.getSources();
        setSources(sourcesData);
      } catch (error) {
        console.error('Error fetching sources:', error);
        // Non-critical error, so just log it
      }
    };
    
    fetchSources();
    
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
  
  // Handle document search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      let sourcesToSearch = undefined;
      if (activeSource !== 'all') {
        sourcesToSearch = [activeSource];
      }
      
      const results = await RetrievalService.searchDocuments({
        query: searchQuery,
        sources: sourcesToSearch
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching documents:', error);
      setSearchError('Failed to search documents. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle document selection toggle
  const toggleDocumentSelection = (document: Document) => {
    const isSelected = selectedDocuments.some(doc => doc.id === document.id);
    
    if (isSelected) {
      setSelectedDocuments(selectedDocuments.filter(doc => doc.id !== document.id));
    } else {
      setSelectedDocuments([...selectedDocuments, document]);
    }
  };
  
  // Handle source tab change
  const handleSourceChange = (sourceId: string) => {
    setActiveSource(sourceId);
    setSearchResults([]);
  };
  
  // Generate answer based on question and selected documents
  const generateAnswer = async () => {
    if (!question.trim() || selectedDocuments.length === 0) {
      setGenerationError('Please enter a question and select at least one document');
      return;
    }
    
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const response = await GenerationService.generateAnswer({
        question,
        documents: selectedDocuments
      });
      
      setAnswer(response.answer);
      setGenerationInfo({
        model: response.model_used,
        tokens: response.token_usage
      });
      setCurrentStep(3);
    } catch (error) {
      console.error('Error generating answer:', error);
      setGenerationError('Failed to generate answer. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save the QA pair
  const saveQAPair = async () => {
    if (!question.trim() || !answer.trim() || selectedDocuments.length === 0) {
      setSaveError('Please complete all fields');
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const qaPairData = {
        question,
        answer,
        documents: selectedDocuments,
        status: 'ready_for_review' as 'ready_for_review' | 'approved' | 'rejected' | 'revision_requested'
      };
      
      let savedQA;
      
      if (isEditMode && qaId) {
        // Update existing QA pair
        savedQA = await CollectionsService.updateQAPair(qaId, qaPairData);
      } else if (collectionId) {
        // Create new QA pair
        savedQA = await CollectionsService.createQAPair(collectionId, qaPairData);
      } else {
        throw new Error('Missing collection ID');
      }
      
      // Navigate to the review page for the saved QA pair
      navigate(`/review-qa/${savedQA.id}`);
    } catch (error) {
      console.error('Error saving QA pair:', error);
      setSaveError('Failed to save QA pair. Please try again.');
      setIsSaving(false);
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
  
  // Handle keyboard shortcut for search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
        <Section>
          <SectionTitle>What question do you want to answer?</SectionTitle>
          <QuestionInput
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
          />
          
          <Button 
            onClick={() => goToStep(2)} 
            disabled={!question.trim()}
          >
            Next: Select Documents
          </Button>
        </Section>
      )}
      
      {/* Step 2: Select Documents */}
      {currentStep === 2 && (
        <Section>
          <SectionTitle>Select relevant documents for your answer</SectionTitle>
          
          <SourceTabs>
            <SourceTab 
              active={activeSource === 'all'}
              onClick={() => handleSourceChange('all')}
            >
              All Sources
            </SourceTab>
            
            {sources.map(source => (
              <SourceTab
                key={source.id}
                active={activeSource === source.id}
                onClick={() => handleSourceChange(source.id)}
              >
                {source.name}
              </SourceTab>
            ))}
          </SourceTabs>
          
          <SearchContainer>
            <SearchInput
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Search for relevant documents..."
            />
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </SearchContainer>
          
          {searchError && <ErrorMessage>{searchError}</ErrorMessage>}
          
          {isSearching ? (
            <LoadingSpinner>Searching for documents...</LoadingSpinner>
          ) : (
            <>
              {searchResults.length > 0 ? (
                <DocumentList>
                  {searchResults.map(document => (
                    <DocumentListItem
                      key={document.id}
                      onClick={() => toggleDocumentSelection(document)}
                      selected={selectedDocuments.some(doc => doc.id === document.id)}
                    >
                      <DocumentCheck 
                        selected={selectedDocuments.some(doc => doc.id === document.id)} 
                      />
                      <DocumentInfo>
                        <DocumentTitle>{document.title}</DocumentTitle>
                        <DocumentContent>{document.content.substring(0, 150)}...</DocumentContent>
                        <DocumentSource>Source: {document.source.name}</DocumentSource>
                      </DocumentInfo>
                    </DocumentListItem>
                  ))}
                </DocumentList>
              ) : searchQuery.trim() !== '' && (
                <NoResults>No documents found for your search query</NoResults>
              )}
              
              {selectedDocuments.length > 0 && (
                <>
                  <SectionTitle>Selected Documents ({selectedDocuments.length})</SectionTitle>
                  <DocumentList>
                    {selectedDocuments.map(document => (
                      <DocumentListItem
                        key={document.id}
                        onClick={() => toggleDocumentSelection(document)}
                        selected={true}
                      >
                        <DocumentCheck selected={true} />
                        <DocumentInfo>
                          <DocumentTitle>{document.title}</DocumentTitle>
                          <DocumentContent>{document.content.substring(0, 150)}...</DocumentContent>
                          <DocumentSource>Source: {document.source.name}</DocumentSource>
                        </DocumentInfo>
                      </DocumentListItem>
                    ))}
                  </DocumentList>
                </>
              )}
            </>
          )}
          
          <ButtonContainer>
            <SecondaryButton onClick={() => goToStep(1)}>
              Back: Edit Question
            </SecondaryButton>
            
            <Button 
              onClick={() => goToStep(3)} 
              disabled={selectedDocuments.length === 0}
            >
              Next: Create Answer
            </Button>
          </ButtonContainer>
        </Section>
      )}
      
      {/* Step 3: Create Answer */}
      {currentStep === 3 && (
        <Section>
          <SectionTitle>Question</SectionTitle>
          <p style={{ marginBottom: '2rem' }}>{question}</p>
          
          <SectionTitle>Create Answer</SectionTitle>
          
          <EditorContainer data-color-mode="light">
            <MDEditor
              value={answer}
              onChange={(value) => setAnswer(value || '')}
              preview="edit"
              height={300}
              previewOptions={{
                rehypePlugins: [[rehypeSanitize]],
              }}
            />
          </EditorContainer>
          
          {generationError && <ErrorMessage>{generationError}</ErrorMessage>}
          
          <Button 
            onClick={generateAnswer}
            disabled={isGenerating || selectedDocuments.length === 0}
          >
            {isGenerating ? 'Generating...' : 'Generate Answer with AI'}
          </Button>
          
          {saveError && <ErrorMessage>{saveError}</ErrorMessage>}
          
          {generationInfo && (
            <ModelInfo>
              <InfoItem>Generated using: {generationInfo.model || 'AI model'}</InfoItem>
              {generationInfo.tokens && (
                <>
                  <InfoItem>Prompt tokens: {generationInfo.tokens.prompt_tokens}</InfoItem>
                  <InfoItem>Completion tokens: {generationInfo.tokens.completion_tokens}</InfoItem>
                  <InfoItem>Total tokens: {generationInfo.tokens.total_tokens}</InfoItem>
                </>
              )}
            </ModelInfo>
          )}
          
          <ButtonContainer>
            <SecondaryButton onClick={() => goToStep(2)}>
              Back: Select Documents
            </SecondaryButton>
            
            <ActionButtons>
              <Button 
                onClick={saveQAPair}
                disabled={isSaving || !answer.trim()}
              >
                {isSaving ? 'Saving...' : (isEditMode ? 'Update Q&A Pair' : 'Save Q&A Pair')}
              </Button>
            </ActionButtons>
          </ButtonContainer>
        </Section>
      )}
    </CreateQAContainer>
  );
};

export default CreateQA;
