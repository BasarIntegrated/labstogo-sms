/**
 * @jest-environment node
 */

import { GET } from '@/app/api/queue/status/route'
import { NextRequest } from 'next/server'

// Mock BullMQ
const mockQueue = {
  getWaiting: jest.fn().mockResolvedValue([]),
  getActive: jest.fn().mockResolvedValue([]),
  getCompleted: jest.fn().mockResolvedValue([]),
  getFailed: jest.fn().mockResolvedValue([]),
  getJobs: jest.fn().mockResolvedValue([]),
}

jest.mock('@/lib/queue', () => ({
  smsQueue: mockQueue,
  campaignQueue: mockQueue,
}))

describe('/api/queue/status', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return queue status', async () => {
    // Mock queue data
    mockQueue.getWaiting.mockResolvedValue([{ id: '1', name: 'test-job' }])
    mockQueue.getActive.mockResolvedValue([{ id: '2', name: 'active-job' }])
    mockQueue.getCompleted.mockResolvedValue([{ id: '3', name: 'completed-job' }])
    mockQueue.getFailed.mockResolvedValue([{ id: '4', name: 'failed-job' }])
    mockQueue.getJobs.mockResolvedValue([
      { 
        id: '1', 
        name: 'test-job', 
        queue: 'sms',
        getState: jest.fn().mockResolvedValue('waiting'),
        timestamp: Date.now(),
      },
    ])

    const request = new NextRequest('http://localhost:3000/api/queue/status')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('smsQueue')
    expect(data).toHaveProperty('campaignQueue')
    expect(data).toHaveProperty('recentJobs')
    
    expect(data.smsQueue).toHaveProperty('waiting')
    expect(data.smsQueue).toHaveProperty('active')
    expect(data.smsQueue).toHaveProperty('completed')
    expect(data.smsQueue).toHaveProperty('failed')
    
    expect(data.campaignQueue).toHaveProperty('waiting')
    expect(data.campaignQueue).toHaveProperty('active')
    expect(data.campaignQueue).toHaveProperty('completed')
    expect(data.campaignQueue).toHaveProperty('failed')
  })

  it('should handle empty queues', async () => {
    // Mock empty queues
    mockQueue.getWaiting.mockResolvedValue([])
    mockQueue.getActive.mockResolvedValue([])
    mockQueue.getCompleted.mockResolvedValue([])
    mockQueue.getFailed.mockResolvedValue([])
    mockQueue.getJobs.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/queue/status')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.smsQueue.waiting).toBe(0)
    expect(data.smsQueue.active).toBe(0)
    expect(data.smsQueue.completed).toBe(0)
    expect(data.smsQueue.failed).toBe(0)
    expect(data.recentJobs).toEqual([])
  })

  it('should handle queue errors', async () => {
    // Mock queue errors
    mockQueue.getWaiting.mockRejectedValue(new Error('Queue error'))
    mockQueue.getActive.mockRejectedValue(new Error('Queue error'))
    mockQueue.getCompleted.mockRejectedValue(new Error('Queue error'))
    mockQueue.getFailed.mockRejectedValue(new Error('Queue error'))
    mockQueue.getJobs.mockRejectedValue(new Error('Queue error'))

    const request = new NextRequest('http://localhost:3000/api/queue/status')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch queue status')
  })
})
