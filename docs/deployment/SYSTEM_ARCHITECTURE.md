# LabsToGo SMS - System Architecture Diagrams

## 🏗️ **System Architecture Overview**

### **High-Level Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                       │
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

## 🔄 **Data Flow Architecture**

### **SMS Campaign Processing Flow**
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

### **Queue Processing Architecture**
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

## 🌐 **Network Architecture**

### **Request Flow**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │   Vercel CDN    │    │   Railway       │
│                 │    │                 │    │   Backend       │
│ 1. Load Page    │───►│ 2. Serve Static │    │                 │
│ 2. API Request  │───►│ 3. Proxy API    │───►│ 4. Process      │
│ 3. Real-time    │◄───│ 4. Response     │◄───│ 5. Response     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Database Connections**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Supabase      │
│   (Vercel)      │    │   (Railway)     │    │   Database      │
│                 │    │                 │    │                 │
│ • Read Data     │───►│ • Admin Access  │───►│ • PostgreSQL    │
│ • User Auth     │───►│ • Service Role  │───►│ • Row Level     │
│ • Real-time     │───►│ • Bulk Ops      │───►│   Security      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 **Component Architecture**

### **Frontend Component Structure**
```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP ROUTER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Pages         │  │   Components    │  │   API Routes    │ │
│  │                 │  │                 │  │                 │ │
│  │ • /dashboard    │  │ • Dashboard     │  │ • /api/queue    │ │
│  │ • /patients     │  │ • Patients      │  │ • /api/campaigns│ │
│  │ • /campaigns    │  │ • Campaigns     │  │ • /api/patients │ │
│  │ • /settings     │  │ • Settings      │  │ • /api/dashboard│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Hooks         │  │   Libraries     │  │   Types         │ │
│  │                 │  │                 │  │                 │ │
│  │ • usePatients   │  │ • Supabase      │  │ • Database      │ │
│  │ • useCampaigns  │  │ • React Query   │  │ • Navigation    │ │
│  │ • useSettings   │  │ • Utils         │  │ • Queue         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **Backend Service Structure**
```
┌─────────────────────────────────────────────────────────────────┐
│                        EXPRESS SERVER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   API Routes    │  │   Workers       │  │   Libraries     │ │
│  │                 │  │                 │  │                 │ │
│  │ • /health       │  │ • SMS Worker    │  │ • Queue (BullMQ)│ │
│  │ • /queue/status │  │ • Campaign      │  │ • SMS (Twilio)  │ │
│  │ • /api/campaigns│  │   Worker        │  │ • Database      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Middleware    │  │   Configuration  │  │   Error         │ │
│  │                 │  │                 │  │   Handling      │ │
│  │ • CORS          │  │ • Environment   │  │ • Logging       │ │
│  │ • Auth          │  │ • Redis         │  │ • Monitoring    │ │
│  │ • Rate Limiting │  │ • Twilio        │  │ • Graceful      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 **Security Architecture**

### **Authentication Flow**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Login    │    │   Supabase      │    │   Frontend      │
│                 │    │   Auth          │    │   Session       │
│ 1. Credentials  │───►│ 2. Validate     │───►│ 3. JWT Token    │
│ 2. Submit       │    │ 3. Generate JWT │    │ 4. Store Token  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Request   │    │   Backend       │    │   Database       │
│                 │◄───│                 │◄───│                 │
│ 5. Authorized   │    │ 4. Verify API   │    │ 3. Service Role  │
│    Request      │    │    Key          │    │    Access        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Security Layers**
```
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Transport     │  │   Application   │  │   Database      │ │
│  │   Security      │  │   Security      │  │   Security      │ │
│  │                 │  │                 │  │                 │ │
│  │ • HTTPS/TLS     │  │ • JWT Tokens    │  │ • RLS Policies  │ │
│  │ • SSL Certs     │  │ • API Keys      │  │ • Service Roles │ │
│  │ • CORS Headers  │  │ • Rate Limiting │  │ • Encryption    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 **Monitoring Architecture**

### **Health Check Flow**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Services      │
│   Monitoring    │    │   Health Check  │    │   Status        │
│                 │    │                 │    │                 │
│ • Vercel        │───►│ • /health       │───►│ • SMS Worker    │
│   Analytics     │    │ • Worker Status │    │ • Campaign      │
│ • Error         │    │ • Queue Status  │    │   Worker        │
│   Tracking      │    │ • Redis Status  │    │ • Redis         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Queue Monitoring**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Queue Status  │    │   BullMQ        │    │   Redis         │
│   Dashboard     │    │   Dashboard     │    │   Monitoring    │
│                 │    │                 │    │                 │
│ • Job Counts    │◄───│ • Job Status    │◄───│ • Memory Usage  │
│ • Processing    │    │ • Worker Status │    │ • Connection    │
│   Times         │    │ • Error Logs    │    │   Status        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Deployment Architecture**

### **CI/CD Pipeline**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   Vercel        │    │   Railway       │
│   Repository    │    │   Deployment    │    │   Deployment    │
│                 │    │                 │    │                 │
│ • Frontend      │───►│ • Auto Deploy   │    │ • Auto Deploy   │
│   Push          │    │ • Build         │    │ • Build         │
│ • Backend       │───►│ • Environment   │    │ • Environment   │
│   Push          │    │   Variables     │    │   Variables     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Environment Configuration**
```
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT SETUP                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Development   │  │   Staging       │  │   Production    │ │
│  │                 │  │                 │  │                 │ │
│  │ • Localhost     │  │ • Preview URLs  │  │ • Custom Domain │ │
│  │ • Dev Database  │  │ • Staging DB    │  │ • Production DB │ │
│  │ • Sandbox SMS   │  │ • Sandbox SMS   │  │ • Live SMS      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 **Architecture Summary**

### **Key Architectural Decisions**
1. **Hybrid Deployment**: Frontend on Vercel, Backend on Railway
2. **Separate Repositories**: Independent development and deployment
3. **Queue-Based Processing**: BullMQ for reliable SMS processing
4. **Database-First**: Supabase for data, auth, and real-time features
5. **API Gateway Pattern**: Frontend API routes proxy to backend

### **Scalability Considerations**
- **Horizontal Scaling**: Multiple worker instances
- **Vertical Scaling**: Platform-specific scaling options
- **Database Scaling**: Supabase scaling tiers
- **CDN**: Vercel's global edge network

### **Reliability Features**
- **Health Checks**: Comprehensive monitoring
- **Error Handling**: Graceful degradation
- **Retry Logic**: BullMQ retry mechanisms
- **Backup Strategy**: Database backups

**Last Updated**: October 19, 2025
**Architecture Version**: 1.0.0
**Status**: Production Ready ✅
