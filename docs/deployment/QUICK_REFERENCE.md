# LabsToGo SMS - Quick Reference Guide

## 🚀 **Quick Access URLs**

### **Production Applications**
- **Frontend**: https://labstogo-sms.vercel.app
- **Backend**: https://bumpy-field-production.up.railway.app
- **Health Check**: https://bumpy-field-production.up.railway.app/health
- **Queue Status**: https://labstogo-sms.vercel.app/api/queue/status

### **Repositories**
- **Frontend**: https://github.com/BasarIntegrated/labstogo-sms
- **Backend**: https://github.com/BasarIntegrated/labstogo-sms-backend

### **Platform Dashboards**
- **Vercel**: https://vercel.com/dashboard
- **Railway**: https://railway.app/dashboard
- **Supabase**: https://supabase.com/dashboard
- **Twilio**: https://console.twilio.com

## 🔧 **Quick Commands**

### **Health Checks**
```bash
# Backend health
curl -s https://bumpy-field-production.up.railway.app/health | jq .

# Queue status
curl -s https://labstogo-sms.vercel.app/api/queue/status | jq .

# Frontend status
curl -s -I https://labstogo-sms.vercel.app
```

### **Deployment Commands**
```bash
# Frontend deployment
vercel --prod

# Backend deployment (auto via Railway)
git push origin main

# Environment variables
vercel env ls
railway variables
```

### **Development Commands**
```bash
# Frontend development
cd /Users/roelabasa/Projects/mml/labstogo-sms
npm run dev

# Backend development
cd /Users/roelabasa/Projects/mml/labstogo-sms-backend
npm run dev
```

## 📊 **System Status**

### **Current Status** ✅
- **Frontend**: Live on Vercel
- **Backend**: Live on Railway
- **Database**: Connected to Supabase
- **SMS Service**: Twilio configured
- **Queue System**: BullMQ operational
- **Workers**: SMS & Campaign workers running

### **Architecture Summary**
```
Frontend (Vercel) ←→ Backend (Railway) ←→ Database (Supabase)
                           ↓
                    SMS Service (Twilio)
```

## 🔑 **Key Configuration**

### **Environment Variables Count**
- **Frontend**: 9 variables
- **Backend**: 8 variables
- **Total**: 17 environment variables

### **Services Status**
- **Supabase**: ✅ Connected
- **Twilio**: ✅ Sandbox mode
- **Redis**: ✅ Queue storage
- **BullMQ**: ✅ Workers active

## 📞 **Emergency Contacts**

### **Platform Support**
- **Vercel**: https://vercel.com/support
- **Railway**: https://railway.app/support
- **Supabase**: https://supabase.com/support
- **Twilio**: https://support.twilio.com

### **Status Pages**
- **Vercel**: https://vercel.com/status
- **Railway**: https://status.railway.app
- **Supabase**: https://status.supabase.com
- **Twilio**: https://status.twilio.com

---

**Last Updated**: October 19, 2025
**Quick Reference Version**: 1.0.0
