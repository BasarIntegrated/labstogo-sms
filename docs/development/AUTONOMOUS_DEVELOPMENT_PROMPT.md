# 🤖 Autonomous Message Blasting App Development Prompt

You are my autonomous engineering agent. Build the Message Blasting App (Phase 1: SMS; Phase 2: Email later) per the specs below. Work in 20–60 minute milestones without further input. For each milestone: plan, implement, run quality checks, and self-correct. When blocked, create minimal shims/fallbacks. Keep code readable, strongly typed where applicable, and production-lean. At the end, produce QA evidence and a brief deployment note.

## Context

- **Tech**: Next.js App Router, TypeScript, Tailwind, Supabase/Postgres, Twilio for SMS. React Query ok. BullMQ optional later. Node 18+.
- **Repo**: Use existing project structure. Don't regress existing functionality.
- **Scale**: 50,000 contacts (batch sends; pagination; async jobs later).
- **Security**: SSL in transit; hashed passwords; RBAC (admin/standard).
- **Constraints**: Phase 1 ships SMS only but must store emails for Phase 2.

## Deliverables (Phase 1 scope)

### 1) Rebrand app to "Message Blasting App"

- Update titles, headers, footer, README
- Change from "LabsToGo SMS" to general message blasting focus

### 2) Auth + Roles

- Login/logout; sessions; RBAC: admin (full), standard (own resources)
- Secure password hashing; session management

### 3) Dashboard

- Recent campaigns (sent/scheduled/draft)
- Metrics: total messages, active/scheduled, success/fail if available
- Quick actions for common tasks

### 4) Contacts

- **Upload Excel/CSV**: columns [Group, Name, Mobile Number, Email Address, License Expiration Date, Others]
- **Validate**: required fields, phone/email format, duplicates; detailed upload report
- **List, search, sort, paginate**; manual add/edit/delete
- **Groups**: create/rename/delete; assign/remove contacts; filter by group
- **Export CSV/XLSX**

### 5) Message Templates

- Create/save templates; merge tags (first_name, last_name, group, email, phone, license_expiration_date)
- SMS character counter, parts estimate, preview
- Template library with search/filter

### 6) Campaigns (SMS only)

- **Create/edit**: name, description, template pick, recipients (all, groups, custom selection)
- **Status**: draft, active, completed, cancelled
- **Schedule now/later** (store schedule but async send can be simulated if needed)
- **Sending**: integrate Twilio; batch sending; basic status tracking (sent/pending/failed when available)
- **Webhook endpoint** ready for Twilio status callbacks (ok to stub in dev)

### 7) File Handling

- Accept .xlsx and .csv; robust parsing; surface row-level errors
- Store emails for future email phase
- Upload progress and validation reports

### 8) Data Management

- Persistent storage; bulk delete contacts/campaigns; soft delete preferred
- Data export/import capabilities

### 9) Notifications

- In-app toasts for uploads, campaign creation/schedule/send, and errors
- Success/failure feedback for all operations

### 10) Quality/Docs

- **Add tests**: unit for utils/parsers; integration for APIs; minimal e2e happy path
- **npm scripts**: quality:lint, quality:typecheck, quality:test, quality:build, quality:all
- **Update README** with setup, env vars, Twilio/Supabase notes, and usage
- **Provide a short QA checklist and results**

## Operating Rules

### Autonomy

- Proceed without additional prompts; create/modify code, migrations, and scripts as needed
- Self-correct when quality checks fail
- Create fallbacks when external services are unavailable

### Migrations

- Add safe Postgres migrations for new tables/indexes; idempotent where possible
- Use existing Supabase setup; extend schema as needed

### API

- Define request/response contracts; validate input; return clear errors
- Follow RESTful patterns; use proper HTTP status codes
- Handle async operations gracefully

### UX

- Clean, accessible UI; loading states; empty states; error states; skeletons
- Responsive design; mobile-friendly
- Professional, modern interface

### Performance

- Server-side pagination; indexed columns; batch writes
- Optimize for 50,000+ contacts
- Lazy loading where appropriate

### Logging/Observability

- Console/error logs sufficient for dev; structure for future expansion
- Clear error messages for users
- Debug information for developers

### Fallbacks

- If external services fail (Supabase/Twilio), use safe fallbacks and surface a clear banner/state
- Graceful degradation of features
- Mock data when database is unavailable

### Existing Code

- Keep existing campaign features working
- Fix "params should be awaited" warnings in dynamic API routes
- Maintain backward compatibility where possible

## Success Criteria

### Functional Requirements

- App runs locally end-to-end
- Can upload contacts (with report), create templates, create/schedule/send SMS campaigns to selected recipients
- View dashboard metrics and recent activity
- User authentication and role-based access works

### Technical Requirements

- Statuses: draft/active/completed/cancelled enforced with DB constraints
- Clean code; no new lint/type errors; build passes
- All quality checks pass
- Database migrations are safe and reversible

### Quality Requirements

- QA: Provide a short test run summary and screenshots/gifs path hints if applicable
- Documentation updated
- README includes setup instructions

## Implementation Milestones

### Milestone 1: Database Schema & Foundation (20-30 min)

1. Create/confirm DB schema (contacts, groups, templates, campaigns, campaign_recipients, uploads, users/roles, sessions)
2. Create migration files
3. Update existing API routes to fix "params should be awaited" warnings

### Milestone 2: Rebranding & UI Foundation (15-20 min)

1. Update all branding from "LabsToGo SMS" to "Message Blasting App"
2. Update package.json, README, and all UI text
3. Ensure consistent messaging throughout

### Milestone 3: Contact Management System (30-45 min)

1. Implement contacts upload + validation + UI + API
2. Excel/CSV parsing with error reporting
3. Contact groups management
4. Contact CRUD operations

### Milestone 4: Message Templates System (25-35 min)

1. Implement templates + composer + counter + preview
2. Merge tags system
3. SMS character counting and parts estimation
4. Template library and management

### Milestone 5: Enhanced Campaign Management (30-40 min)

1. Implement campaigns (create/edit, recipients, schedule/send)
2. Twilio integration + webhook stub
3. Recipient selection (all, groups, custom)
4. Campaign status management

### Milestone 6: Dashboard & Metrics (20-30 min)

1. Implement dashboard metrics + recent campaigns
2. Key performance indicators
3. Quick actions and navigation

### Milestone 7: Authentication & RBAC (25-35 min)

1. Implement auth + RBAC
2. Login/logout functionality
3. Role-based access control
4. Session management

### Milestone 8: Quality Assurance & Documentation (20-30 min)

1. Add tests, scripts, docs
2. Run quality:all; fix issues
3. Update README with comprehensive setup guide
4. Create QA checklist and results

## Final Deliverables

### Code Quality

- All linting and type checking passes
- Build succeeds without errors
- Tests pass (unit, integration, minimal e2e)

### Documentation

- Updated README with setup instructions
- API documentation in code comments
- Environment variables documented

### QA Report

- Test run summary
- Screenshots/gifs of key functionality
- Known issues and workarounds
- Deployment notes

## Report Format

After each milestone, provide:

```
## Milestone X: [Name] - [Status]

### Completed
- [List of completed items]

### Next Steps
- [What's coming next]

### Issues/Notes
- [Any blockers or important notes]
```

At the end, provide:

```
## Final QA Report

### Functional Testing
- [Test results summary]

### Technical Testing
- [Build, lint, type check results]

### Deployment Notes
- [Environment setup, known issues, etc.]
```

---

**Now begin with Milestone 1: Database Schema & Foundation**
