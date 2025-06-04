import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import styled from 'styled-components';

import { Alert, Button, Card, Form } from '../../../components';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  transitions,
  typography,
} from '../../../components/ui/theme';
import { Document } from '../../../types';
import RetrievalService from '../api/retrieval.service';
import useRetrievalStore from '../stores/retrievalStore';

// Styled components using the design system
const DiscoveryContainer = styled.div`
  margin-bottom: ${spacing.xl};
`;

const PageTitle = styled.h2`
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.xxl};
  font-weight: ${typography.fontWeight.semiBold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.lg};
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.grey[300]};
  border-radius: ${borderRadius.md};
  min-height: 100px;
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.md};
  color: ${colors.text.primary};
  resize: vertical;
  box-sizing: border-box;
  transition: all ${transitions.duration.short} ${transitions.easing.easeInOut};

  &:focus {
    outline: none;
    border-color: ${colors.primary.main};
    box-shadow: 0 0 0 2px ${colors.primary.main}20;
  }

  &:disabled {
    background-color: ${colors.grey[100]};
    color: ${colors.text.disabled};
    cursor: not-allowed;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${spacing.xl} 0;
  font-style: italic;
  color: ${colors.text.secondary};
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.md};
`;

const ResultsContainer = styled.div`
  margin-top: ${spacing.xl};
`;

const SectionTitle = styled.h3`
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.semiBold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.md};
`;

const SectionDescription = styled.p`
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.md};
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.lg};
  line-height: ${typography.lineHeight.md};
`;

const DocumentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const DocumentItem = styled(Card)<{ selected: boolean }>`
  cursor: pointer;
  transition: all ${transitions.duration.short} ${transitions.easing.easeInOut};
  border: 2px solid
    ${props => (props.selected ? colors.primary.main : 'transparent')};
  background-color: ${props =>
    props.selected ? colors.primary.light : colors.background.paper};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
    border-color: ${colors.primary.main};
  }
`;

const DocumentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.sm};
`;

const DocumentTitle = styled.h4`
  margin: 0;
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semiBold};
  color: ${colors.text.primary};
  flex: 1;
  margin-right: ${spacing.md};
`;

const RelevanceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${spacing.xs};
`;

const RelevanceIndicator = styled.div<{ score: number }>`
  width: 60px;
  height: 8px;
  background: ${props => {
    if (props.score > 0.8) return colors.success.main;
    if (props.score > 0.6) return '#8bc34a';
    if (props.score > 0.4) return colors.warning.main;
    if (props.score > 0.2) return '#ff9800';
    return colors.error.main;
  }};
  border-radius: ${borderRadius.sm};
`;

const RelevanceScore = styled.span`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  font-family: ${typography.fontFamily.primary};
  font-weight: ${typography.fontWeight.medium};
`;

const DocumentSource = styled.div`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.sm};
  margin-bottom: ${spacing.sm};
  font-family: ${typography.fontFamily.primary};
`;

const DocumentPreview = styled.div`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  line-height: ${typography.lineHeight.md};
  font-family: ${typography.fontFamily.primary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xl};
  color: ${colors.text.secondary};
  font-family: ${typography.fontFamily.primary};
  font-size: ${typography.fontSize.md};
  background-color: ${colors.background.paper};
  border-radius: ${borderRadius.md};
  border: 1px solid ${colors.grey[200]};
`;

/**
 * Component for automatically discovering relevant documents based on a question
 *
 * This component is part of the retrieval workflow and allows users to
 * input a question and automatically retrieve relevant documents based on
 * selected sources.
 */
