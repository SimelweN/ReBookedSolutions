# Development Dashboard Guide

## 🎯 Overview

The Development Dashboard is a comprehensive testing suite that allows developers to test all aspects of the system including Edge Functions, database tables, authentication, commit system, and environment configuration.

## 🚀 Accessing the Dashboard

### URL: `/dev-dashboard`

**Requirements:**

- Admin authentication required
- Access through Admin dropdown menu in navbar

### Navigation

1. Login as an admin user
2. Click the "Admin" dropdown in the top navigation
3. Select "Development Dashboard"

## 📋 Dashboard Features

### 1. Overview Tab

- **System Health Overview**: Real-time status of all system components
- **Quick Tests**: One-click testing for critical systems
- **System Status**: Summary of database, environment, and user session
- **Recent Test Results**: Latest test outcomes with status indicators

### 2. Database Tab

- **Table Explorer**: Browse all available database tables
- **Data Viewer**: Inspect table contents and structure
- **Column Information**: View table schemas and data types
- **Row Counts**: See how much data is in each table

### 3. Edge Functions Tab

- **Function Status**: Check deployment status of all Edge Functions
- **Test Functions**: Send test requests to verify functionality
- **Deploy Commands**: Copy deployment commands for easy setup
- **Response Monitoring**: View function responses and errors

### 4. Commit System Tab

- **Demo Testing**: Create test orders with real deadlines
- **Flow Testing**: Test commit and decline workflows
- **Auto-Expire Testing**: Trigger automatic expiry processes
- **System Information**: Overview of commit system architecture

### 5. Environment Tab

- **Environment Variables**: Check configuration status
- **Deployment Info**: View current environment settings
- **Missing Variables**: Identify configuration issues
- **Security Status**: Verify API keys and secrets

### 6. Test Results Tab

- **Comprehensive Logging**: All test results with timestamps
- **Export Functionality**: Download results as CSV
- **Clear Results**: Reset test history
- **Detailed Debugging**: View error details and stack traces

### 7. Dev Tools Tab

- **SQL Console**: Quick database queries
- **System Utilities**: Browser storage management
- **Debug Information**: System info for troubleshooting
- **Health Monitoring**: Refresh system status

## 🧪 Testing Capabilities

### Database Testing

```typescript
// Tests performed:
✅ Connection verification
✅ Table accessibility
✅ Row counting
✅ Schema inspection
✅ Query performance
```

### Edge Functions Testing

```typescript
// Functions tested:
✅ commit-to-sale
✅ decline-commit
✅ auto-expire-commits
✅ verify-paystack-payment
✅ create-order
✅ paystack-webhook
✅ get-delivery-quotes
```

### Commit System Testing

```typescript
// Workflows tested:
✅ Demo order creation
✅ Commit flow validation
✅ Decline flow validation
✅ Auto-expire functionality
✅ Notification creation
✅ Database updates
```

### Authentication Testing

```typescript
// Auth checks:
✅ User session validation
✅ Token verification
✅ Permission checking
✅ Admin role validation
```

### Environment Testing

```typescript
// Configuration checks:
✅ Required variables
✅ Optional variables
✅ API key validation
✅ URL configuration
```

## 🔧 Usage Examples

### Running Quick Tests

1. Go to **Overview** tab
2. Click individual test buttons:
   - "Test Database Connection"
   - "Test Authentication"
   - "Test Edge Functions"
   - "Test Commit System"

### Testing Commit Flow

1. Go to **Commit System** tab
2. Click "Create Demo Order"
3. Copy the generated Order ID
4. Click "Test Commit Flow"
5. Check results in **Test Results** tab

### Checking Database Tables

1. Go to **Database** tab
2. Click on any table name in the left panel
3. View table data in the right panel
4. Inspect column names and data types

### Monitoring Edge Functions

1. Go to **Edge Functions** tab
2. Click "Test Function" on any function card
3. View responses and deployment status
4. Copy deploy commands if needed

## 📊 Test Result Interpretation

### Status Indicators

- ✅ **Success**: Green checkmark - Test passed
- ❌ **Failed**: Red X - Test failed with error
- ⚠️ **Warning**: Yellow triangle - Test passed with warnings
- 🔄 **Running**: Spinning circle - Test in progress

### Common Test Results

#### Database Connection

```
✅ Success: "Database connected successfully (45ms)"
❌ Failed: "Connection failed: relation does not exist"
```

#### Edge Functions

```
✅ Success: "Function accessible (120ms)"
❌ Failed: "Function not deployed or not accessible"
```

#### Authentication

```
✅ Success: "Authenticated as: user@example.com"
❌ Failed: "No authenticated user found"
```

