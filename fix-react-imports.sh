#!/bin/bash

# Script to fix React import inconsistencies that cause createContext errors

echo "🔧 Fixing React import inconsistencies..."

# Fix "import React from 'react'" patterns
files_to_fix=(
    "src/components/LoadingSpinner.tsx"
    "src/components/SellerBankingSetupPrompt.tsx"
    "src/components/checkout/CheckoutOrderSummary.tsx"
    "src/components/PaymentSystemNotice.tsx"
    "src/components/ui/province-selector.tsx"
    "src/components/SellerRestrictionBanner.tsx"
    "src/components/QAQuickAccess.tsx"
    "src/components/DatabaseErrorFallback.tsx"
    "src/components/PaymentRedirectNotice.tsx"
    "src/components/EnvironmentChecker.tsx"
    "src/components/GoogleMapsErrorHandler.tsx"
    "src/components/university-info/APSStorageIndicator.tsx"
    "src/pages/PaymentDashboard.tsx"
    "src/pages/PaymentCallback.tsx"
    "src/pages/UniversityProfile.tsx"
    "src/pages/Shipping.tsx"
)

for file in "${files_to_fix[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing $file..."
        sed -i 's/^import React from "react";/import * as React from "react";/' "$file"
    fi
done

# Fix "import React, { ... } from 'react'" patterns
files_with_destructuring=(
    "src/components/ErrorBoundary.tsx"
    "src/components/EmergencyBypass.tsx"
    "src/pages/Index.tsx"
    "src/components/ComprehensiveQAChecker.tsx"
    "src/components/ErrorTracker.tsx"
    "src/components/SystemHealthMonitor.tsx"
    "src/components/PerformanceMonitor.tsx"
    "src/components/checkout/CheckoutShippingForm.tsx"
    "src/components/checkout/EnhancedShippingFormFixed.tsx"
    "src/components/checkout/SimpleShippingForm.tsx"
    "src/components/checkout/EnhancedShippingForm.tsx"
    "src/components/checkout/CheckoutPaymentProcessor.tsx"
    "src/components/CommitToSaleButton.tsx"
    "src/components/OptimizedImage.tsx"
    "src/components/ui/ProvinceDemo.tsx"
    "src/components/QADashboard.tsx"
    "src/components/BecomeSellerGuide.tsx"
    "src/components/fastway/FastwayTrackingOnly.tsx"
    "src/components/admin/AdminUtilitiesTab.tsx"
    "src/components/SafeNavigation.tsx"
    "src/components/SystemwideQAFixes.tsx"
    "src/components/LoadingFallback.tsx"
    "src/components/delivery/UnifiedTrackingComponent.tsx"
    "src/components/EnhancedBecomeSellerGuide.tsx"
    "src/components/PerformanceMetrics.tsx"
    "src/components/PaymentInfoBanner.tsx"
    "src/components/GoogleMapsSetupHelper.tsx"
    "src/components/delivery/DeliveryQuoteComparison.tsx"
    "src/components/shiplogic/ShipLogicRateQuote.tsx"
    "src/components/shiplogic/ShipLogicTrackingOnly.tsx"
    "src/components/profile/EnhancedBankingDetailsSection.tsx"
    "src/components/profile/BankingDetailsSection.tsx"
    "src/components/profile/UserProfileTabs.tsx"
    "src/components/profile/SecureBankingDetailsSection.tsx"
    "src/components/CampusNavbar.tsx"
    "src/components/payment/TransactionStatus.tsx"
    "src/components/payment/PaymentButton.tsx"
    "src/components/MobileOptimizedLayout.tsx"
    "src/components/AuthErrorBoundary.tsx"
    "src/components/CheckoutTroubleshooting.tsx"
    "src/components/MobileShippingDashboard.tsx"
    "src/components/DevToolsQuickAccess.tsx"
    "src/components/university-info/UniversitySpecificAPSDisplay.tsx"
    "src/components/university-info/UniversityDetailView.tsx"
    "src/components/university-info/ComprehensiveAPSCalculator.tsx"
    "src/components/university-info/APSRecoveryStatus.tsx"
    "src/components/university-info/EligibleProgramsSection.tsx"
    "src/components/university-info/SimpleAPSCalculator.tsx"
    "src/components/university-info/EnhancedAPSCalculator.tsx"
    "src/components/QAStatusChecker.tsx"
    "src/components/DevelopmentToolsDashboard.tsx"
    "src/components/courier-guy/CourierGuyTracker.tsx"
    "src/components/courier-guy/CourierGuyTrackingOnly.tsx"
    "src/pages/CheckoutSuccess.tsx"
    "src/pages/SystemStatus.tsx"
    "src/pages/ModernUniversityProfile.tsx"
    "src/pages/Checkout.tsx"
    "src/pages/APSDemo.tsx"
    "src/pages/SimpleQADashboard.tsx"
    "src/pages/EnhancedUniversityProfile.tsx"
    "src/components/university-info/CampusBooksSection.tsx"
)

for file in "${files_with_destructuring[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing destructuring imports in $file..."
        # More complex sed to handle destructuring
        sed -i -E 's/^import React, \{([^}]+)\} from "react";/import * as React from "react";\nimport {\1} from "react";/' "$file"
    fi
done

echo "✅ React import fixes completed!"
echo "🔄 Please restart your dev server to apply changes."
