import React from 'react';

import { Document } from '../../../types';

interface DocumentSelectorProps {
  documents: Document[];
  selectedDocuments: Document[];
  onSelectDocument: (document: Document) => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Component for displaying and selecting documents
 */
const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  documents,
  selectedDocuments,
  onSelectDocument,
  isLoading = false,
  error = null,
}) => {
  // Check if a document is selected
  const isSelected = (document: Document) => {
    return selectedDocuments.some(doc => doc.id === document.id);
  };

  if (isLoading) {
    return <div className="loading">Loading documents...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!documents.length) {
    return <div className="no-results">No documents found</div>;
  }

  return (
    <div className="document-selector">
      <h3>Available Documents</h3>
      <div className="document-list">
        {documents.map(document => (
          <div
            key={document.id}
            className={`document-item ${isSelected(document) ? 'selected' : ''}`}
            onClick={() => onSelectDocument(document)}
          >
            <div className="document-checkbox">
              {isSelected(document) && <span>✓</span>}
            </div>
            <div className="document-info">
              <div className="document-title">{document.title}</div>
              <div className="document-source">
                {document.source?.name || 'Unknown source'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentSelector;
