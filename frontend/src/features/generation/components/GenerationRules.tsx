import React, { useState } from 'react';
import styled from 'styled-components';

interface GenerationRulesProps {
  rules: string[];
  onRulesChange: (rules: string[]) => void;
}

const RulesContainer = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.3rem;
`;

const RulesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const RuleTag = styled.div`
  display: flex;
  align-items: center;
  background-color: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 20px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  color: #0d47a1;
  max-width: 100%;
`;

const RuleText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RuleInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

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
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #106ebe;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.5);
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #0d47a1;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 6px;
  padding: 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #d32f2f;
  }
`;

const EmptyState = styled.div`
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  color: #666;
  margin-bottom: 1rem;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

/**
 * Component for managing custom generation rules
 */
const GenerationRules: React.FC<GenerationRulesProps> = ({
  rules,
  onRulesChange,
}) => {
  const [newRule, setNewRule] = useState('');

  const addRule = () => {
    if (newRule.trim()) {
      const updatedRules = [...rules, newRule.trim()];
      onRulesChange(updatedRules);
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    const updatedRules = [...rules];
    updatedRules.splice(index, 1);
    onRulesChange(updatedRules);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addRule();
    }
  };

  return (
    <RulesContainer>
      <SectionTitle>Generation Rules</SectionTitle>

      <EmptyState>
        Add rules to guide the answer generation process. Rules can include
        business logic, formatting requirements, tone guidelines, or other
        specific criteria to ensure generated answers meet your needs.
      </EmptyState>

      <InputContainer>
        <RuleInput
          value={newRule}
          onChange={e => setNewRule(e.target.value)}
          placeholder="Enter a new rule..."
          onKeyPress={handleKeyPress}
        />
        <Button onClick={addRule} disabled={!newRule.trim()}>
          Add Rule
        </Button>
      </InputContainer>

      {rules.length > 0 && (
        <RulesList>
          {rules.map((rule, index) => (
            <RuleTag key={index}>
              <RuleText title={rule}>{rule}</RuleText>
              <RemoveButton
                onClick={() => removeRule(index)}
                aria-label="Remove rule"
              >
                ✕
              </RemoveButton>
            </RuleTag>
          ))}
        </RulesList>
      )}
    </RulesContainer>
  );
};

export default GenerationRules;
