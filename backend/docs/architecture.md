# AI Ground Truth Generator - Backend Architecture

This document provides a high-level overview of the AI Ground Truth Generator backend architecture, explaining the key components, their relationships, and extension points.

## System Overview

The AI Ground Truth Generator is designed to help teams create, manage, and maintain high-quality question-answer pairs for AI training. The system follows a modular architecture with clearly defined interfaces, allowing teams to customize and extend various components based on their specific requirements.

```mermaid
flowchart TB
    Client[Frontend Client] <--> API[FastAPI Endpoints]
    
    subgraph "Core Components"
        API --> Auth[Authentication]
        API --> Collections[Collections Management]
        API --> Retrieval[Document Retrieval]
        API --> Generation[Answer Generation]
    end
    
    subgraph "Provider Interfaces"
        Auth --> AuthProvider[Auth Provider]
        Collections --> DatabaseProvider[Database Provider]
        Retrieval --> DataSourceProvider[Data Source Provider]
        Generation --> GeneratorProvider[Generator Provider]
    end
    
    subgraph "Default Implementations"
        AuthProvider --> SimpleAuth[Simple Auth]
        DatabaseProvider --> MemoryDB[Memory Database]
        DataSourceProvider --> MemoryDataSource[Memory Data Source]
        GeneratorProvider --> DemoGenerator[Demo Generator]
    end
    
    subgraph "Extensible Implementations"
        AuthProvider --> CustomAuth[Custom Auth Provider]
        DatabaseProvider --> CustomDB[Custom Database]
        DataSourceProvider --> CustomDataSource[Custom Data Source]
        GeneratorProvider --> CustomGenerator[Custom Generator]
        
        CustomAuth -.-> AD[Azure AD]
        CustomAuth -.-> OAuth[OAuth]
        
        CustomDB -.-> MongoDB[MongoDB]
        CustomDB -.-> CosmosDB[CosmosDB]
        CustomDB -.-> SQL[SQL Database]
        
        CustomDataSource -.-> AzureSearch[Azure Search]
        CustomDataSource -.-> Elasticsearch[Elasticsearch]
        CustomDataSource -.-> AzureAISearch[Azure AI Search]
        
        CustomGenerator -.-> AzureOpenAI[Azure OpenAI]
        CustomGenerator -.-> OpenAI[OpenAI]
        CustomGenerator -.-> CustomLLM[Custom LLM]
    end
```

## Key Components

### API Layer (FastAPI)

The API layer provides RESTful endpoints for interacting with the system. These endpoints are organized into routers based on functionality:

- **Auth Router**: Handles user authentication and authorization
- **Collections Router**: Manages collections and QA pairs
- **Retrieval Router**: Provides document retrieval capabilities
- **Generation Router**: Handles answer generation

### Provider Interfaces

The system uses a provider pattern to allow for extensible implementations:

- **Auth Provider**: Interface for authentication and authorization
- **Database Provider**: Interface for data storage and retrieval
- **Data Source Provider**: Interface for document retrieval
- **Generator Provider**: Interface for answer generation

### Factory System

A factory system is used to instantiate the appropriate provider implementations based on configuration:

```mermaid
flowchart LR
    Config[Environment Configuration] --> Factory[Provider Factory]
    Factory --> AuthProvider[Auth Provider]
    Factory --> DatabaseProvider[Database Provider]
    Factory --> DataSourceProvider[Data Source Provider]
    Factory --> GeneratorProvider[Generator Provider]
```

## Data Model

The core data model revolves around Collections and QA Pairs:

```mermaid
erDiagram
    Collection ||--o{ QAPair : contains
    Collection {
        string id
        string name
        string description
        string type
        datetime created_at
        datetime updated_at
        int qa_pair_count
        json metadata
    }
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
    QAPair ||--o{ Document : references
    Document {
        string id
        string title
        string content
        json source
        string url
        json metadata
    }
```

## Extension Points

The system is designed to be extended in several ways:

1. **Custom Database Provider**: Replace the memory database with a persistent database
2. **Custom Data Source Provider**: Implement custom document retrieval logic
3. **Custom Generator Provider**: Integrate with LLM services for answer generation
4. **Custom Auth Provider**: Implement robust authentication and authorization

## RBAC and Security

The system supports role-based access control through the authentication provider:

```mermaid
flowchart TB
    User[User] --> Token[Authentication Token]
    Token --> Roles[User Roles]
    
    subgraph "Role-Based Permissions"
        Roles --> Viewer[Viewer]
        Roles --> Editor[Editor]
        Roles --> Approver[Approver]
        Roles --> Admin[Admin]
        
        Viewer --> ReadCollections[Read Collections]
        Viewer --> ReadQAPairs[Read QA Pairs]
        
        Editor --> ViewerPerms[Viewer Permissions]
        Editor --> CreateQAPairs[Create QA Pairs]
        Editor --> EditQAPairs[Edit QA Pairs]
        
        Approver --> EditorPerms[Editor Permissions]
        Approver --> ApproveQAPairs[Approve QA Pairs]
        Approver --> RejectQAPairs[Reject QA Pairs]
        
        Admin --> ApproverPerms[Approver Permissions]
        Admin --> ManageUsers[Manage Users]
        Admin --> ManageSettings[Manage Settings]
    end
```

## Workflow

The typical workflow for QA pair creation and management:

```mermaid
sequenceDiagram
    actor User
    participant Collections
    participant Retrieval
    participant Generation
    participant Database
    
    User->>Collections: Create Collection
    Collections->>Database: Store Collection
    
    User->>Retrieval: Search Documents
    Retrieval-->>User: Return Relevant Documents
    
    User->>Generation: Generate Answer
    Generation-->>User: Return Generated Answer
    
    User->>Collections: Create QA Pair
    Collections->>Database: Store QA Pair
    
    actor Approver
    Approver->>Collections: Review QA Pair
    Approver->>Collections: Approve/Reject/Request Revision
    Collections->>Database: Update QA Pair Status
```

## Technology Stack

- **Framework**: FastAPI
- **Default Database**: In-memory (for development)
- **Authentication**: Simple JWT (for development)
- **Document Retrieval**: In-memory (for development)
- **Answer Generation**: Demo generator (for development)

## Configuration

The system is configured using environment variables:

- `DATABASE_PROVIDER`: The database provider to use (default: "memory")
- `AUTH_PROVIDER`: The authentication provider to use (default: "simple")
- `RETRIEVAL_PROVIDER`: The retrieval provider to use (default: "template")
- `GENERATION_PROVIDER`: The generation provider to use (default: "demo")
- `ENABLED_DATA_SOURCES`: Comma-separated list of enabled data sources (default: "memory")

## Next Steps

For implementing a production system, consider:

1. Implementing a persistent database provider
2. Integrating with a robust authentication system
3. Implementing vector-based document retrieval
4. Integrating with production-ready LLM services
