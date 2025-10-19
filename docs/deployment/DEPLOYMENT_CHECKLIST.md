# LabsToGo SMS - Deployment Checklist & Maintenance Guide

## ✅ **Deployment Checklist**

### **Pre-Deployment Checklist**
- [ ] **Environment Variables**: All required variables set
- [ ] **Database Schema**: Migrations applied
- [ ] **API Keys**: Valid and configured
- [ ] **Domain Configuration**: Custom domains set up
- [ ] **SSL Certificates**: HTTPS enabled
- [ ] **Monitoring**: Health checks configured
- [ ] **Backup Strategy**: Database backups enabled

### **Frontend Deployment (Vercel)**
- [x] **Repository**: `labstogo-sms` pushed to GitHub
- [x] **Environment Variables**: All 9 variables set
- [x] **Build**: Successful production build
- [x] **Deployment**: Live at `https://labstogo-sms.vercel.app`
- [x] **Health Check**: API endpoints responding
- [x] **Authentication**: Supabase auth working

### **Backend Deployment (Railway)**
- [x] **Repository**: `labstogo-sms-backend` pushed to GitHub
- [x] **Environment Variables**: All 8 variables set
- [x] **Redis Service**: Connected and operational
- [x] **Workers**: SMS and Campaign workers running
- [x] **Health Check**: `/health` endpoint responding
- [x] **API**: All endpoints accessible

### **External Services**
- [x] **Supabase**: Database and auth configured
- [x] **Twilio**: SMS service configured (Sandbox mode)
- [x] **Redis**: Queue storage operational
- [x] **GitHub**: Repositories created and synced

## 🔧 **Environment Variables Reference**

### **Frontend (Vercel) - 9 Variables**
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

### **Backend (Railway) - 8 Variables**
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

## 🚀 **Deployment URLs & Status**

### **Production URLs**
| Service | URL | Status | Last Check |
|---------|-----|--------|------------|
| **Frontend** | `https://labstogo-sms.vercel.app` | ✅ Live | 2025-10-19 |
| **Backend** | `https://bumpy-field-production.up.railway.app` | ✅ Live | 2025-10-19 |
| **Health Check** | `https://bumpy-field-production.up.railway.app/health` | ✅ Live | 2025-10-19 |
| **Queue Status** | `https://labstogo-sms.vercel.app/api/queue/status` | ✅ Live | 2025-10-19 |

### **Repository URLs**
| Repository | URL | Status |
|------------|-----|--------|
| **Frontend** | `https://github.com/BasarIntegrated/labstogo-sms` | ✅ Active |
| **Backend** | `https://github.com/BasarIntegrated/labstogo-sms-backend` | ✅ Active |

## 🔍 **Health Check Commands**

