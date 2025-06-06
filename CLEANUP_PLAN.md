# AI Ground Truth Generator - Project Cleanup Plan

This document outlines the step-by-step cleanup plan for preparing the AI Ground Truth Generator project for sharing. The goal is to remove unnecessary development files while preserving the core application functionality.

## Phase 1: Remove Temporary and Backup Files
- [x] Remove `/backend/providers/database/memory.py.bak`
- [x] Remove `/frontend/package.json.bak`
- [x] Remove `/frontend/src/__tests__/integration/authentication-flow.test.tsx.bak`
- [x] Remove `/frontend/src/testing/page-objects/index.ts.bak`
- [x] Remove `/frontend/src/features/collections/__tests__/QAPairForm.test.tsx.bak`
- [x] Remove `/frontend/src/features/collections/__tests__/QAPairForm.test.tsx.new`

## Phase 2: Remove Debug and Development Scripts

### Backend Scripts
- [ ] Remove `/backend/run.sh`
- [ ] Remove `/backend/start_server.sh`
- [ ] Remove `/backend/test_docker.sh`
- [ ] Remove `/backend/test_server.sh`
- [ ] Remove `/backend/test_frontend_connectivity.sh`
- [ ] Remove `/backend/run_tests.sh`
- [ ] Remove `/backend/run_with_error_handling.py`
- [ ] Remove `/backend/test_app_import.py`

### Frontend Scripts
- [ ] Remove `/frontend/fix-imports.sh`
- [ ] Remove `/frontend/fix-typescript-errors.sh`
- [ ] Remove `/frontend/fix-prettier.sh`
- [ ] Remove `/frontend/check-prettier.sh`
- [ ] Remove `/frontend/install-test-deps.sh`
- [ ] Remove `/frontend/install-e2e-deps.sh`

### Project Root Scripts
- [ ] Remove `/check-collections.sh`
- [ ] Remove `/start_app.sh`

## Phase 3: Remove Documentation Files

### Project Root Documentation
- [ ] Remove `/refactoring-backend.md`
- [ ] Remove `/AUTH_UPDATES.md`
- [ ] Remove `/june5_document_updates.md`
- [ ] Remove `/backend-refactoring-phase1.md`
- [ ] Remove `/frontend-refactoring-plan.md`
- [ ] Remove `/TODO.md`
- [ ] **Keep** `/README.md` (main project documentation)

### Backend Documentation
- [ ] Remove `/backend/README.md`
- [ ] Remove `/backend/docs/` directory and contents
  - [ ] Remove `/backend/docs/architecture.md`
  - [ ] Remove `/backend/docs/backend_architecture.md`

### Frontend Documentation
- [ ] Remove `/frontend/README.md`
- [ ] Remove `/frontend/REFACTORING-PROGRESS.md`
- [ ] Remove `/frontend/REFACTORING-TASKS.md`
- [ ] Remove `/frontend/TESTING-STATUS.md`
- [ ] Remove `/frontend/TESTING.md`

## Phase 4: Remove Debug and Test Code

### Backend Debug Tools
- [ ] Remove `/backend/debug_tools/` directory and all contents
  - [ ] Remove `/backend/debug_tools/debug_app.py`
  - [ ] Remove `/backend/debug_tools/debug_auth.py`
  - [ ] Remove `/backend/debug_tools/debug_collections_routing.py`
  - [ ] Remove `/backend/debug_tools/debug_enhanced_db.py`
  - [ ] Remove `/backend/debug_tools/debug_memory_db.py`
  - [ ] Remove `/backend/debug_tools/debug_qa_pairs.py`
  - [ ] Remove `/backend/debug_tools/README.md`

### Backend Test Files
**Option A: Remove All Tests (Minimal Distribution)**
- [ ] Remove `/backend/tests/` directory and all contents
  - [ ] Remove `/backend/tests/conftest.py`
  - [ ] Remove `/backend/tests/integration/` directory
  - [ ] Remove `/backend/tests/unit/` directory
  - [ ] Remove `/backend/tests/__pycache__/` directory

**Option B: Keep Unit Tests (Recommended for Contributors)**
- [ ] **Keep** `/backend/tests/` directory (needed for pytest)
- [ ] **Keep** `/backend/tests/conftest.py` (pytest configuration)
- [ ] **Keep** `/backend/tests/unit/` and `/backend/tests/integration/` directories
- [ ] Remove only `/backend/tests/__pycache__/` directory

### Frontend Test Files
**Option A: Remove All Tests (Minimal Distribution)**
- [ ] Remove `/frontend/e2e-tests/` directory and all contents
- [ ] Remove `/frontend/src/__tests__/` directory and all contents
- [ ] Remove test configuration files:
  - [ ] Remove `/frontend/playwright.config.ts`
  - [ ] Remove `/frontend/vitest.config.mts` (duplicate config)
  - [ ] Remove `/frontend/vitest.config.ts`
- [ ] Remove test-related dependencies from package.json

**Option B: Keep Unit Tests (Recommended for Contributors)**
- [ ] Remove `/frontend/e2e-tests/` directory and all contents  
- [ ] Remove `/frontend/playwright.config.ts` (e2e config)
- [ ] Remove `/frontend/vitest.config.mts` (duplicate config)
- [ ] **Keep** `/frontend/vitest.config.ts` (needed for unit tests)
- [ ] **Keep** `/frontend/src/__tests__/` directory
- [ ] Keep vitest and testing-library dependencies in package.json

## Phase 5: Remove Cache and Build Artifacts

### Backend Cache
- [ ] Remove `/backend/__pycache__/` directory and all contents
- [ ] Remove `/backend/providers/__pycache__/` directory and all contents
- [ ] Remove `/backend/routers/__pycache__/` directory and all contents

### Frontend Build/Test Artifacts
- [ ] Remove `/frontend/coverage/` directory and all contents
- [ ] **Keep** `/frontend/build/` directory (production build artifacts)

## Phase 6: Review and Consolidate Core Files

### Backend Core Files to Keep
- [ ] Verify `/backend/app.py` is essential
- [ ] Verify `/backend/Dockerfile` is essential
- [ ] Verify `/backend/pyproject.toml` is essential
- [ ] Verify `/backend/uv.lock` is essential
- [ ] Verify `/backend/sample.env` is essential
- [ ] Review `/backend/providers/` directory for unused modules
- [ ] Review `/backend/routers/` directory for unused modules

### Frontend Core Files to Keep
- [ ] Verify `/frontend/package.json` is essential
- [ ] Verify `/frontend/Dockerfile` is essential
- [ ] Verify `/frontend/tsconfig.json` is essential
- [ ] Verify `/frontend/eslint.config.js` is essential
- [ ] Review `/frontend/src/` directory for unused components

### Infrastructure Files to Keep
- [ ] Verify `/infrastructure/main.bicep` is essential
- [ ] Verify `/infrastructure/deploy.sh` is essential

### Project Root Files to Keep
- [ ] Verify `/docker-compose.yml` is essential
- [ ] **Keep** `/README.md` (main project documentation)

## Phase 7: Final Validation
- [ ] Test that the application still builds and runs correctly
- [ ] Verify Docker containers can be built successfully
- [ ] Check that all import statements in remaining code are valid
- [ ] Ensure no broken references to removed files
- [ ] Update any remaining documentation if needed

## Notes
- This cleanup removes development and debugging tools while preserving the core application functionality
- The application should remain fully functional for demonstration and extension purposes
- All removed files can be recovered from version control if needed
- Consider creating a separate development branch before executing this cleanup

## Execution Status
Total items: ~70 cleanup tasks
Completed: 0
Remaining: All items pending review and execution
