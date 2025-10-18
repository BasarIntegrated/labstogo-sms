# 🧪 Testing Documentation

This directory contains comprehensive tests for the LabsToGo SMS Blaster application.

## 📁 Test Structure

```
__tests__/
├── api/                    # API endpoint tests
│   ├── leads-upload.test.js
│   ├── settings.test.js
│   └── queue-status.test.js
├── hooks/                  # React Query hooks tests
│   ├── useLeads.test.js
│   └── useSettings.test.js
├── components/             # React component tests
│   └── Layout.test.jsx
├── integration/            # Integration tests
│   └── upload-flow.test.js
├── utils/                  # Utility function tests
│   └── sms.test.js
└── README.md              # This file
```

## 🚀 Running Tests

### Prerequisites

1. Install dependencies:

   ```bash
   npm install
   ```

2. Ensure your `.env.local` file contains test environment variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_test_service_role_key
   ```

### Test Commands

#### Run All Tests

```bash
npm test
```

#### Run Tests in Watch Mode

```bash
npm run test:watch
```

#### Run Tests with Coverage

```bash
npm run test:coverage
```

#### Run Tests for CI/CD

```bash
npm run test:ci
```

#### Run Specific Test Files

```bash
npm test -- leads-upload.test.js
npm test -- --testPathPattern=api
npm test -- --testPathPattern=hooks
```

## 📋 Test Categories

### 🔌 API Tests (`api/`)

Tests for Next.js API routes:

- **leads-upload.test.js**: Tests CSV upload functionality

  - File validation
  - Strategy handling (skip/upsert)
  - Error handling
  - Phone number formatting

- **settings.test.js**: Tests system settings API

  - GET settings
  - POST settings
  - Error handling
  - Data validation

- **queue-status.test.js**: Tests BullMQ queue status
  - Queue metrics
  - Recent jobs
  - Error handling

### 🎣 Hook Tests (`hooks/`)

Tests for React Query hooks:

- **useLeads.test.js**: Tests lead management hooks

  - Data fetching
  - Upload mutations
  - Error handling
  - Filtering

- **useSettings.test.js**: Tests settings management hooks
  - Settings fetching
  - Settings saving
  - Connection testing

### 🧩 Component Tests (`components/`)

Tests for React components:

- **Layout.test.jsx**: Tests main layout component
  - Navigation rendering
  - User menu
  - Footer
  - Link functionality

### 🔗 Integration Tests (`integration/`)

End-to-end workflow tests:

- **upload-flow.test.js**: Tests complete upload workflow
  - Modal interaction
  - File selection
  - Strategy selection
  - Upload process
  - Error handling

### 🛠️ Utility Tests (`utils/`)

Tests for utility functions:

- **sms.test.js**: Tests SMS utility functions
  - Phone number validation
  - Phone number formatting
  - Message personalization
  - SMS sending

## 🎯 Test Coverage

The test suite aims for:

- **70%+ code coverage** across all modules
- **100% coverage** for critical paths (upload, SMS sending)
- **Comprehensive error handling** tests
- **Edge case coverage** for data validation

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

- Uses Next.js Jest configuration
- JSDOM environment for React components
- Path mapping for `@/` imports
- Coverage thresholds

### Test Setup (`jest.setup.js`)

- Global mocks for Next.js
- Supabase client mocking
- React Query mocking
- Console method mocking

## 📊 Mocking Strategy

### External Dependencies

- **Supabase**: Mocked client with chainable methods
- **Twilio**: Mocked SMS client
- **BullMQ**: Mocked queue operations
- **Next.js**: Mocked router and navigation

### API Responses

- Consistent mock data structures
- Error scenario testing
- Network failure simulation

## 🐛 Debugging Tests

### Running Individual Tests

```bash
# Run specific test file
npm test -- leads-upload.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should upload leads"

# Run tests in specific directory
npm test -- __tests__/api/
```

### Debug Mode

```bash
# Run tests with debug output
npm test -- --verbose

# Run tests with no coverage for faster debugging
npm test -- --coverage=false
```

### Common Issues

1. **Mock Not Working**

   - Check mock placement in `jest.setup.js`
   - Verify mock is imported before the module being tested

2. **Async Test Failures**

   - Use `waitFor()` for async operations
   - Check promise resolution in mocks

3. **Component Not Rendering**
   - Verify all required providers are wrapped
   - Check for missing dependencies

## 📈 Adding New Tests

### Test File Naming

- Use `.test.js` or `.test.jsx` extension
- Include component/feature name
- Group by functionality

### Test Structure

```javascript
describe("Feature Name", () => {
  beforeEach(() => {
    // Setup
  });

  it("should do something specific", async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Best Practices

- **One assertion per test** when possible
- **Descriptive test names** that explain the scenario
- **Mock external dependencies** consistently
- **Test error cases** as well as success cases
- **Use data-testid** for reliable element selection

## 🔄 Continuous Integration

Tests are configured to run in CI/CD pipelines with:

- **Coverage reporting**
- **Parallel execution**
- **Fail-fast on errors**
- **Artifact collection**

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [React Query Testing](https://tanstack.com/query/v4/docs/react/guides/testing)
