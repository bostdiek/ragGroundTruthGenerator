import React, { useState } from 'react';
import styled from 'styled-components';

// Types
interface DocumentProps {
  doc: {
    id: string;
    title: string;
    content: string;
    source: {
      id: string;
      name: string;
      type?: string;
    };
    url?: string;
    metadata?: Record<string, unknown>;
  };
}

// Styled components
const DocumentItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 1rem;
  position: relative;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease-in-out;
  margin-bottom: 1rem;
  
  &:hover {
    background-color: #f0f9ff;
    border-color: #0078d4;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
`;

const DocumentTitle = styled.h3`
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const DocumentContent = styled.p`
  color: #666;
  font-size: 0.9rem;
  white-space: pre-line;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  max-height: 120px;
  overflow-y: auto;
`;

const DocumentSource = styled.div`
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const DocumentActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
`;

const DocumentLink = styled.a`
  color: #0078d4;
  text-decoration: none;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    text-decoration: underline;
  }
`;

const InfoButton = styled.button`
  background: none;
  border: none;
  color: #0078d4;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MetadataPanel = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f9f9f9;
`;

const MetadataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  
  th, td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }
  
  th {
    font-weight: 600;
    color: #333;
    background-color: #f5f5f5;
  }
  
  td {
    color: #555;
  }
`;

const DocumentCard: React.FC<DocumentProps> = ({ doc }) => {
  const [showMetadata, setShowMetadata] = useState(false);
  
  const toggleMetadata = () => {
    setShowMetadata(!showMetadata);
  };
  
  return (
    <DocumentItem>
      <DocumentTitle>{doc.title}</DocumentTitle>
      <DocumentContent>{doc.content}</DocumentContent>
      <DocumentSource>Source: {doc.source.name}{doc.source.type && ` (${doc.source.type})`}</DocumentSource>
      
      <DocumentActions>
        {doc.url && (
          <DocumentLink href={doc.url} target="_blank" rel="noopener noreferrer">
            View Document
          </DocumentLink>
        )}
        <InfoButton onClick={toggleMetadata}>
          {showMetadata ? 'Hide Details' : 'Show Details'}
        </InfoButton>
      </DocumentActions>
      
      {showMetadata && (
        <MetadataPanel>
          <h4 style={{ marginTop: 0 }}>Document Details</h4>
          <MetadataTable>
            <tbody>
              <tr>
                <th>Title</th>
                <td>{doc.title}</td>
              </tr>
              <tr>
                <th>Source</th>
                <td>{doc.source.name}{doc.source.type && ` (${doc.source.type})`}</td>
              </tr>
              {doc.metadata && Object.entries(doc.metadata).map(([key, value]) => (
                <tr key={key}>
                  <th>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
                  <td>{value as React.ReactNode}</td>
                </tr>
              ))}
            </tbody>
          </MetadataTable>
        </MetadataPanel>
      )}
    </DocumentItem>
  );
};

export default DocumentCard;
