# BullMQ Setup Guide

This guide explains how to set up and use BullMQ (Node.js equivalent of Celery) for background job processing in your LabsToGo SMS blaster.

## What is BullMQ?

BullMQ is a Node.js library for handling jobs and messages in a distributed environment. It's the modern equivalent of Celery in the Python ecosystem, providing:

- **Job Queues**: Store and process background jobs
- **Redis Backend**: Uses Redis for job storage and coordination
- **Retry Logic**: Automatic retry with exponential backoff
- **Rate Limiting**: Control job processing speed
- **Monitoring**: Built-in job monitoring and statistics
- **Scalability**: Run multiple workers across different machines

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Next.js App   │───▶│     Redis    │◀───│  BullMQ Worker  │
│                 │    │   (Queue)    │    │                 │
│ - Campaign API  │    │              │    │ - SMS Sending   │
│ - Lead Upload   │    │              │    │ - Campaign Start│
└─────────────────┘    └──────────────┘    └─────────────────┘
```

## Setup Instructions

### 1. Install Redis

**Option A: Using Docker (Recommended)**

```bash
# Start Redis with Docker Compose
docker-compose up -d redis

# Or start Redis directly
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

**Option B: Local Installation**

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server

# Windows
# Download from https://redis.io/download
```

### 2. Environment Variables

Add to your `.env.local`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Leave empty for local development
```

### 3. Start the Workers

**Development Mode:**

```bash
# Start the BullMQ workers
npm run worker:dev

# In another terminal, start the Next.js app
npm run dev
```

**Production Mode:**

```bash
# Start workers
npm run worker

# Start Next.js app
npm run start
```

## Job Types

### 1. Campaign Start Jobs

- **Queue**: `campaign-start`
- **Purpose**: Initialize campaigns and create SMS jobs
- **Data**: `{ campaignId, leadIds }`

### 2. SMS Sending Jobs

- **Queue**: `sms-processing`
- **Purpose**: Send individual SMS messages
- **Data**: `{ campaignId, leadId, phoneNumber, message, lead, campaign }`

## Job Processing Flow

1. **Campaign Start**:

   ```
   User clicks "Start Campaign"
   → API creates campaign start job
   → Worker processes campaign start job
   → Creates SMS message records
   → Adds SMS jobs to queue
   ```

2. **SMS Sending**:
   ```
   SMS job in queue
   → Worker picks up job
   → Personalizes message
   → Sends via Twilio
   → Updates database
   → Handles retries on failure
   ```

## Monitoring

### Queue Status API

```bash
curl http://localhost:3000/api/queue/status
```

### Redis Commander (Optional)

```bash
# Start Redis Commander for web UI
docker-compose up -d redis-commander
# Visit http://localhost:8081
```

## Configuration Options

### Concurrency

```typescript
// Process up to 5 SMS jobs concurrently
concurrency: 5;
```

### Rate Limiting

```typescript
// Max 10 jobs per second
limiter: {
  max: 10,
  duration: 1000,
}
```

### Retry Logic

```typescript
// 3 attempts with exponential backoff
attempts: 3,
backoff: {
  type: 'exponential',
  delay: 2000,
}
```

## Scaling

### Multiple Workers

Run multiple worker processes:

```bash
# Terminal 1
npm run worker

# Terminal 2
npm run worker

# Terminal 3
npm run worker
```

### Different Machines

- Install Redis on a central server
- Run workers on different machines
- Point all workers to the same Redis instance

## Error Handling

### Job Failures

- Jobs automatically retry on failure
- Failed jobs are stored for debugging
- Error messages are logged and stored

### Worker Crashes

- Jobs remain in Redis queue
- Other workers can pick up jobs
- No data loss on worker restart

## Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start workers with PM2
pm2 start src/scripts/worker.ts --name "sms-worker" --instances 4

# Monitor workers
pm2 monit
```

### Using Docker

```dockerfile
# Dockerfile.worker
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "worker"]
```

### Using Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sms-worker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sms-worker
  template:
    metadata:
      labels:
        app: sms-worker
    spec:
      containers:
        - name: worker
          image: your-app:latest
          command: ["npm", "run", "worker"]
          env:
            - name: REDIS_HOST
              value: "redis-service"
```

## Benefits over Simple Job Processing

1. **Reliability**: Jobs persist in Redis, won't be lost
2. **Scalability**: Easy to scale horizontally
3. **Monitoring**: Built-in job monitoring and statistics
4. **Retry Logic**: Sophisticated retry mechanisms
5. **Rate Limiting**: Built-in rate limiting
6. **Dead Letter Queues**: Handle permanently failed jobs
7. **Job Priorities**: Process high-priority jobs first
8. **Scheduling**: Schedule jobs for future execution

## Troubleshooting

### Common Issues

1. **Redis Connection Error**:

   - Check if Redis is running
   - Verify connection settings
   - Check firewall rules

2. **Jobs Not Processing**:

   - Ensure workers are running
   - Check Redis connection
   - Verify job data format

3. **High Memory Usage**:
   - Configure job cleanup
   - Set `removeOnComplete` and `removeOnFail`
   - Monitor Redis memory usage

### Debug Mode

```bash
# Enable debug logging
DEBUG=bullmq* npm run worker
```

This BullMQ setup provides a robust, scalable solution for background job processing that's equivalent to Celery in the Python ecosystem!
