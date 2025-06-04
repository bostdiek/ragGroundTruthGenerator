import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import CollectionsService from '../api/collections.service';

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

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 120px;
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
  margin-top: 0.5rem;
`;

const Tag = styled.div`
  background-color: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;
  display: flex;
  align-items: center;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1rem;
  margin-left: 0.5rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #d13438;
  }
`;

const TagInput = styled.div`
  display: flex;
`;

const TagInputField = styled(Input)`
  margin-right: 0.5rem;
`;

const AddTagButton = styled.button`
  background-color: #f3f3f3;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: #e6e6e6;
  }

  &:disabled {
    background-color: #f3f3f3;
    color: #ccc;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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

  &:hover {
    background-color: #106ebe;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background-color: #f3f3f3;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: #e6e6e6;
  }
`;

const HelpText = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: #d13438;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

/**
 * CreateCollection page component.
 * Allows creating a new collection or editing an existing one.
 */
const CreateCollection: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ collectionId?: string }>();
  const isEditMode = !!params.collectionId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!params.collectionId); // Only set loading to true if in edit mode

  // Fetch collection data if in edit mode
  useEffect(() => {
    const fetchCollection = async () => {
      if (!params.collectionId) {
        // Not in edit mode, just return without loading
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const collection = await CollectionsService.getCollection(
          params.collectionId
        );
        setName(collection.name);
        setDescription(collection.description);
        setTags(collection.tags || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching collection:', error);
        setErrors({
          fetch: 'Failed to load collection data. Please try again.',
        });
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [params.collectionId]);

  const handleAddTag = () => {
    if (tagInput.trim() === '') return;

    // Don't add duplicate tags
    if (tags.includes(tagInput.trim())) {
      setTagInput('');
      return;
    }

    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleAddTag();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (name.trim() === '') {
      newErrors.name = 'Collection name is required';
    }

    if (description.trim() === '') {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // Update existing collection
        const updatedCollection = await CollectionsService.updateCollection(
          params.collectionId!,
          {
            name,
            description,
            tags,
          }
        );

        console.log('Updated collection:', updatedCollection);
        navigate(`/collections/${updatedCollection.id}`);
      } else {
        // Create new collection
        const newCollection = await CollectionsService.createCollection({
          name,
          description,
          tags,
        });

        console.log('Created collection:', newCollection);
        navigate(`/collections/${newCollection.id}`);
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? 'updating' : 'creating'} collection:`,
        error
      );
      setErrors({
        submit: `Failed to ${isEditMode ? 'update' : 'create'} collection. Please try again.`,
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/collections');
  };

  return (
    <CreateContainer>
      <Header>
        <Title>{isEditMode ? 'Edit Collection' : 'Create Collection'}</Title>
        <Subtitle>
          {isEditMode
            ? 'Update your collection details'
            : 'Create a new collection to organize your Q&A pairs'}
        </Subtitle>
      </Header>

      {isLoading ? (
        <div>Loading collection data...</div>
      ) : (
        <Form onSubmit={handleSubmit}>
          {errors.fetch && <ErrorMessage>{errors.fetch}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="name">Collection Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter a name for your collection"
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            <HelpText>
              Choose a clear, descriptive name for your collection
            </HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the purpose and content of this collection"
            />
            {errors.description && (
              <ErrorMessage>{errors.description}</ErrorMessage>
            )}
            <HelpText>
              Explain what types of Q&A pairs will be included
            </HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="tags">Tags</Label>
            <TagInput>
              <TagInputField
                id="tags"
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Add tags to categorize your collection"
                onKeyDown={handleTagInputKeyDown}
              />
              <AddTagButton
                type="button"
                onClick={handleAddTag}
                disabled={tagInput.trim() === ''}
              >
                Add
              </AddTagButton>
            </TagInput>
            <HelpText>Press Enter or click Add to add a tag</HelpText>

            {tags.length > 0 && (
              <TagsContainer>
                {tags.map((tag, index) => (
                  <Tag key={index}>
                    {tag}
                    <RemoveTagButton
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      aria-label="Remove tag"
                    >
                      ×
                    </RemoveTagButton>
                  </Tag>
                ))}
              </TagsContainer>
            )}
          </FormGroup>

          {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}

          <ButtonGroup>
            <CancelButton type="button" onClick={handleCancel}>
              Cancel
            </CancelButton>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                  ? 'Update Collection'
                  : 'Create Collection'}
            </Button>
          </ButtonGroup>
        </Form>
      )}
    </CreateContainer>
  );
};

export default CreateCollection;
