# Backend API Reference

This document provides comprehensive documentation for all API endpoints in the AI Ground Truth Generator backend. The API is built with FastAPI and follows RESTful conventions.

---

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Authentication Endpoints](#authentication-endpoints)
- [Collection Management](#collection-management)
- [QA Pair Management](#qa-pair-management)
- [Document Retrieval](#document-retrieval)
- [Answer Generation](#answer-generation)
- [Error Responses](#error-responses)
- [Data Models](#data-models)

---

## Base URL

```txt
http://localhost:8000
```

All endpoints are prefixed with their respective module:

- Authentication: `/auth`
- Collections: `/collections`
- Retrieval: `/retrieval`
- Generation: `/generation`

---

## Authentication

Most endpoints require authentication via Bearer token. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

Demo credentials (for development only):

- Username: `demo` or `demo@example.com`
- Password: `password`

---

## Authentication Endpoints

### POST /auth/login

Authenticate a user and receive an access token.

**Request Body:**

```json
{
  "username": "demo",
  "password": "password"
}
```

**Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user_1",
    "username": "Demo User",
    "email": "demo@example.com",
    "full_name": "Demo User"
  }
}
```

### POST /auth/register

Register a new user.

**Request Body:**

```json
{
  "username": "newuser",
  "password": "newpassword",
  "email": "newuser@example.com",
  "full_name": "New User"
}
```

**Response:**

```json
{
  "id": "user_123",
  "username": "newuser",
  "email": "newuser@example.com",
  "full_name": "New User"
}
```

### GET /auth/me

Get the current authenticated user's information.

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "user_1",
  "username": "Demo User",
  "email": "demo@example.com",
  "full_name": "Demo User"
}
```

### GET /auth/providers

Get information about available authentication providers.

**Response:**

```json
{
  "current": "simple",
  "available": ["simple"]
}
```

---

## Collection Management

### GET /collections

Get a list of all collections with QA pair statistics.

**Response:**

```json
[
  {
    "id": "collection_1",
    "name": "Sample Collection",
    "description": "A sample collection for demonstration",
    "tags": ["demo", "sample"],
    "metadata": {},
    "document_count": 5,
    "status_counts": {
      "ready_for_review": 2,
      "approved": 1,
      "revision_requested": 1,
      "rejected": 1
    },
    "created_at": "2025-06-09T10:00:00Z",
    "updated_at": "2025-06-09T10:30:00Z"
  }
]
```

### POST /collections

Create a new collection.

**Request Body:**

```json
{
  "name": "My New Collection",
  "description": "Description of the collection",
  "tags": ["tag1", "tag2"],
  "metadata": {
    "key": "value"
  }
}
```

**Response:** `201 Created`

```json
{
  "id": "collection_123",
  "name": "My New Collection",
  "description": "Description of the collection",
  "tags": ["tag1", "tag2"],
  "metadata": {
    "key": "value"
  },
  "document_count": 0,
  "status_counts": {},
  "created_at": "2025-06-09T10:00:00Z",
  "updated_at": "2025-06-09T10:00:00Z"
}
```

### GET /collections/{collection_id}

Get a specific collection by ID.

**Response:**

```json
{
  "id": "collection_123",
  "name": "My Collection",
  "description": "Collection description",
  "tags": ["tag1"],
  "metadata": {},
  "document_count": 3,
  "status_counts": {
    "ready_for_review": 2,
    "approved": 1
  },
  "created_at": "2025-06-09T10:00:00Z",
  "updated_at": "2025-06-09T10:30:00Z"
}
```

### PUT /collections/{collection_id}

Update a collection.

**Request Body:**

```json
{
  "name": "Updated Collection Name",
  "description": "Updated description",
  "tags": ["updated", "tags"],
  "metadata": {
    "updated": "value"
  }
}
```

**Response:**

```json
{
  "id": "collection_123",
  "name": "Updated Collection Name",
  "description": "Updated description",
  "tags": ["updated", "tags"],
  "metadata": {
    "updated": "value"
  },
  "document_count": 3,
  "status_counts": {
    "ready_for_review": 2,
    "approved": 1
  },
  "created_at": "2025-06-09T10:00:00Z",
  "updated_at": "2025-06-09T11:00:00Z"
}
```

### DELETE /collections/{collection_id}

Delete a collection.

**Response:** `204 No Content`

---

## QA Pair Management

### GET /collections/{collection_id}/qa-pairs

Get all QA pairs in a collection.

**Response:**

```json
[
  {
    "id": "qa_pair_1",
    "collection_id": "collection_123",
    "question": "What is artificial intelligence?",
    "answer": "Artificial intelligence (AI) is...",
    "documents": [
      {
        "id": "doc_1",
        "title": "AI Overview",
        "content": "AI is a field of computer science...",
        "source": {
          "id": "memory",
          "name": "Memory Store"
        }
      }
    ],
    "status": "ready_for_review",
    "metadata": {},
    "created_at": "2025-06-09T10:00:00Z",
    "updated_at": "2025-06-09T10:00:00Z",
    "created_by": "demo_user"
  }
]
```

### POST /collections/{collection_id}/qa-pairs

Create a new QA pair in a collection.

**Request Body:**

```json
{
  "question": "What is machine learning?",
  "answer": "Machine learning is a subset of AI...",
  "documents": [
    {
      "id": "doc_2",
      "title": "ML Basics",
      "content": "Machine learning involves...",
      "source": {
        "id": "memory",
        "name": "Memory Store"
      }
    }
  ],
  "status": "ready_for_review",
  "metadata": {
    "difficulty": "beginner"
  }
}
```

**Response:** `201 Created`

```json
{
  "id": "qa_pair_456",
  "collection_id": "collection_123",
  "question": "What is machine learning?",
  "answer": "Machine learning is a subset of AI...",
  "documents": [...],
  "status": "ready_for_review",
  "metadata": {
    "difficulty": "beginner"
  },
  "created_at": "2025-06-09T10:00:00Z",
  "updated_at": "2025-06-09T10:00:00Z",
  "created_by": "demo_user"
}
```

### GET /collections/qa-pairs/{qa_pair_id}

Get a specific QA pair by ID.

**Response:**

```json
{
  "id": "qa_pair_456",
  "collection_id": "collection_123",
  "question": "What is machine learning?",
  "answer": "Machine learning is a subset of AI...",
  "documents": [...],
  "status": "ready_for_review",
  "metadata": {},
  "created_at": "2025-06-09T10:00:00Z",
  "updated_at": "2025-06-09T10:00:00Z",
  "created_by": "demo_user"
}
```

### PATCH /collections/qa-pairs/{qa_pair_id}

Update a QA pair (partial update).

**Request Body:**

```json
{
  "status": "approved",
  "answer": "Updated answer text...",
  "metadata": {
    "reviewer": "expert_user",
    "review_date": "2025-06-09"
  }
}
```

**Response:**

```json
{
  "id": "qa_pair_456",
  "collection_id": "collection_123",
  "question": "What is machine learning?",
  "answer": "Updated answer text...",
  "documents": [...],
  "status": "approved",
  "metadata": {
    "reviewer": "expert_user",
    "review_date": "2025-06-09"
  },
  "created_at": "2025-06-09T10:00:00Z",
  "updated_at": "2025-06-09T11:00:00Z",
  "created_by": "demo_user"
}
```

### PATCH /collections/qa-pairs/{qa_pair_id}/raw

Update a QA pair with raw JSON data.

**Headers:**

```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:** Raw JSON object with any valid QA pair fields.

---

## Document Retrieval

### POST /retrieval/search

Search for documents across data sources.

**Request Body:**

```json
{
  "query": "artificial intelligence",
  "sources": ["memory"],
  "max_results": 10
}
```

**Response:**

```json
{
  "documents": [
    {
      "id": "doc_1",
      "title": "Introduction to AI",
      "content": "Artificial intelligence is the simulation...",
      "source": {
        "id": "memory",
        "name": "Memory Store",
        "type": "memory"
      },
      "url": null,
      "metadata": {},
      "relevance_score": 0.95
    }
  ],
  "totalCount": 1,
  "page": 1,
  "totalPages": 1
}
```

### GET /retrieval/search

Search for documents using query parameters (requires authentication).

**Query Parameters:**

- `query` (required): Search query string
- `provider` (optional): Data source provider ID (default: "memory")
- `limit` (optional): Maximum results (default: 5)

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "doc_1",
    "title": "AI Document",
    "content": "Content about artificial intelligence...",
    "source": {
      "id": "memory",
      "name": "Memory Store"
    },
    "url": null,
    "metadata": {},
    "relevance_score": 0.95
  }
]
```

### GET /retrieval/data_sources

Get all available data sources with pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**

```json
{
  "data": [
    {
      "id": "memory",
      "name": "Memory Store",
      "description": "In-memory document store for demonstration"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

---

## Answer Generation

### POST /generation/answer

Generate an answer based on provided documents (requires authentication).

**Headers:**

```http
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "question": "What is the main benefit of machine learning?",
  "documents": [
    {
      "id": "doc_1",
      "title": "ML Benefits",
      "content": "Machine learning allows systems to automatically improve...",
      "source": {
        "id": "memory",
        "name": "Memory Store"
      }
    }
  ],
  "custom_rules": [
    "Keep the answer concise and technical",
    "Include specific examples"
  ],
  "model": "demo-model",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**

```json
{
  "answer": "The main benefit of machine learning is its ability to automatically improve performance through experience without being explicitly programmed for each specific task.",
  "model_used": "demo-model",
  "token_usage": {
    "prompt_tokens": 250,
    "completion_tokens": 28,
    "total_tokens": 278
  }
}
```

---

## Error Responses

The API uses standard HTTP status codes and returns error details in JSON format:

### 400 Bad Request

```json
{
  "detail": "Invalid request data"
}
```

### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found

```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```

---

## Data Models

### User

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "full_name": "string | null"
}
```

### Collection

```json
{
  "id": "string",
  "name": "string",
  "description": "string | null",
  "tags": ["string"],
  "metadata": {},
  "document_count": "integer",
  "status_counts": {
    "ready_for_review": "integer",
    "approved": "integer",
    "revision_requested": "integer",
    "rejected": "integer"
  },
  "created_at": "string (ISO datetime)",
  "updated_at": "string (ISO datetime)"
}
```

### QA Pair

```json
{
  "id": "string",
  "collection_id": "string",
  "question": "string",
  "answer": "string",
  "documents": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "source": {
        "id": "string",
        "name": "string",
        "type": "string (optional)"
      },
      "url": "string | null",
      "metadata": {}
    }
  ],
  "status": "ready_for_review | approved | revision_requested | rejected",
  "metadata": {},
  "created_at": "string (ISO datetime)",
  "updated_at": "string (ISO datetime)",
  "created_by": "string"
}
```

### Document

```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "source": {
    "id": "string",
    "name": "string",
    "type": "string (optional)"
  },
  "url": "string | null",
  "metadata": {},
  "relevance_score": "number (optional)"
}
```

### Data Source

```json
{
  "id": "string",
  "name": "string",
  "description": "string"
}
```

---

## Health Check

### GET /health

Check if the API is operational.

**Response:**

```json
{
  "status": "ok",
  "message": "API is operational"
}
```

This endpoint can be used for monitoring and load balancer health checks.
