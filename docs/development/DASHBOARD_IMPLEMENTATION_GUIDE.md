# 🚀 Dashboard Implementation Guide - Step by Step

## How to Proceed Effectively & Independently

This guide breaks down the minimal dashboard implementation into clear, independent steps. You can execute each step sequentially, or delegate specific steps.

---

## 📍 Quick Reference: Existing vs New Files

### ✅ Existing Files (Reference These):

| File Path                                               | Purpose                              | Key Lines                                 |
| ------------------------------------------------------- | ------------------------------------ | ----------------------------------------- |
| `src/hooks/useDashboardData.ts`                         | Dashboard data hook with React Query | 88-193 (main hook), 122 (refetchInterval) |
| `src/components/dashboard/MetricsGrid.tsx`              | Metric cards component               | 1-208 (MetricCard + MetricsGrid)          |
| `src/components/dashboard/CampaignPerformanceChart.tsx` | Recharts line chart example          | Full file - reference for chart patterns  |
| `src/app/api/dashboard/route.ts`                        | Existing dashboard API               | 14-60 (query examples), GET/POST methods  |
| `src/app/api/messages/route.ts`                         | Unified messages API                 | Full file - queries both SMS & Email      |
| `src/app/api/campaigns/route.ts`                        | Campaigns API                        | 22-45 (GET method)                        |
| `src/lib/supabase.ts`                                   | Supabase client                      | Contains `supabaseAdmin` for server-side  |

### ⚠️ New Files to Create:

| File Path                                            | Purpose           | Based On                                         |
| ---------------------------------------------------- | ----------------- | ------------------------------------------------ |
| `src/app/api/dashboard/stats/route.ts`               | Stats endpoint    | Reference `dashboard/route.ts` query patterns    |
| `src/app/api/dashboard/messages-timeline/route.ts`   | Timeline endpoint | Reference `messages/route.ts` date queries       |
| `src/app/api/dashboard/delivery-status/route.ts`     | Status endpoint   | Reference `messages/route.ts` status filtering   |
| `src/components/dashboard/MessagesTimelineChart.tsx` | Line chart        | Reference `CampaignPerformanceChart.tsx`         |
| `src/components/dashboard/DeliveryStatusChart.tsx`   | Donut chart       | Reference existing chart patterns                |
| `src/components/dashboard/RecentCampaignsTable.tsx`  | Campaigns table   | Reference `campaigns/page.tsx` table (line 890+) |
| `src/components/dashboard/RecentMessagesTable.tsx`   | Messages table    | Reference `contacts/page.tsx` table (line 890+)  |

---

---

## 📋 Implementation Checklist

Use this checklist to track progress. Each step is independent and can be completed separately.

### Phase 1: Backend API Endpoints (Start Here)

- [ ] **Step 1.1**: Create `/api/dashboard/stats` endpoint
- [ ] **Step 1.2**: Create `/api/dashboard/messages-timeline` endpoint
- [ ] **Step 1.3**: Create `/api/dashboard/delivery-status` endpoint
- [ ] **Step 1.4**: Test all endpoints with Postman/curl

### Phase 2: Frontend Components

- [ ] **Step 2.1**: Create enhanced MetricCard component with trends
- [ ] **Step 2.2**: Update MetricsGrid to use real API data
- [ ] **Step 2.3**: Create MessagesTimelineChart component
- [ ] **Step 2.4**: Create DeliveryStatusChart component
- [ ] **Step 2.5**: Create RecentCampaignsTable component
- [ ] **Step 2.6**: Create RecentMessagesTable component

### Phase 3: Integration & Polish

- [ ] **Step 3.1**: Connect all components to API endpoints
- [ ] **Step 3.2**: Add auto-refresh functionality
- [ ] **Step 3.3**: Add loading states and error handling
- [ ] **Step 3.4**: Test responsiveness on mobile
- [ ] **Step 3.5**: Deploy and verify

---

## 🎯 Quick Start Command

**To implement everything at once, use this command:**

```
"Implement the minimal dashboard: Create all 3 API endpoints, build the 4 metric cards with trends, add the 2 charts (messages timeline and delivery status donut), create the 2 activity tables, connect everything together, and add auto-refresh every 30 seconds."
```

---

## 📝 Step-by-Step Instructions

### Step 1.1: Create `/api/dashboard/stats` Endpoint

**File**: `src/app/api/dashboard/stats/route.ts`

**Task**: Query database for:

- Messages sent today (SMS + Email)
- Yesterday's count (for % change)
- Delivery rate (last 7 days)
- Active campaigns count
- Total contacts with email/phone breakdown

**Test Command**:

```bash
curl http://localhost:3000/api/dashboard/stats
```

**Acceptance Criteria**: Returns JSON with all metrics, handles errors gracefully

---

### Step 1.2: Create `/api/dashboard/messages-timeline` Endpoint

**File**: `src/app/api/dashboard/messages-timeline/route.ts`

