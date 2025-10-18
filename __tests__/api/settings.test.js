/**
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/settings/route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: { id: 'test-id', settings: {} }, 
        error: null 
      }),
    })),
  },
}))

describe('/api/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return default settings', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.settings).toHaveProperty('sms')
      expect(data.settings).toHaveProperty('email')
      expect(data.settings).toHaveProperty('general')
      expect(data.settings).toHaveProperty('notifications')
      expect(data.settings).toHaveProperty('security')
    })

    it('should handle missing Supabase admin client', async () => {
      // Mock supabaseAdmin as null
      jest.doMock('@/lib/supabase', () => ({
        supabaseAdmin: null,
      }))

      const request = new NextRequest('http://localhost:3000/api/settings')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Supabase admin client not configured')
    })
  })

  describe('POST', () => {
    it('should save settings successfully', async () => {
      const settings = {
        sms: { provider: 'twilio', rateLimit: 100 },
        email: { provider: 'smtp', smtpPort: 587 },
        general: { appName: 'Test App', timezone: 'UTC' },
        notifications: { emailNotifications: true },
        security: { sessionTimeout: 30 },
      }

      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'POST',
        body: JSON.stringify({ settings }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Settings saved successfully')
    })

    it('should validate required settings data', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Settings data is required')
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/settings', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to save settings')
    })
  })
})
