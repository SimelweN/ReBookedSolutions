#!/bin/bash

echo "🔧 Fixing React imports to use standard import pattern..."

# Fix files with: import * as React from "react"; import { ... } from "react";
# Convert to: import React, { ... } from "react";

find src -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q "import \* as React from \"react\";" "$file"; then
        echo "Fixing React import in: $file"
        
        # Check if there's also a destructured import from react
        if grep -q "import { .* } from \"react\";" "$file"; then
            # Get the destructured imports
            destructured=$(grep "import { .* } from \"react\";" "$file" | sed -E 's/import \{ (.*) \} from "react";/\1/')
            
            # Replace both lines with a single combined import
            sed -i '/import \* as React from "react";/d' "$file"
            sed -i "s/import { .* } from \"react\";/import React, { $destructured } from \"react\";/" "$file"
        else
            # Just replace the React import
            sed -i 's/import \* as React from "react";/import React from "react";/' "$file"
        fi
        
        echo "✅ Fixed: $file"
    fi
done

echo "🎉 React import fixes completed!"
echo "📋 Summary: Fixed all 'import * as React' to standard 'import React' pattern"
echo "🚀 This should resolve the 'Cannot read properties of undefined (reading createContext)' error"
