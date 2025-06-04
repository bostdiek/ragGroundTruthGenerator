import MDEditor from '@uiw/react-md-editor';
import React, { useState } from 'react';
import rehypeSanitize from 'rehype-sanitize';
import styled from 'styled-components';

import GenerationService from '../api/generation.service';
import { GenerationRequest } from '../types';

interface AnswerEditorProps {
  question: string;
  answer: string;
  onAnswerChange: (answer: string) => void;
  selectedDocuments: any[];
  onPreviousStep: () => void;
  onSave: () => void;
}

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.3rem;
`;

const EditorContainer = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const ActionButtons = styled.div`
  display: flex;
`;

const ErrorMessage = styled.div`
  color: #d13438;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #fde7e9;
  border-radius: 4px;
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

/**
 * Component for editing and generating answers
 */
const AnswerEditor: React.FC<AnswerEditorProps> = ({
  question,
  answer,
  onAnswerChange,
  selectedDocuments,
  onPreviousStep,
  onSave,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<{
    model: string;
    tokens: Record<string, number>;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Generate answer based on question and selected documents
  const generateAnswer = async () => {
    if (!question.trim() || selectedDocuments.length === 0) {
      setGenerationError(
        'Please enter a question and select at least one document'
      );
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await GenerationService.generateAnswer({
        question,
        documents: selectedDocuments,
      });

      onAnswerChange(response.answer);
      setGenerationInfo({
        model: response.model_used,
        tokens: response.token_usage,
      });
    } catch (error) {
      console.error('Error generating answer:', error);
      setGenerationError('Failed to generate answer. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Section>
      <SectionTitle>Question</SectionTitle>
      <p style={{ marginBottom: '2rem' }}>{question}</p>

      <SectionTitle>Create Answer</SectionTitle>

      <EditorContainer data-color-mode="light">
        <MDEditor
          value={answer}
          onChange={value => onAnswerChange(value || '')}
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
          <InfoItem>
            Generated using: {generationInfo.model || 'AI model'}
          </InfoItem>
          {generationInfo.tokens && (
            <>
              <InfoItem>
                Prompt tokens: {generationInfo.tokens.prompt_tokens}
              </InfoItem>
              <InfoItem>
                Completion tokens: {generationInfo.tokens.completion_tokens}
              </InfoItem>
              <InfoItem>
                Total tokens: {generationInfo.tokens.total_tokens}
              </InfoItem>
            </>
          )}
        </ModelInfo>
      )}

      <ButtonContainer>
        <SecondaryButton onClick={onPreviousStep}>
          Back: Select Documents
        </SecondaryButton>

        <ActionButtons>
          <Button onClick={onSave} disabled={isSaving || !answer.trim()}>
            {isSaving ? 'Saving...' : 'Save Q&A Pair'}
          </Button>
        </ActionButtons>
      </ButtonContainer>
    </Section>
  );
};

export default AnswerEditor;
