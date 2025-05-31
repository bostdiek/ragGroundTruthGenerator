import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import CollectionsService from '../services/collections.service';
import RetrievalService from '../services/retrieval.service';
import GenerationService from '../services/generation.service';
import { Document, Source } from '../types';

// API endpoint (would be configured from environment in real app)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Types
interface SourceSimple {
  id: string;
  name: string;
  description: string;
}

interface GenerationResponse {
  answer: string;
  model_used: string;
  token_usage: Record<string, number>;
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

const SourcesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SourceChip = styled.div<{ active: boolean }>`
  background-color: ${props => props.active ? '#0078d4' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#333'};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#106ebe' : '#e0e0e0'};
  }
`;

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DocumentCard = styled.div<{ selected: boolean }>`
  background-color: white;
  border: 2px solid ${props => props.selected ? '#0078d4' : '#f0f0f0'};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  
  &:hover {
    border-color: ${props => props.selected ? '#0078d4' : '#ddd'};
    background-color: ${props => props.selected ? '#f0f9ff' : '#f9f9f9'};
  }
`;

const DocumentTitle = styled.h3`
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #333;
`;

const DocumentPreview = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const DocumentSource = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #888;
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

const RulesContainer = styled.div`
  margin-bottom: 1rem;
`;

const RuleInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  
  &:focus {
    outline: none;
    border-color: #0078d4;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
  }
`;

const AddRuleButton = styled.button`
  background-color: #f3f3f3;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background-color: #e6e6e6;
  }
`;

const RulesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 1rem 0;
`;

const RuleItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const RemoveButton = styled.button`
  background-color: transparent;
  color: #999;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  
  &:hover {
    color: #ff3b30;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
`;

/**
 * CreateQA page component.
 * Allows creating a new question-answer pair with document selection and answer generation.
 */
