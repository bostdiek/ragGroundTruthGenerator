# Document Tab Search, Sort, and Filter Implementation

This implementation adds per-tab search, sorting, and filtering functionality to the Document Discovery UI as specified in Issue 3 of `june5_document_updates.md`.

## Key Features

### 1. Per-Tab State Management
- Each data source tab maintains its own search, sort, and filter state
- State is persisted in the Zustand store (`retrievalStore.ts`)
- State is preserved when switching between tabs

### 2. Dynamic Metadata-Based Filtering
- Filter dropdowns are automatically generated based on available metadata fields in documents
- Each data source can expose different metadata fields
- Supports different field types (type, topic, created_date, etc.)

### 3. Comprehensive Search
- Text search across title, content, and metadata values
- Multi-term search with space-separated keywords
- Case-insensitive search

### 4. Flexible Sorting Options
- Sort by relevance (default)
- Sort by title (alphabetical)
- Sort by date (if available in metadata)
- Sort by type (if available in metadata)
- Ascending/descending direction toggle

## Implementation Details

### Files Modified/Created

1. **`retrievalStore.ts`** - Added tab-specific filter state management
   - `tabFilters`: Record<string, TabFilterState>
   - `setTabFilter()`: Update filter state for specific tab
   - `clearTabFilter()`: Clear filter state for specific tab

2. **`documentFilters.ts`** - Utility functions for filtering and sorting
   - `searchDocuments()`: Text search functionality
   - `filterDocuments()`: Metadata-based filtering
   - `sortDocuments()`: Multi-field sorting
   - `getAvailableMetadataFields()`: Extract available fields from documents
   - `createFilterOptions()`: Generate filter dropdown options

3. **`DocumentTabControls.tsx`** - New component for per-tab controls
   - Search input for text filtering
   - Sort dropdown with direction toggle
   - Dynamic filter dropdowns based on metadata
   - Results count display
   - Reset filters functionality

4. **`DocumentDiscovery.tsx`** - Updated to integrate the new controls
   - Added DocumentTabControls to each tab
   - Added filtered documents state management
   - Wired up filtering logic with document display

### Data Flow

1. **Initialization**: When documents are loaded, `DocumentDiscovery` initializes filtered documents state
2. **User Interaction**: User interacts with controls in `DocumentTabControls`
3. **State Update**: Filter state is updated both locally and in the global store
4. **Document Processing**: Documents are filtered/sorted using utility functions
5. **Display Update**: Filtered documents are passed back to parent for display

### Tab-Specific State Structure

```typescript
interface TabFilterState {
  searchText: string;           // Search query
  sortBy: string;              // Sort field (relevance, title, date, type)
  sortDirection: 'asc' | 'desc'; // Sort direction
  metadataFilters: Record<string, string>; // Field -> value mappings
}
```

### Backend Integration

The implementation leverages the existing backend metadata structure from `memory_data_source_provider.py`:

- **type**: "manual", "specifications", "guide", "guidelines", "protocol"
- **topic**: "installation", "technical", "ai", "data annotation", "troubleshooting", "safety"
- **subtopic**: "troubleshooting", "data preparation", "machine learning"
- **created_date**: ISO date strings
- **component**: Equipment-specific fields like "air filter"
- **product**: Product model names
- **equipment_type**: "general"
- **importance**: "critical" (for safety protocols)

## Usage

1. **Search**: Type in the search box to filter documents by text content
2. **Sort**: Use the sort dropdown to change sorting criteria, click the arrow button to toggle direction
3. **Filter**: Use metadata filter dropdowns to filter by specific field values
4. **Reset**: Click "Reset Filters" to clear all filters and return to default state

## Extensibility

The implementation is designed to handle different data sources with varying metadata fields:

- **Dynamic Field Detection**: Automatically detects available metadata fields from documents
- **Flexible Filtering**: Supports any string-based metadata field
- **Configurable Sort Options**: Easy to add new sort criteria in `DocumentTabControls.tsx`

## Testing

A test suite is included in `__tests__/DocumentTabControls.test.tsx` covering:
- Component rendering
- Filter option generation
- Search functionality
- Document count display

## Future Enhancements

1. **Advanced Search**: Support for regex patterns and field-specific search
2. **Date Range Filtering**: Enhanced date filtering with range selectors
3. **Saved Filters**: Ability to save and restore filter presets
4. **Filter Persistence**: Remember filters across browser sessions
5. **Performance**: Virtualization for large document sets
