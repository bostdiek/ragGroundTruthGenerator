# Backend Architecture

This document provides a detailed overview of the AI Ground Truth Generator backend architecture, with a specific focus on the data storage, retrieval, and answer generation components.

## High-Level Architecture

The backend follows a modular, provider-based architecture that enables flexible customization and extension of various components.

```mermaid
graph TB
    Client[Frontend Client] <--> API[FastAPI API Layer]
    
    subgraph "API Endpoints"
        API --> AuthRouter[Auth Router]
        API --> CollectionsRouter[Collections Router]
        API --> RetrievalRouter[Retrieval Router] 
        API --> GenerationRouter[Generation Router]
    end
    
    subgraph "Core Provider Interfaces"
        AuthRouter --> AuthProvider[Auth Provider Interface]
        CollectionsRouter --> DBProvider[Database Provider Interface]
        RetrievalRouter --> DataSourceProvider[Data Source Provider Interface]
        GenerationRouter --> GeneratorProvider[Generator Provider Interface]
    end
    
    subgraph "Database Layer"
        DBProvider --> Collections[(Collections)]
        DBProvider --> QAPairs[(QA Pairs)]
        DBProvider --> Users[(Users)]
    end
    
    subgraph "Retrieval Layer"
        DataSourceProvider --> DocumentSources[(Document Sources)]
        DataSourceProvider --> SearchIndex[(Search Index)]
    end
    
    subgraph "Generation Layer"
        GeneratorProvider --> LLM[LLM Service]
        GeneratorProvider --> PromptTemplates[(Prompt Templates)]
    end
    
    subgraph "Security Layer"
        AuthProvider --> Authentication[Authentication]
        AuthProvider --> Authorization[Authorization]
        AuthProvider --> RBAC[Role-Based Access Control]
    end
```

## Data Flow

The following diagram illustrates the data flow through the system when generating and storing QA pairs:

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant DB as Database Provider
    participant Retrieval as Retrieval Provider
    participant Generation as Generation Provider
    participant LLM as LLM Service
    
    User->>Frontend: Create Collection
    Frontend->>Backend: POST /collections
    Backend->>DB: Create Collection
    DB-->>Backend: Collection Created
    Backend-->>Frontend: Collection Details
    Frontend-->>User: Collection Created UI
    
    User->>Frontend: Search for Documents
    Frontend->>Backend: GET /retrieval/search
    Backend->>Retrieval: Retrieve Documents
    Retrieval-->>Backend: Relevant Documents
    Backend-->>Frontend: Document List
    Frontend-->>User: Display Documents
    
    User->>Frontend: Select Documents & Generate Answer
    Frontend->>Backend: POST /generation/answer
    Backend->>Generation: Generate Answer
    Generation->>Retrieval: Get Document Content
    Retrieval-->>Generation: Document Content
    Generation->>LLM: Send Prompt with Context
    LLM-->>Generation: Generated Answer
    Generation-->>Backend: Formatted Answer
    Backend-->>Frontend: Answer with Sources
    Frontend-->>User: Display Answer
    
    User->>Frontend: Edit & Save QA Pair
    Frontend->>Backend: POST /collections/{id}/qa-pairs
    Backend->>DB: Save QA Pair
    DB-->>Backend: QA Pair Created
    Backend-->>Frontend: QA Pair Details
    Frontend-->>User: QA Pair Saved UI
    
    actor Approver
    Approver->>Frontend: Review QA Pair
    Frontend->>Backend: GET /collections/{id}/qa-pairs/{qa_id}
    Backend->>DB: Get QA Pair
    DB-->>Backend: QA Pair Data
    Backend-->>Frontend: QA Pair Details
    Frontend-->>Approver: Display QA Pair
    
    Approver->>Frontend: Approve/Reject/Request Revision
    Frontend->>Backend: PUT /collections/{id}/qa-pairs/{qa_id}
    Backend->>DB: Update QA Pair Status
    DB-->>Backend: QA Pair Updated
    Backend-->>Frontend: Updated Status
    Frontend-->>Approver: Status Updated UI