const DocumentDiscovery: React.FC = () => {
  const {
    selectedSources,
    searchQuery,
    setSearchQuery,
    setLastSearchedQuery,
    documentResults,
    setDocumentResults,
    setStatus,
    selectDocument,
  } = useRetrievalStore();

  const [isDiscovering, setIsDiscovering] = useState(false);

  // Query to fetch recommended documents based on the question and selected sources
  const { refetch, isLoading, error, isError } = useQuery({
    queryKey: ['recommendedDocuments', searchQuery, selectedSources],
    queryFn: async () => {
      setIsDiscovering(true);
      try {
        // Only include the 'sources' filter if we have selected sources
        const filters =
          selectedSources.length > 0
            ? { sourceIds: selectedSources }
            : undefined;

        const result = await RetrievalService.getRecommendedDocuments(
          searchQuery,
          {
            filters,
            sort: 'relevance_score',
            sortDirection: 'desc',
            page: 1,
            limit: 10,
          }
        );

        // Update store with results
        setDocumentResults(result);
        setLastSearchedQuery(searchQuery);
        setStatus('selecting_documents');

        return result;
      } finally {
        setIsDiscovering(false);
      }
    },
    enabled: false, // Don't run automatically, only on button click
  });

  const handleDiscoverDocuments = () => {
    if (searchQuery.trim() === '') {
      return;
    }

    refetch();
  };

  const handleSelectDocument = (document: Document) => {
    selectDocument(document, !isDocumentSelected(document.id));
  };

  const isDocumentSelected = (documentId: string) => {
    return (
      documentResults?.documents.some(doc => doc.id === documentId) || false
    );
  };

  const renderDocumentResults = () => {
    if (isLoading || isDiscovering) {
      return (
        <LoadingIndicator>Discovering relevant documents...</LoadingIndicator>
      );
    }

    if (isError) {
      return (
        <Alert variant="error" title="Error discovering documents">
          {error instanceof Error
            ? error.message
            : 'Unknown error occurred while discovering documents'}
        </Alert>
      );
    }

    if (!documentResults || documentResults.documents.length === 0) {
      return searchQuery ? (
        <EmptyState>
          No relevant documents found for this question. Try refining your
          question or selecting different sources.
        </EmptyState>
      ) : null;
    }

    return (
      <ResultsContainer>
        <SectionTitle>Discovered Documents</SectionTitle>
        <SectionDescription>
          The following documents were found to be relevant to your question:
        </SectionDescription>
        <DocumentList>
          {documentResults.documents.map(document => (
            <DocumentItem
              key={document.id}
              selected={isDocumentSelected(document.id)}
              onClick={() => handleSelectDocument(document)}
            >
              <DocumentHeader>
                <DocumentTitle>{document.title}</DocumentTitle>
                <RelevanceContainer>
                  <RelevanceIndicator score={document.relevance_score || 0} />
                  <RelevanceScore>
                    {Math.round((document.relevance_score || 0) * 100)}% match
                  </RelevanceScore>
                </RelevanceContainer>
              </DocumentHeader>
              <DocumentSource>
                Source: {document.source?.name || 'Unknown'}
              </DocumentSource>
              <DocumentPreview>
                {document.content.substring(0, 200)}...
              </DocumentPreview>
            </DocumentItem>
          ))}
        </DocumentList>
      </ResultsContainer>
    );
  };

  return (
    <DiscoveryContainer>
      <PageTitle>Find Relevant Documents</PageTitle>

      <Form.FormField
        label="Enter your question"
        htmlFor="question"
        hint="Describe what you would like to know to find relevant documents"
      >
        <StyledTextarea
          id="question"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="What would you like to know?"
          disabled={isLoading || isDiscovering}
        />
      </Form.FormField>

      <Form.FormActions align="left">
        <Button
          variant="primary"
          onClick={handleDiscoverDocuments}
          disabled={
            searchQuery.trim() === '' ||
            isLoading ||
            isDiscovering ||
            selectedSources.length === 0
          }
        >
          Discover Relevant Documents
        </Button>
      </Form.FormActions>

      {renderDocumentResults()}
    </DiscoveryContainer>
  );
};

export default DocumentDiscovery;
