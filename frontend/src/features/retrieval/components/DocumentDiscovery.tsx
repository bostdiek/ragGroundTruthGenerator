import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Alert, Button, Card, Form } from '../../../components';
import DocumentCard from '../../../components/ui/DocumentCard';
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

// Props interface for DocumentDiscovery
interface DocumentDiscoveryProps {
  autoSearch?: boolean;
  hideSearchButton?: boolean;
  showSourceTabs?: boolean;
  onDocumentTabsVisible?: (visible: boolean) => void;
}

// Props interface for SelectableDocumentCard
interface SelectableDocumentCardProps {
  document: Document;
  selected: boolean;
  onClick: () => void;
}

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

const RelevanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background-color: ${colors.background.paper};
  border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;
  border-bottom: 1px solid ${colors.grey[200]};
`;

const RelevanceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
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

const SelectableDocumentCard = styled.div<{ selected: boolean }>`
  cursor: pointer;
  transition: all ${transitions.duration.short} ${transitions.easing.easeInOut};
  border: 2px solid
    ${props => (props.selected ? colors.primary.main : 'transparent')};
  border-radius: ${borderRadius.md};
  background-color: ${props =>
    props.selected ? colors.primary.light : 'transparent'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
    border-color: ${colors.primary.main};
  }

  .document-card {
    margin: 0;
  }
`;

const SelectableDocumentCardComponent: React.FC<
  SelectableDocumentCardProps
> = ({ document, selected, onClick }) => {
  return (
    <SelectableDocumentCard selected={selected} onClick={onClick}>
      <RelevanceHeader>
        <span
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
          }}
        >
          Source: {document.source?.name || 'Unknown'}
        </span>
        <RelevanceContainer>
          <RelevanceIndicator score={document.relevance_score || 0} />
          <RelevanceScore>
            {Math.round((document.relevance_score || 0) * 100)}% match
          </RelevanceScore>
        </RelevanceContainer>
      </RelevanceHeader>
      <div className="document-card">
        <DocumentCard doc={document} />
      </div>
    </SelectableDocumentCard>
  );
};

const DocumentDiscovery: React.FC<DocumentDiscoveryProps> = ({
  autoSearch = false,
  hideSearchButton = false,
  showSourceTabs = false,
  onDocumentTabsVisible,
}) => {
  const {
    selectedSources,
    searchQuery,
    setSearchQuery,
    setLastSearchedQuery,
    documentResults,
    setDocumentResults,
    setStatus,
    selectDocument,
    selectedDocuments,
  } = useRetrievalStore();

  const [isDiscovering, setIsDiscovering] = useState(false);
  const [activeSourceTab, setActiveSourceTab] = useState<string>('all');

  const { refetch, isLoading, error, isError } = useQuery({
    queryKey: ['recommendedDocuments', searchQuery, selectedSources],
    queryFn: async () => {
      setIsDiscovering(true);
      try {
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

        setDocumentResults(result);
        setLastSearchedQuery(searchQuery);
        setStatus('selecting_documents');

        return result;
      } finally {
        setIsDiscovering(false);
      }
    },
    enabled: false,
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
    return selectedDocuments.some(doc => doc.id === documentId);
  };

  useEffect(() => {
    const runInitialSearch = async () => {
      if (
        autoSearch &&
        searchQuery.trim() !== '' &&
        selectedSources.length > 0
      ) {
        await refetch();
      }
    };

    runInitialSearch();
  }, [autoSearch, searchQuery, selectedSources, refetch]);

  useEffect(() => {
    if (documentResults?.documents && documentResults.documents.length > 0) {
      setStatus('selecting_documents');
    } else if (!isLoading && !isDiscovering && searchQuery && documentResults) {
      setStatus('error');
    }
  }, [documentResults, isLoading, isDiscovering, searchQuery, setStatus]);

  useEffect(() => {
    if (
      onDocumentTabsVisible &&
      showSourceTabs &&
      documentResults?.documents &&
      documentResults.documents.length > 0
    ) {
      onDocumentTabsVisible(true);
    } else if (onDocumentTabsVisible) {
      onDocumentTabsVisible(false);
    }
  }, [documentResults, showSourceTabs, onDocumentTabsVisible]);

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

    if (
      !documentResults ||
      !documentResults.documents ||
      documentResults.documents.length === 0
    ) {
      return searchQuery && !isLoading && !isDiscovering ? (
        <EmptyState>
          No relevant documents found for this question. Try refining your
          question or selecting different sources.
        </EmptyState>
      ) : null;
    }

    if (showSourceTabs && documentResults.documents.length > 0) {
      if (onDocumentTabsVisible) {
        onDocumentTabsVisible(true);
      }

      const docsBySource: Record<string, Document[]> = {};

      docsBySource['all'] = documentResults.documents;

      documentResults.documents.forEach(doc => {
        const sourceId = doc.source?.id || 'unknown';

        if (!docsBySource[sourceId]) {
          docsBySource[sourceId] = [];
        }

        docsBySource[sourceId].push(doc);
      });

      const tabs = [
        { id: 'all', label: 'All Documents' },
        ...Object.keys(docsBySource)
          .filter(id => id !== 'all' && id !== 'unknown')
          .map(id => {
            const sourceName =
              documentResults.documents.find(doc => doc.source?.id === id)
                ?.source?.name || id;
            return { id, label: sourceName };
          }),
      ];

      if (docsBySource['unknown']?.length > 0) {
        tabs.push({ id: 'unknown', label: 'Unknown Source' });
      }

      const renderTabContent = (sourceId: string) => {
        const docsToShow = docsBySource[sourceId] || [];

        return (
          <DocumentList>
            {docsToShow.map(document => (
              <SelectableDocumentCardComponent
                key={document.id}
                document={document}
                selected={isDocumentSelected(document.id)}
                onClick={() => handleSelectDocument(document)}
              />
            ))}
          </DocumentList>
        );
      };

      return (
        <ResultsContainer>
          <SectionTitle>Discovered Documents</SectionTitle>
          <SectionDescription>
            The following documents were found to be relevant to your question:
          </SectionDescription>

          <div className="source-tabs">
            <div className="tab-buttons">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeSourceTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveSourceTab(tab.id)}
                  style={{
                    padding: '8px 16px',
                    margin: '0 4px 0 0',
                    borderRadius: '4px 4px 0 0',
                    border: '1px solid #ddd',
                    borderBottom:
                      activeSourceTab === tab.id
                        ? '1px solid white'
                        : '1px solid #ddd',
                    background:
                      activeSourceTab === tab.id ? 'white' : '#f5f5f5',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label} ({docsBySource[tab.id]?.length || 0})
                </button>
              ))}
            </div>
            <div
              className="tab-content"
              style={{
                padding: '16px',
                border: '1px solid #ddd',
                borderTop: 'none',
              }}
            >
              {renderTabContent(activeSourceTab)}
            </div>
          </div>
        </ResultsContainer>
      );
    }

    return (
      <ResultsContainer>
        <SectionTitle>Discovered Documents</SectionTitle>
        <SectionDescription>
          The following documents were found to be relevant to your question:
        </SectionDescription>
        <DocumentList>
          {documentResults.documents.map(document => (
            <SelectableDocumentCardComponent
              key={document.id}
              document={document}
              selected={isDocumentSelected(document.id)}
              onClick={() => handleSelectDocument(document)}
            />
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

      {!hideSearchButton && (
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
      )}

      {renderDocumentResults()}
    </DiscoveryContainer>
  );
};

export default DocumentDiscovery;
