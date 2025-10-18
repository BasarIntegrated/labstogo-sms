import { useSaveSettings, useSettings, useTestConnection } from '@/hooks/useSettings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

// Mock fetch
global.fetch = jest.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useSettings', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('should fetch settings successfully', async () => {
    const mockSettings = {
      sms: { provider: 'twilio', rateLimit: 100 },
      email: { provider: 'smtp', smtpPort: 587 },
      general: { appName: 'Test App', timezone: 'UTC' },
      notifications: { emailNotifications: true },
      security: { sessionTimeout: 30 },
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, settings: mockSettings }),
    })

    const { result } = renderHook(() => useSettings(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockSettings)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useSettings(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeTruthy()
  })
})

describe('useSaveSettings', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('should save settings successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Settings saved successfully',
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useSaveSettings(), {
      wrapper: createWrapper(),
    })

    const testSettings = {
      sms: { provider: 'twilio', rateLimit: 100 },
      email: { provider: 'smtp', smtpPort: 587 },
    }

    await waitFor(async () => {
      await result.current.mutateAsync(testSettings)
    })

    expect(result.current.data).toEqual(mockResponse)
    expect(result.current.error).toBeNull()
  })

  it('should handle save error', async () => {
    fetch.mockRejectedValueOnce(new Error('Save failed'))

    const { result } = renderHook(() => useSaveSettings(), {
      wrapper: createWrapper(),
    })

    const testSettings = { sms: { provider: 'twilio' } }

    await waitFor(async () => {
      try {
        await result.current.mutateAsync(testSettings)
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should send correct JSON data', async () => {
    const mockResponse = { success: true }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useSaveSettings(), {
      wrapper: createWrapper(),
    })

    const testSettings = { sms: { provider: 'twilio' } }

    await waitFor(async () => {
      await result.current.mutateAsync(testSettings)
    })

    expect(fetch).toHaveBeenCalledWith('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: testSettings }),
    })
  })
})

describe('useTestConnection', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('should test SMS connection successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'SMS provider connection successful',
      details: { provider: 'Twilio', status: 'connected' },
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useTestConnection(), {
      wrapper: createWrapper(),
    })

    await waitFor(async () => {
      await result.current.mutateAsync('sms')
    })

    expect(result.current.data).toEqual(mockResponse)
    expect(result.current.error).toBeNull()
  })

  it('should test email connection successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Email server connection successful',
      details: { smtp: 'connected', port: 587 },
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useTestConnection(), {
      wrapper: createWrapper(),
    })

    await waitFor(async () => {
      await result.current.mutateAsync('email')
    })

    expect(result.current.data).toEqual(mockResponse)
    expect(result.current.error).toBeNull()
  })

  it('should test database connection successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Database connection successful',
      details: { provider: 'Supabase', status: 'connected' },
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useTestConnection(), {
      wrapper: createWrapper(),
    })

    await waitFor(async () => {
      await result.current.mutateAsync('database')
    })

    expect(result.current.data).toEqual(mockResponse)
    expect(result.current.error).toBeNull()
  })

  it('should handle connection test error', async () => {
    fetch.mockRejectedValueOnce(new Error('Connection failed'))

    const { result } = renderHook(() => useTestConnection(), {
      wrapper: createWrapper(),
    })

    await waitFor(async () => {
      try {
        await result.current.mutateAsync('sms')
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.error).toBeTruthy()
  })
})