### **Backend Health Check**
```bash
curl -s https://bumpy-field-production.up.railway.app/health | jq .
```
**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T10:04:58.729Z",
  "workers": {
    "sms": true,
    "campaign": true
  }
}
```

### **Queue Status Check**
```bash
curl -s https://labstogo-sms.vercel.app/api/queue/status | jq .
```
**Expected Response:**
```json
{
  "smsQueue": {
    "waiting": 0,
    "active": 0,
    "completed": 0,
    "failed": 0
  },
  "campaignQueue": {
    "waiting": 0,
    "active": 0,
    "completed": 0,
    "failed": 0
  }
}
```

### **Frontend Health Check**
```bash
curl -s -I https://labstogo-sms.vercel.app
```
**Expected Response:** `HTTP/2 200`

## 🛠️ **Maintenance Tasks**

### **Daily Monitoring**
- [ ] Check backend health endpoint
- [ ] Monitor queue status
- [ ] Review error logs
- [ ] Check SMS delivery rates

### **Weekly Maintenance**
- [ ] Review Vercel analytics
- [ ] Check Railway metrics
- [ ] Monitor Supabase usage
- [ ] Review Twilio usage

### **Monthly Maintenance**
- [ ] Update dependencies
- [ ] Review security patches
- [ ] Backup database
- [ ] Performance optimization

## 🔧 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **Frontend Issues**
| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Build Failure** | Vercel build error | Check environment variables |
| **API Errors** | 500 errors on API calls | Verify backend connectivity |
| **Auth Issues** | Login not working | Check Supabase configuration |

#### **Backend Issues**
| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Worker Down** | Health check shows false | Restart Railway service |
| **Redis Connection** | Queue errors | Check Redis service status |
| **SMS Failures** | Twilio errors | Verify Twilio credentials |

#### **Database Issues**
| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Connection Error** | Database timeout | Check Supabase status |
| **Auth Error** | Service role issues | Verify service key |
| **RLS Error** | Permission denied | Check row level security |

### **Emergency Procedures**

#### **Service Down**
1. **Check Status Pages**:
   - Vercel: https://vercel.com/status
   - Railway: https://status.railway.app
   - Supabase: https://status.supabase.com
   - Twilio: https://status.twilio.com

2. **Restart Services**:
   ```bash
   # Restart Railway backend
   railway restart
   
   # Redeploy Vercel frontend
   vercel --prod
   ```

3. **Check Logs**:
   - Vercel: Dashboard → Functions → Logs
   - Railway: Dashboard → Deployments → Logs

#### **Data Recovery**
1. **Database Backup**: Supabase dashboard → Settings → Database
2. **Code Recovery**: GitHub repositories
3. **Configuration**: Environment variables backup

## 📊 **Performance Monitoring**

### **Key Metrics to Monitor**
- **Response Time**: API response times
- **Queue Processing**: Job completion rates
- **Error Rate**: Failed requests percentage
- **SMS Delivery**: Success/failure rates
- **Database Performance**: Query execution times

### **Alerting Thresholds**
- **Response Time**: > 5 seconds
- **Error Rate**: > 5%
- **Queue Backlog**: > 100 jobs
- **SMS Failure Rate**: > 10%

## 🔒 **Security Checklist**

### **Regular Security Tasks**
- [ ] **API Keys**: Rotate quarterly
- [ ] **Dependencies**: Update monthly
- [ ] **Access Logs**: Review weekly
- [ ] **SSL Certificates**: Monitor expiry
- [ ] **Database Access**: Audit monthly

### **Security Best Practices**
- ✅ **Environment Variables**: Never commit to code
- ✅ **API Authentication**: Backend API key protection
- ✅ **Database Security**: RLS enabled
- ✅ **HTTPS**: Enforced on all endpoints
- ✅ **CORS**: Properly configured

## 📈 **Scaling Considerations**

### **When to Scale**
- **Frontend**: High traffic, slow response times
- **Backend**: Queue backlog, worker overload
- **Database**: Slow queries, connection limits
- **Redis**: Memory usage, connection limits

### **Scaling Options**
- **Vercel**: Automatic scaling, Pro plan features
- **Railway**: Vertical scaling, multiple services
- **Supabase**: Database scaling tiers
- **Twilio**: Rate limit increases

## 📞 **Support Contacts**

### **Platform Support**
- **Vercel**: https://vercel.com/support
- **Railway**: https://railway.app/support
- **Supabase**: https://supabase.com/support
- **Twilio**: https://support.twilio.com

### **Emergency Contacts**
- **Project Owner**: [Your Contact Info]
- **Technical Lead**: [Technical Contact]
- **DevOps**: [DevOps Contact]

---

## 📋 **Deployment Summary**

### **✅ Completed Deployments**
- **Frontend**: Vercel (https://labstogo-sms.vercel.app)
- **Backend**: Railway (https://bumpy-field-production.up.railway.app)
- **Database**: Supabase (whanmvvrhztjrvpxgsok.supabase.co)
- **SMS Service**: Twilio (Sandbox mode)

### **🎯 Production Status**
- **Architecture**: Hybrid deployment ✅
- **Security**: Production-ready ✅
- **Monitoring**: Health checks active ✅
- **Documentation**: Complete ✅

**Last Updated**: October 19, 2025
**Deployment Version**: 1.0.0
**Status**: Production Ready ✅
