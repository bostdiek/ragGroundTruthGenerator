import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import CollectionsService from '../services/collections.service';

// Styled Components
const CreateContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
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

const Form = styled.form`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #0078d4;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const Tag = styled.div`
  background-color: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
  display: flex;
  align-items: center;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: #999;
  margin-left: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    color: #d32f2f;
  }
`;

const TagInput = styled(Input)`
  margin-bottom: 0.5rem;
`;

const AddTagButton = styled.button`
  background-color: #f0f0f0;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const HelpText = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
`;

const ErrorText = styled.p`
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelButton = styled.button`
  background-color: #f3f3f3;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #e6e6e6;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  background-color: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #106ebe;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * CreateCollection component for creating a new collection.
 */
const CreateCollection: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Form validation state
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add a new tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // Handle tag input keydown (add tag on Enter key)
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Validate form fields
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      setNameError('Collection name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Validate description
    if (!description.trim()) {
      setDescriptionError('Description is required');
      isValid = false;
    } else {
      setDescriptionError('');
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create collection using the service
      const newCollection = await CollectionsService.createCollection({
        name: name.trim(),
        description: description.trim(),
        tags: tags
      });
      
      // Navigate to the create Q&A form for this collection
      navigate(`/create-qa/${newCollection.id}`);
    } catch (error) {
      console.error('Error creating collection:', error);
      // In a real app, we would show an error notification
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    navigate('/collections');
  };
  
  return (
    <CreateContainer>
      <Header>
        <Title>Create New Collection</Title>
        <Subtitle>Create a collection to organize your Q&A pairs</Subtitle>
      </Header>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Collection Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name for your collection"
            required
          />
          {nameError && <ErrorText>{nameError}</ErrorText>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this collection is about"
            required
          />
          {descriptionError && <ErrorText>{descriptionError}</ErrorText>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="tags">Tags</Label>
          <TagInput
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Enter tags to categorize your collection"
          />
          <AddTagButton 
            type="button" 
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
          >
            Add Tag
          </AddTagButton>
          <HelpText>Press Enter to add a tag</HelpText>
          
          {tags.length > 0 && (
            <TagsContainer>
              {tags.map((tag, index) => (
                <Tag key={index}>
                  {tag}
                  <RemoveTagButton
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </RemoveTagButton>
                </Tag>
              ))}
            </TagsContainer>
          )}
        </FormGroup>
        
        <ButtonContainer>
          <CancelButton 
            type="button" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </CancelButton>
          <SubmitButton 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Collection'}
          </SubmitButton>
        </ButtonContainer>
      </Form>
    </CreateContainer>
  );
};

export default CreateCollection;
