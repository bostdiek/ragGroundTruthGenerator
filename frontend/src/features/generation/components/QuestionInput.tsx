import React from 'react';
import styled from 'styled-components';

interface QuestionInputProps {
  question: string;
  onQuestionChange: (question: string) => void;
  onNextStep: () => void;
}

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.3rem;
`;

const QuestionTextarea = styled.textarea`
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

/**
 * Component for inputting a question
 */
const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  onQuestionChange,
  onNextStep,
}) => {
  return (
    <Section>
      <SectionTitle>What question do you want to answer?</SectionTitle>
      <QuestionTextarea
        value={question}
        onChange={e => onQuestionChange(e.target.value)}
        placeholder="Enter your question here..."
      />

      <Button onClick={onNextStep} disabled={!question.trim()}>
        Next: Select Documents
      </Button>
    </Section>
  );
};

export default QuestionInput;
