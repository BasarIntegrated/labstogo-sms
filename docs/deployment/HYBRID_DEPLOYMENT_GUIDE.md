# LabsToGo SMS - Hybrid Deployment Documentation

## 🎯 **Project Overview**

**LabsToGo SMS** is a professional SMS campaign management system built with a modern hybrid architecture, featuring separate frontend and backend deployments optimized for their respective platforms.

## 🏗️ **System Architecture**

### **High-Level Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│   (Supabase)   │
│                 │    │                 │    │                 │
│ • Next.js UI    │    │ • Express API   │    │ • PostgreSQL   │
│ • React Components│   │ • BullMQ Workers│    │ • Auth         │
│ • API Routes    │    │ • Redis Queue   │    │ • Real-time    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   SMS Service   │
         └──────────────►│   (Twilio)      │
                        │                 │
                        │ • SMS Delivery  │
                        │ • Sandbox Mode  │
                        └─────────────────┘
```

### **Deployment Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCTION ENVIRONMENT                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │   VERCEL        │              │   RAILWAY       │           │
│  │                 │              │                 │           │
│  │ Frontend        │              │ Backend         │           │
│  │ • Next.js 15    │              │ • Node.js       │           │
│  │ • React 18      │              │ • Express       │           │
│  │ • Tailwind CSS  │              │ • BullMQ        │           │
│  │ • TypeScript    │              │ • Redis         │           │
│  │                 │              │ • TypeScript    │           │
│  │ URL: labstogo-  │              │                 │           │
│  │ sms.vercel.app  │              │ URL: bumpy-     │           │
│  └─────────────────┘              │ field-production│           │
│           │                        │ .up.railway.app│           │
│           │                        └─────────────────┘           │
│           │                                │                     │
│           │                                │                     │
│           ▼                                ▼                     │
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │   SUPABASE      │              │   TWILIO        │           │
│  │                 │              │                 │           │
│  │ • PostgreSQL    │              │ • SMS API       │           │
│  │ • Auth          │              │ • Sandbox Mode  │           │
│  │ • Real-time     │              │ • Phone Numbers │           │
│  │ • Storage       │              │                 │           │
│  └─────────────────┘              └─────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 **Repository Structure**

### **Frontend Repository** (`labstogo-sms`)

```
/Users/roelabasa/Projects/mml/labstogo-sms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (proxy to backend)
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── patients/          # Patient management
│   │   ├── campaigns/         # Campaign builder
│   │   └── settings/          # System settings
│   ├── components/            # React components
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── patients/         # Patient components
│   │   ├── campaigns/        # Campaign components
│   │   └── ui/               # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   └── types/                # TypeScript definitions
├── .env.local                # Environment variables
├── package.json             # Frontend dependencies
└── README.md                # Frontend documentation
```

### **Backend Repository** (`labstogo-sms-backend`)

```
/Users/roelabasa/Projects/mml/labstogo-sms-backend/
├── src/
│   ├── api/                 # Express API routes
│   ├── lib/                 # Core libraries
│   │   ├── queue.ts         # BullMQ configuration
│   │   ├── sms.ts           # SMS processing
│   │   ├── supabase.ts      # Database client
│   │   └── twilio.ts        # Twilio integration
│   └── workers/             # Background workers
├── package.json             # Backend dependencies
├── railway.json             # Railway deployment config
└── README.md                # Backend documentation
```

## 🔧 **Environment Variables**

### **Frontend (Vercel)**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://whanmvvrhztjrvpxgsok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend Integration
BACKEND_URL=https://bumpy-field-production.up.railway.app
BACKEND_API_KEY=dev-key

# Twilio Configuration
TWILIO_SANDBOX_MODE=true
TWILIO_ACCOUNT_SID=AC[YOUR_TWILIO_ACCOUNT_SID]
TWILIO_AUTH_TOKEN=34c9e149797c5503a0141bfe10a72e45
TWILIO_PHONE_NUMBER=+14234559907
```

### **Backend (Railway)**

```bash
# Server Configuration
NODE_ENV=production
PORT=3001

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://whanmvvrhztjrvpxgsok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Twilio Configuration
TWILIO_ACCOUNT_SID=AC[YOUR_TWILIO_ACCOUNT_SID]
TWILIO_AUTH_TOKEN=34c9e149797c5503a0141bfe10a72e45
TWILIO_PHONE_NUMBER=+14234559907
TWILIO_SANDBOX_MODE=true

# Redis Configuration
REDIS_URL=redis://redis.railway.internal:6379
```

## 🚀 **Deployment URLs**

| Service            | Platform | URL                                                    | Status  |
| ------------------ | -------- | ------------------------------------------------------ | ------- |
| **Frontend**       | Vercel   | `https://labstogo-sms.vercel.app`                      | ✅ Live |
| **Backend**        | Railway  | `https://bumpy-field-production.up.railway.app`        | ✅ Live |
| **Backend Health** | Railway  | `https://bumpy-field-production.up.railway.app/health` | ✅ Live |
| **Queue Status**   | Frontend | `https://labstogo-sms.vercel.app/api/queue/status`     | ✅ Live |

## 🔄 **Data Flow Architecture**

