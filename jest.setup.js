import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
    }
  },
}))

// Mock next/link
jest.mock('next/link', () => {
  const React = require('react')
  return React.forwardRef(({ children, href }, ref) => {
    return (
      <a href={href} ref={ref}>
        {children}
      </a>
    )
  })
})

// Alternative Zustand mock with more flexibility
const mockStore = {
  user: {
    id: '123',
    email: 'test@example.com'
  },
  isAuthenticated: true
}

jest.mock('zustand', () => ({
  create: () => () => mockStore
}))

// Suppress console errors during tests
global.console.error = jest.fn() 