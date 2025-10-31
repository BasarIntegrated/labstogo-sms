# 📋 Dashboard Implementation - Quick Reference Card

## 🎯 Goal: Implement Minimal Dashboard

**Location**: All files in `/Users/roelabasa/Projects/mml/labstogo-sms/`

---

## 🚀 Quick Commands Reference

### To Implement Everything:

```
"Implement the complete minimal dashboard per the implementation guide: Create all 3 API endpoints (/api/dashboard/stats, /api/dashboard/messages-timeline, /api/dashboard/delivery-status), build the 4 metric cards with trend indicators, add the 2 charts (messages timeline line chart and delivery status donut chart), create the 2 activity tables (recent campaigns and recent messages), connect everything in the dashboard page, and add auto-refresh every 30 seconds."
```

### To Check Progress:

```
"Show me what's been implemented so far and what's remaining for the dashboard"
```

### To Add a Feature:

```
"Add [feature name] to the dashboard"
```

Example: "Add export to CSV button to the dashboard"

### To Fix an Issue:

```
"The dashboard [issue description]. Fix it."
```

Example: "The dashboard charts are not rendering. Fix it."

### To Implement Specific Step:

```
"Create the [step name] from the dashboard implementation guide"
```

Example: "Create the dashboard stats API endpoint"

---

## 📁 File Locations

### ✅ Existing Files (Reference These)

| File                                                    | Purpose                             |
| ------------------------------------------------------- | ----------------------------------- |
| `src/hooks/useDashboardData.ts`                         | React Query patterns, line 88-193   |
| `src/components/dashboard/MetricsGrid.tsx`              | Metric card component, line 1-208   |
| `src/components/dashboard/CampaignPerformanceChart.tsx` | Recharts line chart example         |
| `src/app/api/dashboard/route.ts`                        | Query examples, line 14-60          |
| `src/app/api/messages/route.ts`                         | Unified SMS + Email queries         |
| `src/app/api/campaigns/route.ts`                        | Campaign API, line 22-45            |
| `src/lib/supabase.ts`                                   | Use `supabaseAdmin` for server-side |

### ⚠️ New Files to Create

| File                                                 | Reference                                     |
| ---------------------------------------------------- | --------------------------------------------- |
| `src/app/api/dashboard/stats/route.ts`               | Follow `dashboard/route.ts` patterns          |
| `src/app/api/dashboard/messages-timeline/route.ts`   | Follow `messages/route.ts` date queries       |
| `src/app/api/dashboard/delivery-status/route.ts`     | Follow `messages/route.ts` status filters     |
| `src/components/dashboard/MessagesTimelineChart.tsx` | Copy `CampaignPerformanceChart.tsx` structure |
| `src/components/dashboard/DeliveryStatusChart.tsx`   | Use Recharts PieChart (donut)                 |
| `src/components/dashboard/RecentCampaignsTable.tsx`  | Follow `campaigns/page.tsx` table (line 890+) |
| `src/components/dashboard/RecentMessagesTable.tsx`   | Follow `contacts/page.tsx` table (line 890+)  |

---

## 🎨 Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Header (existing - keep)                   │
└─────────────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Messages │ │Delivery  │ │  Active  │ │ Contacts │
│  Today   │ │   Rate   │ │Campaigns │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

┌────────────────────┐ ┌──────────────────────┐
│ Messages Timeline  │ │ Delivery Status      │
│ [Line Chart]       │ │ [Donut Chart]        │
└────────────────────┘ └──────────────────────┘

┌──────────────────────────┐ ┌──────────────────┐
│ Recent Campaigns (Top 5) │ │ Recent Messages  │
│ [Table]                  │ │ [Table]          │
└──────────────────────────┘ └──────────────────┘
```

---

## 📊 4 Metric Cards

1. **Messages Sent Today** - SMS + Email count, % vs yesterday
2. **Delivery Rate** - Overall %, color-coded (green/yellow/red)
3. **Active Campaigns** - Count with scheduled/completed today
4. **Total Contacts** - Count with email/phone breakdown

---

## 📈 2 Charts

1. **MessagesTimelineChart** - Line chart, SMS + Email, last 30 days
2. **DeliveryStatusChart** - Donut chart, Delivered/Failed/Pending

---

## 📋 2 Tables

1. **RecentCampaignsTable** - Top 5 campaigns by delivery rate
2. **RecentMessagesTable** - Last 50 messages, auto-refresh 30s

---

## 🔧 Key Implementation Details

### API Endpoints

- Use `supabaseAdmin` from `@/lib/supabase` for queries
- Return JSON: `{ success: true, data: {...} }`
- Handle errors gracefully

### React Query

- Use `useQuery` from `@tanstack/react-query`
- Add `refetchInterval: 30000` for 30-second auto-refresh
- Cache for 2-5 minutes

### Styling

- Follow existing card pattern: `bg-white p-6 rounded-lg shadow`
- Use same color scheme as campaigns/contacts pages
- Responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

---

## ✅ Testing Checklist

After implementation:

- [ ] `/api/dashboard/stats` returns correct data
- [ ] Charts render with real data
- [ ] Tables show correct information
- [ ] Auto-refresh works (30 seconds)
- [ ] Mobile responsive
- [ ] No console errors

---

## 📚 Full Documentation

- **Plan**: `docs/development/DASHBOARD_ANALYTICS_PLAN.md`
- **Guide**: `docs/development/DASHBOARD_IMPLEMENTATION_GUIDE.md`
- **This File**: `docs/development/DASHBOARD_QUICK_REFERENCE.md`

---

**Last Updated**: 2025-10-29
