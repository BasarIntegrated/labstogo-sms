# Scripts Directory

This directory contains essential utility scripts for the LabsToGo SMS application.

## Current Scripts

- `clear-contacts.ts` - Utility script to clear all contacts from the database

## Usage

To run a script:

```bash
# Install dependencies first
npm install

# Run a script
npx tsx scripts/clear-contacts.ts
```

## Environment Setup

Make sure you have a `.env.local` file with the required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Other required variables as specified in `env.example`

## Notes

- Scripts use TypeScript and require `tsx` for execution
- All scripts connect to the Supabase database using the service role key
- Use scripts responsibly as they can modify production data
