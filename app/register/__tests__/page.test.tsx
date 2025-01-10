import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '../page'
import { register } from '@/lib/auth'

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

// Mock register function
jest.mock('@/lib/auth', () => ({
  register: jest.fn()
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the registration form', () => {
    render(<RegisterPage />)
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<RegisterPage />)
    
    // Submit empty form
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument()
    })
  })

  it('validates minimum length requirements', async () => {
    render(<RegisterPage />)
    
    // Fill in short values
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { name: 'name', value: 'ab' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { name: 'password', value: '12345' }
    })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 3 characters long')).toBeInTheDocument()
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<RegisterPage />)
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'invalid-email' }
    })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('validates password confirmation', async () => {
    render(<RegisterPage />)
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { name: 'password', value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { name: 'confirmPassword', value: 'password456' }
    })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('successfully registers a user', async () => {
    const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' }
    ;(register as jest.Mock).mockResolvedValueOnce({ user: mockUser })
    
    render(<RegisterPage />)
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { name: 'name', value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { name: 'password', value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { name: 'confirmPassword', value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    
    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User')
      expect(mockLoginStore).toHaveBeenCalledWith(mockUser)
      expect(mockRouter.push).toHaveBeenCalledWith('/posts')
    })
  })

  it('handles registration error', async () => {
    const errorMessage = 'Email already exists'
    ;(register as jest.Mock).mockRejectedValueOnce(new Error(errorMessage))
    
    render(<RegisterPage />)
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { name: 'name', value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { name: 'password', value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { name: 'confirmPassword', value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('enables submit button when form is valid', () => {
    render(<RegisterPage />)
    
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    expect(submitButton).toBeDisabled()
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { name: 'name', value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { name: 'password', value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { name: 'confirmPassword', value: 'password123' }
    })
    
    expect(submitButton).not.toBeDisabled()
  })
}) 