**Task**: Query last 30 days of messages grouped by date and type

**Test Command**:

```bash
curl http://localhost:3000/api/dashboard/messages-timeline
```

**Acceptance Criteria**: Returns array of {date, sms, email} objects for last 30 days

---

### Step 1.3: Create `/api/dashboard/delivery-status` Endpoint

**File**: `src/app/api/dashboard/delivery-status/route.ts`

**Task**: Count messages by status (delivered, failed, pending)

**Test Command**:

```bash
curl http://localhost:3000/api/dashboard/delivery-status
```

**Acceptance Criteria**: Returns counts for delivered, failed, pending, total

---

### Step 2.1: Create Enhanced MetricCard Component

**File**: `src/components/dashboard/EnhancedMetricCard.tsx`

**Task**: Build reusable card with:

- Large number display
- Trend indicator (↑↓) with percentage
- Color coding (green/yellow/red)
- Optional subtitle

**Props**:

```typescript
{
  title: string;
  value: number | string;
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' };
  subtitle?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
}
```

---

### Step 2.2: Update MetricsGrid Component

**File**: `src/components/dashboard/MetricsGrid.tsx`

**Task**: Replace existing metrics with API-driven data from `/api/dashboard/stats`

**Changes**:

- Use `useQuery` to fetch from `/api/dashboard/stats`
- Map API response to 4 metric cards
- Use EnhancedMetricCard component

---

### Step 2.3: Create MessagesTimelineChart Component

**File**: `src/components/dashboard/MessagesTimelineChart.tsx`

**Task**: Build line chart showing SMS + Email messages over time

**Requirements**:

- Use Recharts LineChart
- Dual lines (SMS and Email)
- Last 30 days of data
- Fetch from `/api/dashboard/messages-timeline`
- Responsive design

---

### Step 2.4: Create DeliveryStatusChart Component

**File**: `src/components/dashboard/DeliveryStatusChart.tsx`

**Task**: Build donut chart showing delivery status breakdown

**Requirements**:

- Use Recharts PieChart (donut style)
- Colors: Green (delivered), Red (failed), Yellow (pending)
- Show percentages
- Fetch from `/api/dashboard/delivery-status`

---

### Step 2.5: Create RecentCampaignsTable Component

**File**: `src/components/dashboard/RecentCampaignsTable.tsx`

**Task**: Display top 5 campaigns sorted by delivery rate

**Columns**: Name, Type, Messages, Delivery Rate, Status
**Data**: Fetch from existing `/api/campaigns` endpoint, sort by delivery rate

---

### Step 2.6: Create RecentMessagesTable Component

**File**: `src/components/dashboard/RecentMessagesTable.tsx`

**Task**: Display last 50 messages with status

**Columns**: Contact, Type (SMS/Email), Status, Sent At
**Data**: Fetch from `/api/messages` endpoint with limit=50
**Features**: Auto-refresh every 30 seconds

---

### Step 3.1: Connect Everything

**File**: `src/app/dashboard/page.tsx`

**Task**: Update dashboard layout:

1. Keep existing MetricsGrid (now with real data)
2. Replace charts section with new MessagesTimelineChart and DeliveryStatusChart
3. Replace bottom section with RecentCampaignsTable and RecentMessagesTable
4. Remove QuickActions (optional, or keep if needed)

---

### Step 3.2: Add Auto-Refresh

**File**: `src/app/dashboard/page.tsx` or custom hook

**Task**:

- Create `useAutoRefresh` hook or add to existing queries
- Refresh dashboard data every 30 seconds
- Show refresh indicator

**Implementation**:

```typescript
useQuery(..., {
  refetchInterval: 30000, // 30 seconds
  refetchIntervalInBackground: true
})
```

---

### Step 3.3: Error Handling & Loading States

**Files**: All components

**Task**:

- Add loading skeletons/spinners
- Add error boundaries
- Show empty states when no data
- Handle API errors gracefully

---

### Step Enhancer: Testing Checklist

After each step, verify:

- [ ] Component renders without errors
- [ ] Data loads correctly
- [ ] Loading states work
- [ ] Error states work
- [ ] Responsive on mobile
- [ ] No console errors

---

## 🎨 Visual Layout Reference

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard Header (with refresh button)                 │
└─────────────────────────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Messages │ │Delivery  │ │  Active  │ │ Contacts │
│  Today   │ │   Rate   │ │Campaigns │ │          │
│   77     │ │  94.5%   │ │    3     │ │   61     │
│  ↑ 5.2%  │ │ ↓ -1.3%  │ │          │ │ 25 email │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

┌────────────────────────┐ ┌──────────────────────┐
│ Messages Over Time     │ │ Delivery Status      │
│ [Line Chart]           │ │ [Donut Chart]        │
│ SMS + Email lines      │ │ Delivered/Failed/... │
└────────────────────────┘ └──────────────────────┘

