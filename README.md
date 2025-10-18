# LabsToGo SMS - Message Blasting App

A comprehensive SMS and email campaign management platform for medical laboratories, built with Next.js 15 and Supabase.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Supabase
npx supabase start
npx supabase db reset

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

## 📚 Documentation

For detailed documentation, setup guides, and API references, see the [Documentation](docs/README.md) directory.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Next.js API Routes
- **SMS**: Twilio Integration
- **Queue**: BullMQ (optional)

## ✨ Features

- 📱 **Contact Management** - Import and organize patient contacts
- 📧 **Campaign Builder** - Create SMS and email campaigns
- 📊 **Analytics Dashboard** - Track campaign performance
- 🔧 **Template System** - Reusable message templates
- ⚙️ **Settings Management** - Configurable application settings

## 🔧 Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Code linting
- `npm run test` - Run tests

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
