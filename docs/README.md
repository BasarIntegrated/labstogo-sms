# LabsToGo SMS - Documentation

Welcome to the LabsToGo SMS Message Blasting App documentation. This application provides comprehensive SMS and email campaign management for medical laboratories.

## 📚 Documentation Structure

### 🚀 Setup & Installation

- [Setup Guide](docs/setup/SETUP_GUIDE.md) - Complete installation and configuration guide
- [Sandbox Setup](docs/setup/SANDBOX_SETUP.md) - Development environment setup
- [Twilio Sandbox Setup](docs/setup/TWILIO_SANDBOX_SETUP.md) - SMS service configuration
- [BullMQ Setup](docs/setup/BULLMQ_SETUP.md) - Queue management setup

### 💻 Development

- [Development Guidelines](docs/development/AI_DEVELOPMENT_GUIDELINES.md) - AI-assisted development guidelines
- [Development Roadmap](docs/development/DEVELOPMENT_ROADMAP.md) - Project roadmap and milestones
- [Implementation Commands](docs/development/IMPLEMENTATION_COMMANDS.md) - Common development commands
- [QA Report](docs/development/QA_REPORT.md) - Quality assurance report
- [Testing Summary](docs/development/TESTING_SUMMARY.md) - Testing overview and results

### 🔌 API Documentation

- [Patient Import API](docs/api/PATIENT_IMPORT_DOCUMENTATION.md) - Contact import functionality
- [Settings Guide](docs/api/SETTINGS_GUIDE.md) - Application settings configuration

### 📋 Specifications

- [Feature Specifications](specifications/features/) - Detailed feature specifications
- [Navigation Specifications](specifications/navigation/) - UI/UX specifications

## 🏗️ Project Structure

```
labstogo-sms/
├── docs/                    # Documentation
│   ├── setup/              # Setup guides
│   ├── development/         # Development docs
│   ├── deployment/         # Deployment guides
│   └── api/                # API documentation
├── src/                    # Source code
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   └── types/              # TypeScript types
├── scripts/                # Utility scripts
├── migrations/             # Database migrations
├── supabase/               # Supabase configuration
└── specifications/         # Feature specifications
```

## 🚀 Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Setup Supabase**

   ```bash
   npx supabase start
   npx supabase db reset
   ```

3. **Configure Environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- `users` - User accounts and authentication
- `contacts` - Patient/contact information
- `campaigns` - SMS/email campaigns
- `message_templates` - Reusable message templates
- `sms_messages` - SMS message history
- `campaign_recipients` - Campaign recipient tracking

## 🔐 Authentication

The application uses custom JWT-based authentication with role-based access control:

- **Admin** - Full system access
- **Standard** - Limited access to assigned campaigns

## 📱 Features

- **Contact Management** - Import, organize, and manage patient contacts
- **Campaign Builder** - Create SMS and email campaigns
- **Template System** - Reusable message templates with merge tags
- **Bulk Operations** - Mass contact operations and assignments
- **Analytics Dashboard** - Campaign performance and engagement metrics
- **Settings Management** - Configurable application settings

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **SMS Service**: Twilio
- **Queue Management**: BullMQ (optional)
- **Authentication**: Custom JWT implementation

## 📞 Support

For questions or issues, please refer to the appropriate documentation section or contact the development team.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
