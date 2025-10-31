# 📊 Dashboard Analytics - Minimal & Efficient Plan

## 🎯 Goal

Create a focused, actionable dashboard that provides immediate value with minimal complexity.

---

## 📈 Core Metrics (Top Row - 4 Cards)

### 1. **Messages Sent Today**

- Large number: Total SMS + Email sent today
- Trend: % change vs yesterday
- Color: Blue

### 2. **Delivery Rate**

- Large number: Overall delivery success %
- Trend: % change vs last 7 days
- Target: 95% (show if below)
- Color: Green (if >95%), Yellow (90-95%), Red (<90%)

### 3. **Active Campaigns**

- Large number: Count of active campaigns
- Sub-text: "X scheduled, Y completed today"
- Color: Purple

### 4. **Total Contacts**

- Large number: Active contacts count
- Sub-text: "X with email, Y with phone"
- Color: Orange

---

## 📊 Essential Charts (2 Sections)

### Section 1: Campaign Performance

**Chart: Messages Over Time (Last 30 Days)**

- Type: Line chart with dual lines (SMS + Email)
- X-axis: Date
- Y-axis: Message count
- Show: Daily messages sent
- Interactive: Hover to see exact counts

**Chart: Delivery Status Breakdown**

- Type: Donut chart
- Segments: Delivered, Failed, Pending
- Show percentages
- Click to filter campaigns

---

### Section 2: Recent Activity

**Table: Top 5 Recent Campaigns**

- Columns: Name, Type, Messages, Delivery Rate, Status
- Sortable by delivery rate
- Click to view campaign details

**Table: Recent Messages (Last 50)**

- Columns: Contact, Type (SMS/Email), Status, Sent At
- Status badges (Sent/Delivered/Failed)
- Auto-refresh every 30 seconds

---

## 🗄️ Data Queries (Minimal)

### API Endpoint: `/api/dashboard/stats`

Returns:

```json
{
  "messagesToday": {
    "sms": 45,
    "email": 32,
    "total": 77,
    "change": 5.2 // % vs yesterday
  },
  "deliveryRate": {
    "overall": 94.5,
    "sms": 96.2,
    "email": 92.1,
    "change": -1.3 // % vs last 7 days
  },
  "activeCampaigns": {
    "active": 3,
    "scheduled": 1,
    "completedToday": 2
  },
  "contacts": {
    "total": 61,
    "withEmail": 25,
    "withPhone": 58
  }
}
```

### API Endpoint: `/api/dashboard/messages-timeline`

Returns last 30 days:

```json
{
  "data": [
    { "date": "2025-10-01", "sms": 10, "email": 5 },
    { "date": "2025-10-02", "sms": 15, "email": 8 }
  ]
}
```

### API Endpoint: `/api/dashboard/delivery-status`

Returns:

```json
{
  "delivered": 850,
  "failed": 50,
  "pending": 12,
  "total": 912
}
```

---

## 🎨 Implementation Steps

### Step 1: Create API Endpoints (2 hours)

- [ ] `/api/dashboard/stats` - Aggregated metrics
- [ ] `/api/dashboard/messages-timeline` - Time series data
- [ ] `/api/dashboard/delivery-status` - Status breakdown

### Step 2: Build Metric Cards (1 hour)

- [ ] Reusable `MetricCard` component
- [ ] 4 cards in top row
- [ ] Trend indicators (↑↓)

### Step 3: Add Charts (2 hours)

- [ ] Messages timeline line chart (Recharts)
- [ ] Delivery status donut chart (Recharts)

### Step 4: Add Activity Tables (1 hour)

- [ ] Recent campaigns table
- [ ] Recent messages table
- [ ] Auto-refresh functionality

**Total Estimated Time: 6 hours**

---

## 🔧 Technical Implementation

### Database Queries

**Daily Messages:**

```sql
SELECT
  COUNT(*) FILTER (WHERE table_name = 'sms_messages') as sms,
  COUNT(*) FILTER (WHERE table_name = 'email_messages') as email
FROM (
  SELECT 'sms_messages' as table_name, sent_at FROM sms_messages WHERE DATE(sent_at) = CURRENT_DATE
  UNION ALL
  SELECT 'email_messages' as table_name, sent_at FROM email_messages WHERE DATE(sent_at) = CURRENT_DATE
) combined;
```

**Delivery Rate:**

```sql
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN status IN ('delivered', 'sent') THEN 1 ELSE 0 END) as successful,
  ROUND(SUM(CASE WHEN status IN ('delivered', 'sent') THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as rate
FROM (
  SELECT status FROM sms_messages WHERE created_at > NOW() - INTERVAL '7 days'
  UNION ALL
  SELECT status FROM email_messages WHERE created_at > NOW() - INTERVAL '7 days'
) all_messages;
```

**Messages Timeline:**

```sql
SELECT
  DATE(sent_at) as date,
  'sms' as type,
  COUNT(*) as count
FROM sms_messages
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(sent_at)
UNION ALL
SELECT
  DATE(sent_at) as date,
  'email' as type,
  COUNT(*) as count
FROM email_messages
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(sent_at)
ORDER BY date;
```

---

## ✅ Success Criteria

- Dashboard loads in < 1 second
- All 4 metrics visible at a glance
- Charts provide actionable insights
- Real-time data updates every 30 seconds
- Mobile-responsive layout

---

## 🚀 Quick Wins

1. **Immediate Value**: See daily activity at a glance
2. **Problem Detection**: Spot delivery issues instantly
3. **Performance Tracking**: Monitor campaign success
4. **Low Maintenance**: Simple queries, easy to extend

---

## 📝 Future Enhancements (When Needed)

- Date range selector
- Export to CSV
- More detailed campaign drill-down
- Contact engagement metrics
- System health indicators

---

**Version**: Minimal MVP  
**Last Updated**: 2025-10-29  
**Estimated Build Time**: 6 hours
