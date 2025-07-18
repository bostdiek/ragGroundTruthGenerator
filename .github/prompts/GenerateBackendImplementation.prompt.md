# Generate AI Ground Truth Generator Backend

Generate a complete backend implementation for the AI Ground Truth Generator using my preferred technology stack.
There is a template FastAPI Python backend, but I want to translate this to another framework.
It needs to be plug and play with the current frontend, so the endpoints must be the same.

## Interactive Setup

Please start by asking me about my preferences one at a time.
After each answer, use a search tool to find the most up-to-date information about that choice to inform the next.

2. **Programming Language**: Which language? (TypeScript, C#, Java, Go, Python, Ruby, etc.)
1. **Backend Framework**: What framework would you like to use? (Express.js, .NET Core, Spring Boot, Go/Gin, Django, Rails, etc.)
3. **Database**: What database setup? (PostgreSQL, MongoDB, SQLite for demo, etc.)
4. **Authentication**: Preferred auth approach? (JWT, OAuth, framework built-in, etc.)
5. **Testing Framework**: What for testing? (Jest, xUnit, JUnit, pytest, etc.)
6. **Additional Requirements**: Any specific libraries, patterns, or constraints?

## Architecture Reference

Use this architecture from the reference FastAPI implementation:

### Required API Endpoints

Reference: [Backend API docs](../../docs/backendAPIs.md)

```
Authentication (/auth):
- POST /auth/login, /auth/register, GET /auth/me, /auth/providers

Collections (/collections):  
- GET /collections, POST /collections, GET/PUT/DELETE /collections/{id}

QA Pairs (/collections):
- GET /collections/{id}/qa-pairs, POST /collections/{id}/qa-pairs
- GET/PATCH /collections/qa-pairs/{id}, PATCH /collections/qa-pairs/{id}/raw

Document Retrieval (/retrieval):
- POST /retrieval/search, GET /retrieval/search, GET /retrieval/data_sources

Answer Generation (/generation):
- POST /generation/answer

Health: GET /health
```

### Provider Pattern Architecture

Reference: [Backend Architecture](../../docs/backendArchitecture.md)

Implement four provider types with base interfaces:

1. **AuthProvider** - User authentication, registration, JWT tokens
2. **DatabaseProvider** - Collections and QA pairs storage
3. **DataSourceProvider** - Document retrieval and search  
4. **GenerationProvider** - AI answer generation

### Factory Pattern

Environment-based provider instantiation:
- `AUTH_PROVIDER` (default: "demo")
- `DATABASE_PROVIDER` (default: "memory")
- `DATA_SOURCE_PROVIDER` (default: "memory") 
- `GENERATION_PROVIDER` (default: "demo")

## Implementation Requirements

### Demo Implementations (Must Include)

- **Demo Auth**: In-memory users, credentials: `demo` / `password`
- **Demo Database**: In-memory storage with sample collections and QA pairs
- **Demo Data Source**: Pre-loaded AI/ML documents
- **Demo Generation**: Template responses simulating AI answers

### Sample Data

Include working demo data:
- 2-3 sample collections with different statuses
- 5-10 QA pairs across various states (ready_for_review, approved, etc.)
- 10-15 sample documents about AI/ML topics
- Demo user account for immediate testing

### Technical Requirements

- CORS support for frontend integration
- JWT-based authentication middleware
- Request/response validation
- Proper HTTP status codes and error handling
- Health check endpoint
- Environment-based configuration
- Comprehensive logging

### Testing

Provide unit tests covering:
- All API endpoints (success and error cases)
- Provider interface implementations
- Authentication middleware
- Data validation

## Step-by-Step Implementation

After gathering my preferences, provide:

1. **Project Setup**: Initialization commands, folder structure
2. **Dependencies**: Package installation with rationale
3. **Configuration**: Environment setup and configuration files
4. **Base Implementation**: Core app setup, middleware, routing
5. **Provider Interfaces**: Base interfaces for all four provider types
6. **Demo Providers**: Working in-memory implementations
7. **API Routes**: All endpoint implementations
8. **Sample Data**: Demo data setup and loading
9. **Testing Setup**: Test framework configuration and sample tests
10. **Documentation**: API documentation and setup instructions

## Success Criteria

The generated backend should:
- Run locally with a single command
- Be accessible at `http://localhost:8000`
- Work immediately with demo credentials: `demo` / `password`
- Be compatible with the existing React frontend
- Include comprehensive tests
- Follow the framework's best practices
- Be ready for production extension

Begin by asking about my technology preferences.
Then, make a `.github/copilot-instructions.md` file following #fetch https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot#enabling-and-using-prompt-files to add best practice standards within the repository using context7 for documentation lookup and sequential thinking tool.
Then create a hierarchical step-by-step work plan with check boxes called `backend_development_plan.md`.
This plan should contain all of the routes, endpoints, the factory, etc.

After creating that, iterate step by step through.
Use the Sequential Thinking Tool to help with this.
You always look up the latest documentation for the given framework, as you were trained in the past and to not know the most up to date best practices use Context7.
When each step is complete, come back to the plan and check off the task.