```

## Data Models

### Core Data Models

The system uses three primary data models:

```mermaid
erDiagram
    Collection ||--o{ QAPair : contains
    Collection {
        string id
        string name
        string description
        string type
        array tags
        int document_count
        datetime created_at
        datetime updated_at
        json metadata
    }
    
    QAPair ||--o{ Document : references
    QAPair {
        string id
        string collection_id
        string question
        string answer
        array documents
        string status
        json metadata
        datetime created_at
        datetime updated_at
        string created_by
    }
    
    Document {
        string id
        string title
        string content
        json source
        string url
        json metadata
        datetime created_at
        datetime updated_at
    }
    
    User ||--o{ QAPair : creates
    User {
        string id
        string username
        string email
        array roles
        datetime created_at
        datetime last_login
    }
```

### QA Pair Statuses

QA pairs go through a workflow with the following statuses:

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> ReadyForReview: Submit
    ReadyForReview --> Approved: Approve
    ReadyForReview --> RevisionRequested: Request Revision
    ReadyForReview --> Rejected: Reject
    RevisionRequested --> ReadyForReview: Resubmit
    Approved --> [*]
    Rejected --> [*]
```

## Provider Interfaces

### Database Provider

The Database Provider is responsible for storing and retrieving collections and QA pairs.

```mermaid
classDiagram
    class BaseDatabase {
        <<interface>>
        +list_collections() List~Dict~
        +get_collection(id) Dict
        +create_collection(data) Dict
        +update_collection(id, data) Dict
        +delete_collection(id) None
        +list_qa_pairs(collection_id, filters) List~Dict~
        +get_qa_pair(id) Dict
        +create_qa_pair(data) Dict
        +update_qa_pair(id, data) Dict
        +delete_qa_pair(id) None
    }
    
    BaseDatabase <|-- MemoryDatabase
    BaseDatabase <|-- MongoDBDatabase
    BaseDatabase <|-- CosmosDBDatabase
    BaseDatabase <|-- SQLDatabase
    
    class MemoryDatabase {
        -collections Dict~Dict~
        -qa_pairs Dict~Dict~
        +list_collections() List~Dict~
        +get_collection(id) Dict
        +create_collection(data) Dict
        +update_collection(id, data) Dict
        +delete_collection(id) None
        +list_qa_pairs(collection_id, filters) List~Dict~
        +get_qa_pair(id) Dict
        +create_qa_pair(data) Dict
        +update_qa_pair(id, data) Dict
        +delete_qa_pair(id) None
    }
```

### Data Source Provider

The Data Source Provider is responsible for retrieving documents from various sources.

```mermaid
classDiagram
    class BaseDataSourceProvider {
        <<interface>>
        +get_name() str
        +get_description() str
        +get_id() str
        +retrieve_documents(query, filters, limit) List~Dict~
        +get_document(id) Dict
    }
    
    BaseDataSourceProvider <|-- MemoryDataSourceProvider
    BaseDataSourceProvider <|-- AzureAISearchProvider
    BaseDataSourceProvider <|-- ElasticsearchProvider
    BaseDataSourceProvider <|-- FileSystemProvider
    
    class MemoryDataSourceProvider {
        -documents List~Dict~
        +get_name() str
        +get_description() str
        +get_id() str
        +retrieve_documents(query, filters, limit) List~Dict~
        +get_document(id) Dict
    }
```

### Generator Provider

The Generator Provider is responsible for generating answers from documents.

```mermaid
classDiagram
    class BaseGeneratorProvider {
        <<interface>>
        +get_name() str
        +get_description() str
        +get_id() str
        +generate_answer(question, documents, template) Dict
    }
    
    BaseGeneratorProvider <|-- DemoGeneratorProvider
    BaseGeneratorProvider <|-- AzureOpenAIProvider
    BaseGeneratorProvider <|-- OpenAIProvider
    BaseGeneratorProvider <|-- CustomLLMProvider
    
    class DemoGeneratorProvider {
        +get_name() str
        +get_description() str
        +get_id() str
        +generate_answer(question, documents, template) Dict
    }
```

## Role-Based Access Control

The system supports role-based access control (RBAC) for controlling access to resources:

```mermaid
graph TB
    subgraph "User Roles"
        Viewer["Viewer (Read-Only)"]
        Editor["Editor (Create/Edit)"]
        Approver["Approver (Review/Approve)"]
        Admin["Administrator (Full Access)"]
    end
    
    subgraph "Role Permissions"
        ViewPermissions["View Collections & QA Pairs"]
        CreatePermissions["Create/Edit QA Pairs"]
        ReviewPermissions["Review/Approve/Reject QA Pairs"]
        AdminPermissions["Manage Users & Settings"]
    end
    
    Viewer --> ViewPermissions
    Editor --> ViewPermissions
    Editor --> CreatePermissions
    Approver --> ViewPermissions
    Approver --> CreatePermissions
    Approver --> ReviewPermissions
    Admin --> ViewPermissions
    Admin --> CreatePermissions
    Admin --> ReviewPermissions
    Admin --> AdminPermissions
```

## Learning and Feedback Loop

The system incorporates a feedback loop for continuous improvement:

```mermaid
graph LR
    Creation["QA Pair Creation"] --> Review["SME Review"]
    Review --> Approval["Approval/Rejection"]
    Approval --> Feedback["Feedback & Revision"]
    Feedback --> LearningRules["Learning Rules"]
    LearningRules --> ImprovedPrompts["Improved Prompts"]
    ImprovedPrompts --> Creation
```

## Extension Points

The system is designed to be extended in several ways:

1. **Custom Database Providers**: Integrate with different database systems
2. **Custom Data Source Providers**: Connect to various document sources and search engines
3. **Custom Generator Providers**: Integrate with different LLM services
4. **Custom Auth Providers**: Implement different authentication and authorization mechanisms

## Next Steps for Implementation

For a production-ready implementation, consider:

1. **Persistent Database**: Implement a database provider using MongoDB, CosmosDB, or SQL
2. **Vector Search**: Implement a data source provider with vector-based search capabilities
3. **Production LLM Integration**: Integrate with Azure OpenAI or another production LLM service
4. **Advanced Authentication**: Implement Azure AD or OAuth-based authentication
5. **Comprehensive Logging**: Add detailed logging for audit and debugging purposes
