import Layout from '@/components/layout/Layout'
import { render, screen } from '@testing-library/react'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
}))

describe('Layout Component', () => {
  it('should render navigation bar', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    // Check that LabsToGo SMS appears (there are multiple instances)
    expect(screen.getAllByText('LabsToGo SMS')).toHaveLength(2)
    expect(screen.getAllByText('Dashboard')).toHaveLength(2)
    expect(screen.getByText('Leads')).toBeInTheDocument()
    expect(screen.getAllByText('Campaigns')).toHaveLength(2)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('should render user menu', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('admin@labstogo.com')).toBeInTheDocument()
  })

  it('should render footer', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText(/© 2024 LabsToGo SMS/)).toBeInTheDocument()
  })

  it('should have proper navigation links', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    // Get all links (there are multiple instances)
    const dashboardLinks = screen.getAllByRole('link', { name: 'Dashboard' })
    const leadsLink = screen.getByRole('link', { name: 'Leads' })
    const campaignsLinks = screen.getAllByRole('link', { name: 'Campaigns' })
    const settingsLink = screen.getByRole('link', { name: 'Settings' })

    // Check that at least one Dashboard link has the correct href
    expect(dashboardLinks.some(link => link.getAttribute('href') === '/')).toBe(true)
    expect(leadsLink).toHaveAttribute('href', '/leads')
    expect(campaignsLinks.some(link => link.getAttribute('href') === '/campaigns')).toBe(true)
    expect(settingsLink).toHaveAttribute('href', '/settings')
  })
})
