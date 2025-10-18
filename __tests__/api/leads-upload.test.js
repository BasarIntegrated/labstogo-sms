/**
 * @jest-environment node
 */

import { POST } from '@/app/api/leads/upload/route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: { id: 'test-id', phone: '+15550101' }, 
        error: null 
      }),
    })),
  },
}))

jest.mock('csv-parser', () => {
  return jest.fn(() => ({
    on: jest.fn((event, callback) => {
      if (event === 'data') {
        // Simulate CSV data
        callback({ phone_number: '+15550101', first_name: 'Test', last_name: 'User' })
        callback({ phone_number: '+15550102', first_name: 'Another', last_name: 'User' })
      } else if (event === 'end') {
        callback()
      }
      return {
        on: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnThis(),
      }
    }),
    pipe: jest.fn().mockReturnThis(),
  }))
})

describe('/api/leads/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle missing file', async () => {
    const formData = new FormData()
    const request = new NextRequest('http://localhost:3000/api/leads/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('No file provided')
  })

  it('should handle non-CSV files', async () => {
    const formData = new FormData()
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/leads/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Only CSV files are allowed')
  })

  it('should process CSV file with skip strategy', async () => {
    const csvContent = 'phone_number,first_name,last_name\n+15550101,Test,User\n+15550102,Another,User'
    const formData = new FormData()
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    formData.append('file', file)
    formData.append('strategy', 'skip')

    const request = new NextRequest('http://localhost:3000/api/leads/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.strategy).toBe('skip')
    expect(data.summary.total).toBe(2)
  })

  it('should process CSV file with upsert strategy', async () => {
    const csvContent = 'phone_number,first_name,last_name\n+15550101,Test,User\n+15550102,Another,User'
    const formData = new FormData()
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    formData.append('file', file)
    formData.append('strategy', 'upsert')

    const request = new NextRequest('http://localhost:3000/api/leads/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.strategy).toBe('upsert')
    expect(data.summary.total).toBe(2)
  })

  it('should handle empty CSV file', async () => {
    const formData = new FormData()
    const file = new File([''], 'empty.csv', { type: 'text/csv' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/leads/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('No data found in CSV file')
  })

  it('should handle missing required fields', async () => {
    const csvContent = 'first_name,last_name\nTest,User'
    const formData = new FormData()
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/leads/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Missing required fields')
    expect(data.requiredFields).toContain('phone_number')
  })

  it('should clean and format phone numbers', async () => {
    const csvContent = 'phone_number,first_name\n5550101,Test\n+1-555-0102,Another'
    const formData = new FormData()
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/leads/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
