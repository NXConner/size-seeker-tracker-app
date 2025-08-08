import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSecureStorage } from '@/hooks/useSecureStorage'

jest.mock('@/utils/secureStorage', () => ({
  secureStorage: {
    getItem: jest.fn().mockResolvedValue('init'),
    setItem: jest.fn().mockResolvedValue(undefined),
  }
}))

function Dummy() {
  const { value, setValue, loading } = useSecureStorage<string>('test:key', 'fallback')
  if (loading) return <div>loading...</div>
  return (
    <div>
      <div data-testid="val">{value}</div>
      <button onClick={() => setValue('newval')}>set</button>
    </div>
  )
}

describe('useSecureStorage', () => {
  it('loads and updates value', async () => {
    render(<Dummy />)
    await waitFor(() => expect(screen.queryByText('loading...')).not.toBeInTheDocument())
    expect(screen.getByTestId('val')).toHaveTextContent('init')

    fireEvent.click(screen.getByText('set'))
    expect(screen.getByTestId('val')).toHaveTextContent('newval')
  })
})