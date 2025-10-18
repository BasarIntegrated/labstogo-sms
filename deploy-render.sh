#!/bin/bash

# Render Deployment Script
echo "🚀 Preparing for Render deployment..."

# Build the backend
echo "📦 Building backend..."
cd backend
npm install
npm run build

echo "✅ Backend built successfully!"
echo "🌐 Ready for Render deployment"
echo ""
echo "Next steps:"
echo "1. Push to GitHub"
echo "2. Connect to Render.com"
echo "3. Use render.yaml configuration"
echo "4. Set environment variables in Render dashboard"