const CreateQA: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  
  // State
  const [question, setQuestion] = useState('');
  const [sources, setSources] = useState<SourceSimple[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [customRules, setCustomRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const [activeTab, setActiveTab] = useState<'markdown' | 'preview'>('markdown');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  
  // Fetch available sources on component mount
  useEffect(() => {
    const fetchSources = async () => {
      try {
        // Fetch sources from the API
        const response = await RetrievalService.getSources();
        setSources(response);
      } catch (err) {
        console.error('Error fetching sources:', err);
      }
    };
    
    fetchSources();
  }, []);
  
  // Fetch collection details
  useEffect(() => {
    const fetchCollection = async () => {
      if (!collectionId) return;
      
      try {
        const collection = await CollectionsService.getCollection(collectionId);
        setCollectionName(collection.name);
      } catch (err) {
        console.error('Error fetching collection:', err);
      }
    };
    
    fetchCollection();
  }, [collectionId]);
  
  // Handle retrieving documents
  const handleRetrieve = async () => {
    if (!question) return;
    
    setIsRetrieving(true);
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll use a mock response
      setTimeout(() => {
        const mockDocuments: Document[] = [
          {
            id: 'doc1',
            title: 'Model X Maintenance Manual',
            content: 'Chapter 5: Air Filter Replacement. To replace the air filter in a Model X, follow these steps:\n\n1. Open the hood\n2. Locate the air filter housing\n3. Remove the cover\n4. Replace the filter\n5. Replace the cover\n6. Close the hood',
            source: {
              id: 'manuals',
              name: 'Maintenance Manuals',
              type: 'technical_document'
            },
            url: 'https://example.com/docs/model-x-manual.pdf',
            metadata: { type: 'maintenance', equipment: 'Model X' }
          },
          {
            id: 'doc2',
            title: 'SAP Notification #12345',
            content: 'Issue reported with air filter system in Model X. Customer complaint: unusual smell when AC is running. Technician report: air filter was heavily clogged and needed replacement.',
            source: {
              id: 'sap',
              name: 'SAP Notifications',
              type: 'notification'
            },
            url: 'https://sap.example.com/notifications/12345',
            metadata: { type: 'notification', equipment: 'Model X', component: 'air filter' }
          },
          {
            id: 'doc3',
            title: 'Wiki: Common Maintenance Procedures',
            content: 'Air filters should be replaced every 12 months or 12,000 miles, whichever comes first. Signs of a clogged air filter include reduced fuel efficiency and unusual smells from the ventilation system.',
            source: {
              id: 'wiki',
              name: 'Internal Wiki',
              type: 'knowledge_base'
            },
            url: 'https://wiki.example.com/maintenance/common-procedures',
            metadata: { type: 'wiki', tags: ['maintenance', 'air filter'] }
          }
        ];
        
        // Filter by selected sources if any are selected
        const filteredDocuments = selectedSources.length > 0
          ? mockDocuments.filter(doc => selectedSources.includes(doc.source.id))
          : mockDocuments;
        
        setDocuments(filteredDocuments);
        setIsRetrieving(false);
      }, 1000);
    } catch (err) {
      console.error('Error retrieving documents:', err);
      setIsRetrieving(false);
    }
  };
  
  // Handle toggling document selection
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };
  
  // Handle toggling source selection
  const toggleSourceSelection = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };
  
  // Handle adding a custom rule
  const handleAddRule = () => {
    if (newRule.trim()) {
      setCustomRules(prev => [...prev, newRule.trim()]);
      setNewRule('');
    }
  };
  
  // Handle removing a custom rule
  const handleRemoveRule = (index: number) => {
    setCustomRules(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle generating an answer
  const handleGenerate = async () => {
    if (selectedDocuments.length === 0) return;
    
    setIsGenerating(true);
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll use a mock response
      setTimeout(() => {
        // Get the selected documents
        const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
        
        // Generate a mock answer
        const mockResponse: GenerationResponse = {
          answer: `# Answer to: "${question}"\n\n## Air Filter Replacement in Model X\n\nTo replace the air filter in a Model X, follow these steps:\n\n1. Open the hood of the vehicle\n2. Locate the air filter housing on the passenger side\n3. Remove the cover (may require releasing clips)\n4. Take out the old filter\n5. Insert the new filter with the same orientation\n6. Replace the cover securely\n7. Close the hood\n\n**Maintenance Schedule:** Air filters should be replaced every 12 months or 12,000 miles, whichever comes first.\n\n**Warning Signs:** If you notice unusual smells from the ventilation system or reduced fuel efficiency, your air filter may need replacement before the scheduled maintenance.`,
          model_used: 'gpt-4',
          token_usage: {
            prompt_tokens: 350,
            completion_tokens: 200,
            total_tokens: 550
          }
        };
        
        setAnswer(mockResponse.answer);
        setIsGenerating(false);
      }, 1500);
    } catch (err) {
      console.error('Error generating answer:', err);
      setIsGenerating(false);
    }
  };
  
  // Handle saving the Q&A pair
  const handleSave = async () => {
    if (!question || !answer || !collectionId) return;
    
    setIsSaving(true);
    try {
      // Get the selected documents
      const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
      
      // Use the collections service to create the QA pair
      await CollectionsService.createQAPair(collectionId, {
        question,
        answer,
        documents: selectedDocs,
        status: 'ready_for_review',
        metadata: {
          custom_rules: customRules
        }
      });
      
      // Navigate back to the collection
      navigate(`/collections/${collectionId}`);
      
    } catch (err) {
      console.error('Error saving Q&A pair:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <CreateQAContainer>
      <Header>
        <Title>Create New Question & Answer</Title>
        <Subtitle>Collection: {collectionName || collectionId}</Subtitle>
      </Header>
      
      <Section>
        <SectionTitle>1. Enter Your Question</SectionTitle>
        <QuestionInput
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question here..."
        />
      </Section>
      
      <Section>
        <SectionTitle>2. Select Data Sources</SectionTitle>
        <SourcesContainer>
          {sources.map(source => (
            <SourceChip
              key={source.id}
              active={selectedSources.includes(source.id)}
              onClick={() => toggleSourceSelection(source.id)}
            >
              {source.name}
            </SourceChip>
          ))}
        </SourcesContainer>
        <Button onClick={handleRetrieve} disabled={isRetrieving}>
          {isRetrieving ? 'Retrieving...' : 'Retrieve Documents'}
        </Button>
      </Section>
      
      {documents.length > 0 && (
        <Section>
          <SectionTitle>3. Select Relevant Documents</SectionTitle>
          <DocumentsGrid>
            {documents.map(document => (
              <DocumentCard
                key={document.id}
                selected={selectedDocuments.includes(document.id)}
                onClick={() => toggleDocumentSelection(document.id)}
              >
                <DocumentTitle>{document.title}</DocumentTitle>
                <DocumentPreview>{document.content}</DocumentPreview>
                <DocumentSource>
                  Source: {sources.find(s => s.id === document.source.id)?.name || document.source.name}
                </DocumentSource>
              </DocumentCard>
            ))}
          </DocumentsGrid>
        </Section>
      )}
      
      {selectedDocuments.length > 0 && (
        <Section>
          <SectionTitle>4. Custom Rules (Optional)</SectionTitle>
          <RulesContainer>
            <RuleInput
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="Add a custom rule for answer generation (e.g., Use bullet points for lists)"
              onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
            />
            <AddRuleButton onClick={handleAddRule}>Add Rule</AddRuleButton>
            
            {customRules.length > 0 && (
              <RulesList>
                {customRules.map((rule, index) => (
                  <RuleItem key={index}>
                    {rule}
                    <RemoveButton onClick={() => handleRemoveRule(index)}>✕</RemoveButton>
                  </RuleItem>
                ))}
              </RulesList>
            )}
          </RulesContainer>
          
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Answer'}
          </Button>
        </Section>
      )}
      
      {answer && (
        <Section>
          <SectionTitle>5. Review & Edit Answer</SectionTitle>
          <TabContainer>
            <TabButtons>
              <TabButton
                active={activeTab === 'markdown'}
                onClick={() => setActiveTab('markdown')}
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
            
            {activeTab === 'markdown' ? (
              <MDEditor
                value={answer}
                onChange={(value) => setAnswer(value || '')}
                height={400}
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
                }}
              />
            ) : (
              <MDEditor.Markdown source={answer} />
            )}
          </TabContainer>
          
          <ButtonContainer>
            <SecondaryButton onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Regenerating...' : 'Regenerate'}
            </SecondaryButton>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Q&A Pair'}
            </Button>
          </ButtonContainer>
        </Section>
      )}
    </CreateQAContainer>
  );
};

export default CreateQA;
