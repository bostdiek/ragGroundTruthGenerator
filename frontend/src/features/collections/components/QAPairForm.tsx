/**
 * QAPairForm Component
 *
 * This component provides a form for creating or editing QA pairs.
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { QAPair } from '../types';

interface QAPairFormProps {
  initialData?: Partial<QAPair>;
  onSubmit: (data: Partial<QAPair>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Styled components
const FormContainer = styled(Card)`
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  min-height: 150px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 1px #6366f1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

/**
 * QA Pair Form Component
 */
const QAPairForm: React.FC<QAPairFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<QAPair>>({
    question: '',
    answer: '',
    ...initialData,
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <FormContainer variant="elevated" padding="medium">
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Input
            id="question"
            name="question"
            label="Question"
            value={formData.question || ''}
            onChange={handleChange}
            placeholder="Enter the question"
            fullWidth
            required
          />
        </FormGroup>

        <FormGroup>
          <FormGroup>
            <label htmlFor="answer">Answer</label>
            <Textarea
              id="answer"
              name="answer"
              value={formData.answer || ''}
              onChange={handleChange}
              placeholder="Enter the answer"
              required
            />
          </FormGroup>
        </FormGroup>

        <ButtonGroup>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !formData.question || !formData.answer}
          >
            {isLoading ? 'Saving...' : initialData.id ? 'Update' : 'Create'}
          </Button>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default QAPairForm;
