/**
 * @jest-environment jsdom
 */

import LeadsPage from '@/app/leads/page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}))

// Mock fetch for API calls
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

describe('Upload Flow Integration', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('should complete full upload flow with skip strategy', async () => {
    const user = userEvent.setup()

    // Mock successful upload response
    const mockUploadResponse = {
      success: true,
      message: 'Upload completed',
      strategy: 'skip',
      summary: { total: 2, successful: 1, duplicates: 1, errors: 0 },
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUploadResponse,
    })

    render(<LeadsPage />, { wrapper: createWrapper() })

    // Open upload modal
    const uploadButton = screen.getByText('Upload CSV')
    await user.click(uploadButton)

    // Verify modal is open
    expect(screen.getByText('Upload Leads CSV')).toBeInTheDocument()

    // Select skip strategy
    const skipRadio = screen.getByLabelText(/Skip duplicates/)
    await user.click(skipRadio)

    // Create test file
    const csvContent = 'phone_number,first_name,last_name\n+15550101,Test,User\n+15550102,Another,User'
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })

    // Upload file
    const fileInput = screen.getByLabelText(/file/i)
    await user.upload(fileInput, file)

    // Click upload button
    const uploadSubmitButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadSubmitButton)

    // Wait for upload to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/leads/upload', {
        method: 'POST',
        body: expect.any(FormData),
      })
    })
  })

  it('should complete full upload flow with upsert strategy', async () => {
    const user = userEvent.setup()

    // Mock successful upload response
    const mockUploadResponse = {
      success: true,
      message: 'Upload completed',
      strategy: 'upsert',
      summary: { total: 2, successful: 0, duplicates: 0, updated: 2, errors: 0 },
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUploadResponse,
    })

    render(<LeadsPage />, { wrapper: createWrapper() })

    // Open upload modal
    const uploadButton = screen.getByText('Upload CSV')
    await user.click(uploadButton)

    // Select upsert strategy
    const upsertRadio = screen.getByLabelText(/Update existing leads/)
    await user.click(upsertRadio)

    // Create test file
    const csvContent = 'phone_number,first_name,last_name\n+15550101,Test,User\n+15550102,Another,User'
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })

    // Upload file
    const fileInput = screen.getByLabelText(/file/i)
    await user.upload(fileInput, file)

    // Click upload button
    const uploadSubmitButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadSubmitButton)

    // Wait for upload to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/leads/upload', {
        method: 'POST',
        body: expect.any(FormData),
      })
    })
  })

  it('should show uploading state during upload', async () => {
    const user = userEvent.setup()

    // Mock delayed response
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true }),
        }), 100)
      )
    )

    render(<LeadsPage />, { wrapper: createWrapper() })

    // Open upload modal
    const uploadButton = screen.getByText('Upload CSV')
    await user.click(uploadButton)

    // Create test file
    const csvContent = 'phone_number,first_name\n+15550101,Test'
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })

    // Upload file
    const fileInput = screen.getByLabelText(/file/i)
    await user.upload(fileInput, file)

    // Click upload button
    const uploadSubmitButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadSubmitButton)

    // Check for uploading state
    expect(screen.getByText('Uploading...')).toBeInTheDocument()
    expect(screen.getByText('Uploading CSV file...')).toBeInTheDocument()
  })

  it('should handle upload error', async () => {
    const user = userEvent.setup()

    // Mock error response
    fetch.mockRejectedValueOnce(new Error('Upload failed'))

    render(<LeadsPage />, { wrapper: createWrapper() })

    // Open upload modal
    const uploadButton = screen.getByText('Upload CSV')
    await user.click(uploadButton)

    // Create test file
    const csvContent = 'phone_number,first_name\n+15550101,Test'
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })

    // Upload file
    const fileInput = screen.getByLabelText(/file/i)
    await user.upload(fileInput, file)

    // Click upload button
    const uploadSubmitButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadSubmitButton)

    // Wait for error handling
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
  })

  it('should validate file type', async () => {
    const user = userEvent.setup()

    render(<LeadsPage />, { wrapper: createWrapper() })

    // Open upload modal
    const uploadButton = screen.getByText('Upload CSV')
    await user.click(uploadButton)

    // Try to upload non-CSV file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = screen.getByLabelText(/file/i)
    await user.upload(fileInput, file)

    // Click upload button
    const uploadSubmitButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadSubmitButton)

    // Wait for validation
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/leads/upload', {
        method: 'POST',
        body: expect.any(FormData),
      })
    })
  })
})
