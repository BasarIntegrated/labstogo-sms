# LabsToGo SMS Frontend

Professional SMS campaign management frontend built with Next.js, React, and Tailwind CSS.

## 🚀 Features

- **Patient Management**: Import and manage patient data
- **Campaign Builder**: Create and manage SMS campaigns
- **Dashboard Analytics**: Real-time campaign performance metrics
- **Queue Monitoring**: Live queue status and worker monitoring
- **Settings Management**: Configure SMS and system settings
- **Responsive Design**: Mobile-first, modern UI

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **State Management**: React Query
- **Deployment**: Vercel

## 📦 Installation

```bash
npm install
```

## 🔧 Environment Variables

Create `.env.local` and configure:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
BACKEND_API_KEY=your_backend_api_key
```

## 🚀 Development

```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 🚀 Production

```bash
npm start
```

## 📱 Pages

- `/` - Dashboard
- `/patients` - Patient management
- `/campaigns` - Campaign builder
- `/contacts` - Contact management
- `/settings` - System settings
- `/templates` - Message templates

## 🚀 Deployment

Deployed on Vercel:

- **Frontend**: Next.js application
- **Domain**: Custom domain support
- **CDN**: Global edge network
- **Analytics**: Built-in performance monitoring

## 🔗 Related

- **Backend**: [labstogo-sms-backend](https://github.com/BasarIntegrated/labstogo-sms-backend)
- **Documentation**:
  - [Hybrid Deployment Guide](docs/deployment/HYBRID_DEPLOYMENT_GUIDE.md)
  - [System Architecture](docs/deployment/SYSTEM_ARCHITECTURE.md)
  - [Deployment Checklist](docs/deployment/DEPLOYMENT_CHECKLIST.md)
  - [Quick Reference](docs/deployment/QUICK_REFERENCE.md)

## 🏗️ Architecture

This is a **hybrid deployment** with:

- **Frontend**: Next.js on Vercel
- **Backend**: Node.js/Express on Railway
- **Database**: Supabase
- **Queue**: BullMQ with Redis
- **SMS**: Twilio integration
