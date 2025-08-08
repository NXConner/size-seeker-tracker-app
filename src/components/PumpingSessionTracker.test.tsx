import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PumpingSessionTracker from '@/components/PumpingSessionTracker'

jest.mock('@/utils/secureStorage', () => ({
  secureStorage: {
    getItem: jest.fn().mockResolvedValue([]),
    setItem: jest.fn().mockResolvedValue(undefined),
  }
}))

const mockedSecure = require('@/utils/secureStorage').secureStorage

describe('PumpingSessionTracker', () => {
  it('adds a session and saves to secureStorage', async () => {
    render(<PumpingSessionTracker onBack={() => {}} />)

    await waitFor(() => expect(mockedSecure.getItem).toHaveBeenCalled())

    fireEvent.click(screen.getAllByText(/Add Session|Add First Session/)[0])

    fireEvent.change(screen.getByLabelText('Duration (minutes)'), { target: { value: '15' } })
    fireEvent.change(screen.getByLabelText('Pressure (Hg)'), { target: { value: '5' } })

    fireEvent.click(screen.getByText(/Save Session|Update Session/))

    await waitFor(() => expect(mockedSecure.setItem).toHaveBeenCalledWith('pumpingSessions', expect.any(Array)))
  })
})