#### Environment Config

```
✅ Success: "All required environment variables are set"
❌ Failed: "Missing required variables: VITE_SUPABASE_URL"
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Edge Functions Not Found

**Problem**: Functions return "not deployed or not accessible"

**Solutions**:

- Deploy functions using: `supabase functions deploy function-name`
- Check Supabase project configuration
- Verify environment variables in Supabase dashboard

#### 2. Database Connection Failed

**Problem**: Cannot connect to database tables

**Solutions**:

- Check internet connection
- Verify Supabase URL and keys
- Check RLS policies on tables
- Ensure user has proper permissions

#### 3. Authentication Issues

**Problem**: User not authenticated or admin check fails

**Solutions**:

- Login again with admin credentials
- Check user role in profiles table
- Verify JWT token is valid
- Clear browser cache and cookies

#### 4. Environment Variables Missing

**Problem**: Required configuration not found

**Solutions**:

- Create or update `.env` file
- Set variables in deployment environment
- Restart development server
- Check variable naming (VITE\_ prefix)

### Debug Information

The dashboard provides comprehensive debug information:

```javascript
// System Info Available:
{
  userAgent: "Browser information",
  url: "Current page URL",
  timestamp: "Current time",
  viewport: "Screen dimensions",
  environment: "development/production",
  supabaseUrl: "Database URL",
  hasPaystackKey: true/false,
  hasGoogleMapsKey: true/false,
  testResultsCount: 25
}
```

## 📈 Performance Monitoring

### Test Timing

- All tests include duration measurements
- Performance trends tracked over time
- Slow queries and functions identified
- Bottlenecks highlighted in results

### Health Monitoring

```typescript
// System health checked:
- Database response time
- Edge function availability
- Authentication latency
- Table accessibility
- Configuration completeness
```

## 🔒 Security Considerations

### Access Control

- Dashboard requires admin authentication
- Protected route prevents unauthorized access
- Admin role validation on all requests
- Sensitive data masked in environment display

### Safe Testing

- Demo orders use test data only
- No production data modified
- Tests use safe query limits
- Rollback capabilities for demo data

### Data Privacy

- Personal information not displayed
- API keys shown as "Set (hidden)"
- Test results don't expose sensitive data
- Export files contain no personal info

## 📥 Export and Reporting

### CSV Export

Test results can be exported as CSV files containing:

- Test name and type
- Success/failure status
- Error messages
- Timestamps
- Duration measurements

### Report Generation

```csv
Test,Status,Message,Timestamp,Duration
Database Connection,success,"Database connected successfully",2024-01-15T10:30:00Z,45
Edge Function: commit-to-sale,failed,"Function not deployed",2024-01-15T10:30:05Z,
Authentication,success,"Authenticated as: admin@example.com",2024-01-15T10:30:10Z,12
```

## 🚀 Advanced Usage

### Custom Testing

The dashboard can be extended with custom tests:

```typescript
// Add custom test in DevTestingService
static async customTest(): Promise<TestResult> {
  // Your test logic here
  return this.addTestResult('Custom Test', 'success', 'Test passed');
}
```

### Integration Testing

Run comprehensive test suites:

1. Click "Run All Tests" for full system check
2. Monitor results in real-time
3. Export results for documentation
4. Share with team for debugging

### Continuous Monitoring

Use the dashboard for:

- Pre-deployment testing
- Post-deployment verification
- System health monitoring
- Performance tracking
- Issue identification

## 📚 API Reference

### DevTestingService Methods

```typescript
// Core testing methods
DevTestingService.testDatabaseConnection();
DevTestingService.testAuthentication();
DevTestingService.testEdgeFunctions();
DevTestingService.testNotificationSystem();
DevTestingService.testEnvironmentConfig();

// Utility methods
DevTestingService.createDemoOrder(userId);
DevTestingService.runHealthCheck();
DevTestingService.exportTestResults();
DevTestingService.getSystemInfo();
```

### Test Result Structure

```typescript
interface TestResult {
  id: string;
  test: string;
  status: "running" | "success" | "failed" | "pending";
  message: string;
  timestamp: string;
  duration?: number;
  details?: any;
}
```

## 🎯 Best Practices

### Regular Testing

- Run tests before deployments
- Monitor system health daily
- Export results for records
- Share issues with team

### Troubleshooting

- Start with "Run All Tests"
- Focus on failed tests first
- Check environment variables
- Verify database connectivity

### Documentation

- Export test results regularly
- Document recurring issues
- Share solutions with team
- Update troubleshooting guides

The Development Dashboard is your comprehensive tool for ensuring system reliability, debugging issues, and maintaining optimal performance across all components of the application.
