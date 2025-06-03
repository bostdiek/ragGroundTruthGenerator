# Debug Tools

This directory contains diagnostic and debugging tools for the AI Ground Truth Generator backend.

## Available Tools

### `debug_qa_pairs.py`

Tests QA pair retrieval and updating directly with the memory database. Use this to diagnose issues with QA pair endpoints.

### `debug_collections_routing.py`

Tests collection retrieval and filtering directly with the memory database. Use this to diagnose issues with collection endpoints.

### `debug_auth.py`

Tests authentication functionality. Use this to diagnose login issues and credential verification.

### `debug_app.py`

Tests the application startup and basic configuration. Use this to diagnose application initialization issues.

## Usage

Run these scripts directly from the backend directory:

```bash
cd backend
uv run python debug_tools/debug_qa_pairs.py
```

## Common Issues and Fixes

1. **Collection listing shows 0 QA pairs**: Fixed by implementing manual filtering in collection endpoints.
2. **Authentication issues with simple usernames**: Fixed by adding support for non-email usernames in `simple_auth.py`.
3. **QA pair details not loading**: Fixed by implementing manual filtering in QA pair endpoints.

## Note

These tools are for development and debugging purposes only. They should not be used in production.
