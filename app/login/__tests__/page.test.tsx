import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../page'
import { login } from '@/lib/auth'

// Mock modules
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}))

// Mock userStore
const mockLoginStore = jest.fn()
jest.mock('@/store/userStore', () => ({
  useUserStore: () => ({
    login: mockLoginStore
  })
}))

// Mock login function
jest.mock('@/lib/auth', () => ({
  login: jest.fn()
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the login form', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<LoginPage />)
    
    // Get the form and inputs
    const form = screen.getByRole('form')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    
    // First enter some valid data
    fireEvent.change(emailInput, {
      target: { name: 'email', value: 'test@example.com' }
    })
    fireEvent.change(passwordInput, {
      target: { name: 'password', value: 'password123' }
    })
    
    // Then clear the fields
    fireEvent.change(emailInput, {
      target: { name: 'email', value: '' }
    })
    fireEvent.change(passwordInput, {
      target: { name: 'password', value: '' }
    })
    
    // Submit the form
    fireEvent.submit(form)
    
    // Wait for validation messages
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'invalid-email' }
    })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('validates password minimum length', async () => {
    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { name: 'password', value: '12345' }
    })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    })
  })

  it('successfully logs in a user', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    ;(login as jest.Mock).mockResolvedValueOnce({ user: mockUser })
    
    render(<LoginPage />)
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { name: 'password', value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(mockLoginStore).toHaveBeenCalledWith(mockUser)
      expect(mockRouter.push).toHaveBeenCalledWith('/posts')
    })
  })

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials'
    ;(login as jest.Mock).mockRejectedValueOnce(new Error(errorMessage))
    
    render(<LoginPage />)
    
    // Fill in form data
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { name: 'password', value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('enables submit button when form is valid', () => {
    render(<LoginPage />)
    
    const submitButton = screen.getByRole('button', { name: /login/i })
    expect(submitButton).toBeDisabled()
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { name: 'password', value: 'password123' }
    })
    
    expect(submitButton).not.toBeDisabled()
  })

  it('renders sign up link', () => {
    render(<LoginPage />)
    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '/register')
  })

  it('shows loading state during login', async () => {
    ;(login as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<LoginPage />)
    
    // Fill in form data
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { name: 'password', value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    expect(screen.getByText('Logging in...')).toBeInTheDocument()
  })
}) 