┌──────────────────────────────────┐ ┌──────────────────┐
│ Recent Campaigns (Top 5)         │ │ Recent Messages  │
│ [Table]                          │ │ [Table]          │
│ Name | Type | Rate | Status      │ │ Contact | Status │
└──────────────────────────────────┘ └──────────────────┘
```

---

## 🔧 Troubleshooting Guide

### API Endpoints Not Working?

1. Check database connection in `.env.local`
2. Verify Supabase service role key
3. Check browser console for errors
4. Verify endpoint URLs match frontend calls

### Charts Not Rendering?

1. Check if Recharts is installed: `npm list recharts`
2. Verify data format matches chart expectations
3. Check browser console for chart errors
4. Ensure data array is not empty

### Data Not Updating?

1. Check React Query cache settings
2. Verify auto-refresh interval is set
3. Check network tab for API calls
4. Ensure API endpoints return fresh data

### Performance Issues?

1. Check if queries are running multiple times
2. Verify React Query is caching properly
3. Check database query performance
4. Consider adding indexes if queries are slow

---

## 📚 Reference Files

### Existing Files (Already Implemented):

- ✅ `src/hooks/useDashboardData.ts` - Dashboard data fetching hook with React Query
- ✅ `src/components/dashboard/MetricsGrid.tsx` - Current metric card component (line 1-208)
- ✅ `src/components/dashboard/CampaignPerformanceChart.tsx` - Chart component using Recharts
- ✅ `src/components/dashboard/PatientEngagementChart.tsx` - Another chart example
- ✅ `src/components/dashboard/DashboardHeader.tsx` - Dashboard header with refresh button
- ✅ `src/components/dashboard/RecentActivity.tsx` - Recent activity component
- ✅ `src/app/dashboard/page.tsx` - Main dashboard page (line 1-103)
- ✅ `src/app/api/dashboard/route.ts` - Existing dashboard API endpoint (GET/POST methods)
- ✅ `src/app/api/campaigns/route.ts` - Campaigns API endpoint example
- ✅ `src/app/api/messages/route.ts` - Messages API endpoint (unified SMS + Email)
- ✅ `src/lib/supabase.ts` - Supabase client setup (contains supabaseAdmin)

### Files to Create (New):

- ⚠️ `src/app/api/dashboard/stats/route.ts` - replace existing dashboard stats logic
- ⚠️ `src/app/api/dashboard/messages-timeline/route.ts` - NEW endpoint
- ⚠️ `src/app/api/dashboard/delivery-status/route.ts` - NEW endpoint
- ⚠️ `src/components/dashboard/EnhancedMetricCard.tsx` - Enhanced card with trends
- ⚠️ `src/components/dashboard/MessagesTimelineChart.tsx` - NEW chart component
- ⚠️ `src/components/dashboard/DeliveryStatusChart.tsx` - NEW donut chart
- ⚠️ `src/components/dashboard/RecentCampaignsTable.tsx` - NEW table component
- ⚠️ `src/components/dashboard/RecentMessagesTable.tsx` - NEW table component

### Database Tables & Schema:

- `contacts` table - Contact management (24 columns: id, first_name, email, phone_number, status, etc.)
- `campaigns` table - Campaign data (id, name, description, status, campaign_type, recipient_contacts, etc.)
- `sms_messages` table - SMS message tracking (id, campaign_id, contact_id, phone_number, status, sent_at, etc.)
- `email_messages` table - Email message tracking (id, campaign_id, contact_id, email, status, sent_at, etc.)
- `contact_groups` table - Contact organization (id, name, description, color)
- `message_templates` table - Template management

### Key Database Queries Reference:

See existing queries in:

- `src/app/api/dashboard/route.ts` (lines 14-60) - Example of contact/campaign counting
- `src/app/api/messages/route.ts` - Example of querying both SMS and email messages
- `src/app/api/campaigns/route.ts` - Example of campaign queries

### Supabase Client Usage:

```typescript
import { supabaseAdmin } from "@/lib/supabase";

// Use supabaseAdmin for server-side queries (bypasses RLS)
const { data, error } = await supabaseAdmin
  .from("table_name")
  .select("*")
  .count("exact");
```

---

## 🚀 Quick Command Reference

**To implement everything:**

```
Implement the complete minimal dashboard per the implementation guide, including all API endpoints, components, and integration with auto-refresh.
```

**To implement just API endpoints:**

```
Create all 3 dashboard API endpoints (/api/dashboard/stats, /api/dashboard/messages-timeline, /api/dashboard/delivery-status) with proper database queries and error handling.
```

**To implement just frontend:**

```
Build all dashboard frontend components: EnhancedMetricCard, MessagesTimelineChart, DeliveryStatusChart, RecentCampaignsTable, RecentMessagesTable, and update the dashboard page to use them.
```

**To add a specific feature:**

```
[Describe the specific feature you want, e.g., "Add auto-refresh to dashboard every 30 seconds"]
```

---

**Last Updated**: 2025-10-29  
**Status**: Ready for Implementation
