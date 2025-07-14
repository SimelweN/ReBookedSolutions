#!/bin/bash

# React Import Consistency Checker
# Prevents "Cannot read properties of undefined (reading 'createContext')" errors

echo "🔍 Checking React import consistency across the codebase..."

# Find all TypeScript/JSX files with React imports
INCONSISTENT_FILES=$(grep -r "import \* as React" src/ --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort | uniq)

if [ -z "$INCONSISTENT_FILES" ]; then
    echo "✅ All React imports are consistent!"
    echo "📋 All files use: import React from 'react'"
    exit 0
else
    echo "❌ Found inconsistent React imports that may cause createContext errors:"
    echo
    for file in $INCONSISTENT_FILES; do
        echo "🔴 $file"
        grep "import \* as React" "$file"
        echo "   Should be: import React from 'react'"
        echo
    done
    
    echo "🛠️ To fix these automatically, run:"
    echo "   find src/ -name '*.tsx' -o -name '*.ts' | xargs sed -i 's/import \* as React from \"react\"/import React from \"react\"/g'"
    echo
    echo "⚠️ These inconsistent imports can cause:"
    echo "   - 'Cannot read properties of undefined (reading \"createContext\")' errors"
    echo "   - Runtime failures when using React hooks and context"
    echo "   - Build issues in production"
    
    exit 1
fi