### **SMS Campaign Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Action   │    │   Frontend       │    │   Backend        │
│                 │    │   (Vercel)       │    │   (Railway)      │
│ 1. Create       │───►│ 2. API Call      │───►│ 3. Queue Job     │
│    Campaign     │    │    /api/campaigns│    │    BullMQ        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SMS Delivery  │    │   Twilio API    │    │   Worker        │
│                 │◄───│                 │◄───│   Process       │
│ 6. Send SMS     │    │ 5. SMS Request  │    │ 4. Job Queue    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Queue Processing Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Campaign      │    │   SMS Queue     │    │   SMS Worker    │
│   Queue         │    │   (BullMQ)      │    │   (Railway)     │
│                 │    │                 │    │                 │
│ • Start Campaign│───►│ • SMS Jobs      │───►│ • Process SMS   │
│ • Bulk Operations│    │ • Rate Limiting │    │ • Update Status │
│ • Scheduling    │    │ • Retry Logic   │    │ • Error Handling│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ **Technology Stack**

### **Frontend Stack**

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Query
- **Deployment**: Vercel

### **Backend Stack**

- **Runtime**: Node.js
- **Framework**: Express.js
- **Queue System**: BullMQ
- **Database Cache**: Redis
- **Language**: TypeScript
- **Deployment**: Railway

### **External Services**

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **SMS Service**: Twilio
- **File Storage**: Supabase Storage

## 📊 **API Endpoints**

### **Frontend API Routes** (Proxy to Backend)

```
GET  /api/queue/status          # Queue status
POST /api/campaigns/[id]/start  # Start campaign
GET  /api/campaigns/[id]        # Campaign details
POST /api/patients/import       # Patient import
GET  /api/dashboard             # Dashboard data
```

### **Backend API Routes**

```
GET  /health                    # Health check
GET  /queue/status              # Queue status
POST /api/campaigns/:id/start   # Start campaign
GET  /api/campaigns/:id/status  # Campaign status
```

## 🔒 **Security Configuration**

### **Authentication**

- **Frontend**: Supabase Auth with JWT tokens
- **Backend**: API key authentication (`BACKEND_API_KEY`)
- **Database**: Row Level Security (RLS) enabled

### **CORS Configuration**

- **Frontend**: Configured for Vercel domain
- **Backend**: Configured for frontend domain
- **API**: Secure headers and rate limiting

## 📈 **Monitoring & Observability**

### **Health Checks**

- **Backend**: `/health` endpoint with worker status
- **Frontend**: Built-in Vercel monitoring
- **Database**: Supabase dashboard monitoring

### **Queue Monitoring**

- **BullMQ Dashboard**: Available via Railway
- **Queue Status**: Real-time via API
- **Worker Status**: Health check endpoint

## 🚀 **Deployment Process**

### **Frontend Deployment**

```bash
# 1. Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add BACKEND_URL production
# ... (all other variables)

# 2. Deploy
vercel --prod
```

### **Backend Deployment**

```bash
# 1. Push to GitHub
git push origin main

# 2. Railway auto-deploys
# 3. Set environment variables in Railway dashboard
```

## 🔧 **Development Setup**

### **Frontend Development**

```bash
cd /Users/roelabasa/Projects/mml/labstogo-sms
npm install
npm run dev
# Runs on http://localhost:3000
```

### **Backend Development**

```bash
cd /Users/roelabasa/Projects/mml/labstogo-sms-backend
npm install
npm run dev
# Runs on http://localhost:3001
```

## 📝 **Best Practices Implemented**

### **Architecture**

- ✅ **Separation of Concerns**: Frontend and backend in separate repositories
- ✅ **Platform Optimization**: Each service optimized for its platform
- ✅ **Scalability**: Independent scaling of frontend and backend
- ✅ **Maintainability**: Clear boundaries and responsibilities

### **Security**

- ✅ **Environment Variables**: Secure configuration management
- ✅ **API Authentication**: Backend API key protection
- ✅ **Database Security**: RLS and service role keys
- ✅ **CORS Configuration**: Proper cross-origin setup

### **Performance**

- ✅ **CDN**: Vercel's global edge network
- ✅ **Caching**: Redis for queue operations
- ✅ **Optimization**: Next.js production optimizations
- ✅ **Monitoring**: Health checks and status endpoints

## 🎯 **Next Steps**

### **Production Readiness**

1. **Custom Domain**: Configure custom domain for Vercel
2. **SSL Certificates**: Automatic HTTPS via Vercel/Railway
3. **Monitoring**: Set up alerts and logging
4. **Backup**: Database backup strategy

### **Scaling Considerations**

1. **Redis Scaling**: Upgrade Railway Redis plan if needed
2. **Worker Scaling**: Add more worker instances
3. **Database Scaling**: Supabase scaling options
4. **CDN**: Vercel's global edge network

---

## 📞 **Support & Maintenance**

- **Frontend Issues**: Check Vercel dashboard and logs
- **Backend Issues**: Check Railway dashboard and logs
- **Database Issues**: Check Supabase dashboard
- **SMS Issues**: Check Twilio console

**Last Updated**: October 19, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
