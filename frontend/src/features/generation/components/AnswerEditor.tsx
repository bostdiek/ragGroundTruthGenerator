import MDEditor from '@uiw/react-md-editor';
import React, { useState } from 'react';
import rehypeSanitize from 'rehype-sanitize';
import styled from 'styled-components';

import { Alert } from '../../../components/ui/Alert';
import { Button as UIButton } from '../../../components/ui/Button';
import { colors } from '../../../components/ui/theme';
import { Document } from '../../../types';
import GenerationService from '../api/generation.service';
import GenerationRules from './GenerationRules';
import SelectedDocumentsDisplay from './SelectedDocumentsDisplay';

interface AnswerEditorProps {
  question: string;
  answer: string;
  onAnswerChange: (answer: string) => void;
  selectedDocuments: Document[];
  onPreviousStep: () => void;
  onSave: () => void;
  isSaving?: boolean;
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

const AutoResponseButton = styled(UIButton)`
  background-color: ${colors.success.main};
  color: ${colors.common.white};
  border: none;

  &:hover {
    background-color: ${colors.success.dark};
  }

  &:disabled {
    background-color: ${colors.success.light};
  }
`;

const SecondaryButton = styled(UIButton)`
  background-color: ${colors.grey[100]};
  color: ${colors.text.primary};
  border: 1px solid ${colors.grey[300]};

  &:hover {
    background-color: ${colors.grey[200]};
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
  isSaving = false,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [rules, setRules] = useState<string[]>([]);
  const [editorMode, setEditorMode] = useState<'edit' | 'live'>('edit');
  const [hasGeneratedAnswer, setHasGeneratedAnswer] = useState(false);
  // Error state for save operations that might be used in future enhancements
  const [saveError] = useState<string | null>(null);

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
    setHasGeneratedAnswer(true);

    try {
      const response = await GenerationService.generateAnswer({
        question,
        documents: selectedDocuments,
        custom_rules: rules,
      });

      onAnswerChange(response.answer);
      // For debugging purposes, log the model and token information
      console.debug('Generation info:', {
        model: response.model_used,
        tokens: response.token_usage,
      });
      setEditorMode('live');
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

      {/* Display selected documents */}
      <SelectedDocumentsDisplay documents={selectedDocuments} />

      {/* Rules input */}
      <GenerationRules rules={rules} onRulesChange={setRules} />

      <SectionTitle>Create Answer</SectionTitle>

      <div style={{ marginBottom: '1rem' }}>
        <AutoResponseButton
          onClick={generateAnswer}
          disabled={isGenerating || selectedDocuments.length === 0}
          style={{ marginBottom: '1rem' }}
        >
          {isGenerating
            ? 'Generating...'
            : hasGeneratedAnswer
              ? 'Try another answer'
              : 'Auto generate an answer'}
        </AutoResponseButton>
        {generationError && <Alert variant="error">{generationError}</Alert>}
      </div>

      <EditorContainer data-color-mode="light">
        <MDEditor
          value={answer}
          onChange={value => onAnswerChange(value || '')}
          preview={editorMode}
          height={400}
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
        />
      </EditorContainer>

      {saveError && <Alert variant="error">{saveError}</Alert>}

      <ButtonContainer>
        <SecondaryButton onClick={onPreviousStep} disabled={isSaving}>
          Back: Select Documents
        </SecondaryButton>

        <ActionButtons>
          <UIButton onClick={onSave} disabled={isSaving || !answer.trim()}>
            {isSaving ? 'Saving Q&A Pair...' : 'Save Q&A Pair'}
          </UIButton>
        </ActionButtons>
      </ButtonContainer>
    </Section>
  );
};

export default AnswerEditor;
