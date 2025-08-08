import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProgressDashboard from '@/components/ProgressDashboard'

jest.mock('@/utils/imageStorage', () => ({
  imageStorage: {
    getAllImages: jest.fn().mockResolvedValue([]),
  },
}))

jest.mock('@/utils/secureStorage', () => ({
  secureStorage: {
    getItem: jest.fn().mockResolvedValue([]),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}))

describe('ProgressDashboard', () => {
  it('renders and shows title', async () => {
    render(<ProgressDashboard onBack={() => {}} />)

    // Title appears early
    expect(screen.getByText('Progress Dashboard')).toBeInTheDocument()

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText('Loading progress data...')).not.toBeInTheDocument())

    // Tabs present
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Trends')).toBeInTheDocument()
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })
})