import { useLeads, useUploadLeads } from '@/hooks/useLeads'
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

describe('useLeads', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('should fetch leads successfully', async () => {
    const mockData = {
      leads: [
        { id: '1', phone: '+15550101', first_name: 'Test', last_name: 'User' },
        { id: '2', phone: '+15550102', first_name: 'Another', last_name: 'User' },
      ],
      pagination: { page: 1, limit: 50, total: 2, totalPages: 1 },
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useLeads(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useLeads(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeTruthy()
  })

  it('should apply filters correctly', async () => {
    const mockData = { leads: [], pagination: { total: 0 } }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useLeads({ 
      search: 'test', 
      status: 'Active' 
    }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('search=test&status=Active')
    )
  })
})

describe('useUploadLeads', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('should upload leads successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Upload completed',
      summary: { total: 2, successful: 2, duplicates: 0, errors: 0 },
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useUploadLeads(), {
      wrapper: createWrapper(),
    })

    const testFile = new File(['test content'], 'test.csv', { type: 'text/csv' })
    
    await waitFor(async () => {
      await result.current.mutateAsync({ file: testFile, strategy: 'skip' })
    })

    expect(result.current.data).toEqual(mockResponse)
    expect(result.current.error).toBeNull()
  })

  it('should handle upload error', async () => {
    fetch.mockRejectedValueOnce(new Error('Upload failed'))

    const { result } = renderHook(() => useUploadLeads(), {
      wrapper: createWrapper(),
    })

    const testFile = new File(['test content'], 'test.csv', { type: 'text/csv' })

    await waitFor(async () => {
      try {
        await result.current.mutateAsync({ file: testFile, strategy: 'skip' })
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should send correct FormData', async () => {
    const mockResponse = { success: true }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useUploadLeads(), {
      wrapper: createWrapper(),
    })

    const testFile = new File(['test content'], 'test.csv', { type: 'text/csv' })

    await waitFor(async () => {
      await result.current.mutateAsync({ file: testFile, strategy: 'upsert' })
    })

    expect(fetch).toHaveBeenCalledWith('/api/leads/upload', {
      method: 'POST',
      body: expect.any(FormData),
    })
  })
})
