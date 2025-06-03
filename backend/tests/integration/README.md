# Integration Tests

This directory contains integration and manual tests for the AI Ground Truth Generator backend.

These tests are meant to be run manually against a running server instance or start their own server instance. They are not part of the automated test suite run by pytest.

## Test Files

- `test_auth_credentials.py`: Tests authentication with different usernames and passwords
- `test_qa_pair_endpoints.py`: Tests the QA pair HTTP endpoints (get_qa_pair and update_qa_pair)
- `test_router.py`: Tests the router endpoints against a running server
- `test_router_enhanced.py`: Tests the router endpoints with the database provider

## Running the Tests

To run these tests, make sure the server is running (unless the test starts its own server instance) and execute the desired test script:

```bash
cd /path/to/backend
python -m tests.integration.test_auth_credentials
```

Or for tests that require the PYTHONPATH to include the backend directory:

```bash
cd /path/to/backend
PYTHONPATH=. python tests/integration/test_auth_credentials.py
```
