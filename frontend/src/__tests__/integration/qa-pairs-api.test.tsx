import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { useQAPairs } from '../../features/qa_pairs/hooks/useQAPairs';
import { ReactQueryProvider } from '../../lib/react-query/ReactQueryProvider';
import { mockQAPairs } from '../../testing/mocks/qa-pairs-handlers';
import { server } from '../../testing/setup';
import { render } from '../../testing/utils/test-utils';

// Test component that uses the QA pairs hook
function TestComponent({ collectionId }: { collectionId: string }) {
  const { data, isLoading, isError, error } = useQAPairs(collectionId);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>QA Pairs</h1>
      <ul>
        {data.map(qaPair => (
          <li key={qaPair.id} data-testid={`qa-pair-${qaPair.id}`}>
            <h2>{qaPair.question}</h2>
            <p>{qaPair.answer}</p>
            <p>Status: {qaPair.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('QA Pairs API Integration', () => {
  it('should fetch and display QA pairs for a collection', async () => {
    // Render the test component with a collection ID
    render(
      <ReactQueryProvider>
        <TestComponent collectionId="collection-1" />
      </ReactQueryProvider>
    );

    // Initially should show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('QA Pairs')).toBeInTheDocument();
    });

    // Check that the QA pairs are displayed
    for (const qaPair of mockQAPairs) {
      if (qaPair.collection_id === 'collection-1') {
        const element = screen.getByTestId(`qa-pair-${qaPair.id}`);
        expect(element).toBeInTheDocument();
        expect(screen.getByText(qaPair.question)).toBeInTheDocument();
        expect(screen.getByText(qaPair.answer)).toBeInTheDocument();
        expect(
          screen.getByText(`Status: ${qaPair.status}`)
        ).toBeInTheDocument();
      }
    }
  });

  it('should handle API errors gracefully', async () => {
    // Mock an error response
    server.use(
      http.get(
        'http://localhost:8000/collections/:collectionId/qa-pairs',
        () => {
          return new HttpResponse(
            JSON.stringify({ detail: 'Internal server error' }),
            { status: 500 }
          );
        }
      )
    );

    // Render the test component with a collection ID
    render(
      <ReactQueryProvider>
        <TestComponent collectionId="collection-1" />
      </ReactQueryProvider>
    );

    // Initially should show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should handle empty data gracefully', async () => {
    // Mock an empty response
    server.use(
      http.get(
        'http://localhost:8000/collections/:collectionId/qa-pairs',
        () => {
          return HttpResponse.json([]);
        }
      )
    );

    // Render the test component with a collection ID
    render(
      <ReactQueryProvider>
        <TestComponent collectionId="collection-1" />
      </ReactQueryProvider>
    );

    // Initially should show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('QA Pairs')).toBeInTheDocument();
    });

    // Should not show any QA pairs
    expect(screen.queryByTestId(/qa-pair-/)).not.toBeInTheDocument();
  });

  it('should not fetch data if collectionId is not provided', async () => {
    // Render the test component without a collection ID
    render(
      <ReactQueryProvider>
        <TestComponent collectionId="" />
      </ReactQueryProvider>
    );

    // Should show no data message immediately (no loading state)
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});
