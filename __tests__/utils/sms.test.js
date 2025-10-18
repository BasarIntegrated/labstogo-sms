import { formatPhoneNumber, personalizeMessage, sendSMS, validatePhoneNumber } from '@/lib/sms'

// Mock Twilio
jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'test-sid',
        status: 'sent',
      }),
    },
  })),
}))

describe('SMS Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validatePhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhoneNumber('+15550101')).toBe(true)
      expect(validatePhoneNumber('+1234567890')).toBe(true)
      expect(validatePhoneNumber('+44123456789')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false)
      expect(validatePhoneNumber('abc')).toBe(false)
      expect(validatePhoneNumber('')).toBe(false)
      expect(validatePhoneNumber('+')).toBe(false)
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhoneNumber('5550101')).toBe('+15550101')
      expect(formatPhoneNumber('+15550101')).toBe('+15550101')
      expect(formatPhoneNumber('1-555-0101')).toBe('+15550101')
      expect(formatPhoneNumber('(555) 0101')).toBe('+15550101')
    })

    it('should handle international numbers', () => {
      expect(formatPhoneNumber('+44123456789')).toBe('+44123456789')
      expect(formatPhoneNumber('44123456789')).toBe('+44123456789')
    })
  })

  describe('personalizeMessage', () => {
    it('should replace placeholders with lead data', () => {
      const template = 'Hello {first_name}, welcome to {company}!'
      const lead = {
        first_name: 'John',
        company: 'TechCorp',
      }

      const result = personalizeMessage(template, lead)
      expect(result).toBe('Hello John, welcome to TechCorp!')
    })

    it('should handle missing data gracefully', () => {
      const template = 'Hello {first_name}, welcome to {company}!'
      const lead = {
        first_name: 'John',
        // company is missing
      }

      const result = personalizeMessage(template, lead)
      expect(result).toBe('Hello John, welcome to {company}!')
    })

    it('should handle empty template', () => {
      const template = ''
      const lead = { first_name: 'John' }

      const result = personalizeMessage(template, lead)
      expect(result).toBe('')
    })

    it('should handle template without placeholders', () => {
      const template = 'Hello world!'
      const lead = { first_name: 'John' }

      const result = personalizeMessage(template, lead)
      expect(result).toBe('Hello world!')
    })
  })

  describe('sendSMS', () => {
    const mockTwilio = require('twilio').default

    it('should send SMS successfully', async () => {
      const result = await sendSMS('+15550101', 'Test message')

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-sid')
      expect(mockTwilio().messages.create).toHaveBeenCalledWith({
        body: 'Test message',
        from: process.env.TWILIO_FROM_NUMBER,
        to: '+15550101',
      })
    })

    it('should handle missing Twilio credentials', async () => {
      // Mock missing credentials
      const originalEnv = process.env.TWILIO_ACCOUNT_SID
      delete process.env.TWILIO_ACCOUNT_SID

      const result = await sendSMS('+15550101', 'Test message')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Twilio credentials not configured')

      // Restore environment
      process.env.TWILIO_ACCOUNT_SID = originalEnv
    })

    it('should handle invalid phone numbers', async () => {
      const result = await sendSMS('invalid', 'Test message')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid phone number')
    })

    it('should handle Twilio errors', async () => {
      mockTwilio().messages.create.mockRejectedValueOnce(new Error('Twilio error'))

      const result = await sendSMS('+15550101', 'Test message')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Twilio error')
    })
  })
})
