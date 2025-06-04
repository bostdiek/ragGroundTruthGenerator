#!/bin/bash

# Script to fix specific TypeScript errors identified in frontend code
cd "$(dirname "$0")"
echo "Fixing common TypeScript errors..."

# 1. Fix duplicate imports in DataSourceConfig.tsx
sed -i '' '/import { DataSourceAdapter } from "..\/adapters\/DataSourceAdapter";/d' src/features/retrieval/components/DataSourceConfig.tsx

# 2. Fix Card import in DocumentList.tsx
sed -i '' 's/import { Card } from "..\/..\/..\/components\/ui\/Card";/import Card from "..\/..\/..\/components\/ui\/Card";/' src/features/retrieval/components/DocumentList.tsx

# 3. Fix the file extension for useGenerationQueries.test.ts (it should be .tsx)
if [ -f "src/features/generation/hooks/__tests__/useGenerationQueries.test.ts" ]; then
  git mv src/features/generation/hooks/__tests__/useGenerationQueries.test.ts src/features/generation/hooks/__tests__/useGenerationQueries.test.tsx.tmp
  git mv src/features/generation/hooks/__tests__/useGenerationQueries.test.tsx.tmp src/features/generation/hooks/__tests__/useGenerationQueries.test.tsx
fi

echo "Fixes applied! Next, run TypeScript checking again to see if other issues remain."
