# 🤖 AI-First Development Guidelines

## Core Principles

### 1. **Milestone-Based Development** (20+ minute chunks)

- **Target**: Substantial features that can be developed independently
- **Avoid**: Line-by-line refactoring or small tweaks
- **Measure**: Can the AI work for 20+ minutes without intervention?

### 2. **Detailed Specifications First**

- **Don't delegate thinking** - Provide function-level, data structure, and control flow specifications
- **Plan architecture** before asking for implementation
- **Define interfaces** and data contracts upfront

### 3. **Deterministic Workflows**

- **Prefer predictable operations**: codemods, AST transformations, linting rules, scripts
- **Review before executing**: Generate scripts, review them, then run with confidence
- **Use git reset liberally**: When AI fails, reset and analyze what context was missing

### 4. **Human Craftsmanship**

- **Final touches belong to humans**: Once AI produces complete, well-architected code, switch to IDE
- **Use human judgment**: The last 10% of engineering requires uniquely human taste and decision-making

## Development Workflow

### Phase 1: Planning & Specification

```typescript
// Example: Feature Specification Template
interface FeatureSpec {
  // Architecture Requirements
  components: {
    [componentName]: {
      props: Record<string, Type>;
      state: Record<string, Type>;
      lifecycle: string[];
    };
  };

  // Data Requirements
  dataFlow: {
    inputs: Type[];
    transformations: Function[];
    outputs: Type[];
  };

  // API Requirements
  endpoints: {
    [path]: {
      method: "GET" | "POST" | "PUT" | "DELETE";
      request: Type;
      response: Type;
      validation: Schema;
    };
  };

  // Testing Requirements
  tests: {
    unit: TestCase[];
    integration: TestCase[];
    e2e: TestCase[];
  };
}
```

### Phase 2: AI Implementation

- **Provide complete context**: Include relevant files, database schema, existing patterns
- **Specify exact requirements**: Function signatures, data structures, error handling
- **Set clear boundaries**: What should be included, what should be excluded

### Phase 3: Quality Assurance

```bash
# Run deterministic quality checks
npm run quality:all

# If checks fail, analyze and reset
git reset --hard HEAD
# Refine prompt with missing context
# Try again
```

### Phase 4: Human Refinement

- **Switch to IDE**: Stop prompting for small changes
- **Apply human judgment**: Final touches, optimization, polish
- **Test manually**: Verify the implementation meets requirements

## Prompting Best Practices

### ✅ Good Prompts

```
"Create a campaign analytics dashboard with the following specifications:

Components:
- RealTimeChart: Line chart showing delivery rates over time
- MetricCards: Grid layout with delivery rate, open rate, click rate
- ExportButton: CSV/PDF export functionality

API Endpoints:
- GET /api/analytics/realtime: Returns current metrics
- GET /api/analytics/historical: Returns historical data with pagination
- POST /api/analytics/export: Async export generation

Data Flow:
1. Fetch real-time metrics from Redis cache
2. Fetch historical data from PostgreSQL
3. Combine and format for frontend consumption
4. Handle export requests as background jobs

Error Handling:
- Graceful degradation when Redis is unavailable
- Retry logic for failed API calls
- User-friendly error messages

Testing:
- Unit tests for data transformation functions
- Integration tests for API endpoints
- Mock external dependencies

Files to create/modify:
- src/app/analytics/page.tsx
- src/components/analytics/RealTimeChart.tsx
- src/components/analytics/MetricCards.tsx
- src/app/api/analytics/realtime/route.ts
- src/app/api/analytics/historical/route.ts
- src/app/api/analytics/export/route.ts
- __tests__/analytics/*.test.ts
"
```

### ❌ Bad Prompts

```
"Add analytics to the dashboard"
"Make the charts better"
"Fix the API"
"Add some tests"
```

## Quality Gates

### Pre-Implementation Checklist

- [ ] Feature specification is complete and detailed
- [ ] All required files and components are identified
- [ ] Data flow and API contracts are defined
- [ ] Error handling strategy is specified
- [ ] Testing requirements are clear

### Post-Implementation Checklist

- [ ] All quality checks pass (`npm run quality:all`)
- [ ] Code follows existing patterns and conventions
- [ ] Error handling is implemented as specified
- [ ] Tests are written and passing
- [ ] Documentation is updated

### Reset Triggers

Reset and refine prompt if:

- [ ] Quality checks fail
- [ ] Code doesn't follow existing patterns
- [ ] Missing required functionality
- [ ] Poor error handling
- [ ] Inadequate testing

## Common Patterns

### Database Operations

```typescript
// Always specify exact schema requirements
interface DatabaseOperation {
  table: string;
  operation: "INSERT" | "UPDATE" | "DELETE" | "SELECT";
  columns: string[];
  where?: Record<string, any>;
  returning?: string[];
  validation?: Schema;
}
```

### API Endpoints

```typescript
// Always specify complete request/response contracts
interface APIEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  request: {
    body?: Type;
    query?: Record<string, Type>;
    params?: Record<string, Type>;
  };
  response: Type;
  errorCodes: Record<number, string>;
  validation: Schema;
}
```

### React Components

```typescript
// Always specify complete component interface
interface ComponentSpec {
  name: string;
  props: Record<string, Type>;
  state: Record<string, Type>;
  lifecycle: string[];
  styling: "tailwind" | "css-modules" | "styled-components";
  accessibility: string[];
  testing: TestCase[];
}
```

## Success Metrics

### AI Independence

- **Target**: 20+ minutes of independent work
- **Measure**: Time between prompts
- **Goal**: Reduce babysitting to <10% of development time

### Code Quality

- **Target**: 95%+ quality check pass rate
- **Measure**: `npm run quality:all` results
- **Goal**: Minimize post-implementation fixes

### Development Velocity

- **Target**: Complete features in single AI sessions
- **Measure**: Features per development session
- **Goal**: Increase feature delivery speed by 3x

## Tools & Scripts

### Quality Assurance

```bash
# Run all quality checks
npm run quality:all

# Run specific checks
npm run quality:lint
npm run quality:typecheck
npm run quality:test
npm run quality:build
```

### Database Migrations

```bash
# Create new migration
npm run migration:create <migration-name>

# Generate common migrations
npm run migration:common
```

### Development Workflow

```bash
# Start development with quality monitoring
npm run dev &
npm run quality:all --watch

# Process background jobs
npm run process-jobs:dev
```

## Remember

- **AI is a tool, not magic** - It gets better with practice and clear specifications
- **Don't settle for babysitting** - Push for substantial, independent work
- **Reset liberally** - Learn from failures and refine your approach
- **Keep the final touches** - Human craftsmanship still matters
- **Measure success** - Track independence, quality, and velocity metrics
