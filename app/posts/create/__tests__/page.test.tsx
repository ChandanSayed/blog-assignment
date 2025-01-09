import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreatePost from '../page'
import { createPost } from '@/lib/blog'

// Mock modules at the top level
const mockUser = {
  id: '123',
  email: 'test@example.com'
}

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}))

// Mock userStore with a function to allow overriding
const mockUseUserStore = jest.fn(() => ({
  user: mockUser,
  isAuthenticated: true
}))

jest.mock('@/store/userStore', () => ({
  useUserStore: () => mockUseUserStore()
}))

// Mock createPost function
jest.mock('@/lib/blog', () => ({
  createPost: jest.fn()
}))

describe('CreatePost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the mock implementation before each test
    mockUseUserStore.mockImplementation(() => ({
      user: mockUser,
      isAuthenticated: true
    }))
  })

  it('renders the create post form', () => {
    render(<CreatePost />)
    expect(screen.getByText('Create New Post')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Content')).toBeInTheDocument()
  })

  it('validates form fields', async () => {
    render(<CreatePost />)
    
    // Submit empty form
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
      expect(screen.getByText('Content is required')).toBeInTheDocument()
    })
  })

  it('validates minimum length requirements', async () => {
    render(<CreatePost />)
    
    // Enter short title and content
    const titleInput = screen.getByLabelText('Title')
    const contentInput = screen.getByLabelText('Content')
    const submitButton = screen.getByRole('button', { name: /create post/i })

    // First make the button enabled with valid input
    fireEvent.change(titleInput, {
      target: { name: 'title', value: 'Test Title' }
    })
    fireEvent.change(contentInput, {
      target: { name: 'content', value: 'Test Content Long Enough' }
    })

    // Then change to invalid input
    fireEvent.change(titleInput, {
      target: { name: 'title', value: 'ab' }
    })
    fireEvent.change(contentInput, {
      target: { name: 'content', value: 'short' }
    })
    
    // Submit the form
    fireEvent.submit(screen.getByRole('form'))
    
    await waitFor(() => {
      expect(screen.getByText('Title must be at least 3 characters long')).toBeInTheDocument()
      expect(screen.getByText('Content must be at least 10 characters long')).toBeInTheDocument()
    })
  })

  it('successfully creates a post', async () => {
    render(<CreatePost />)
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { name: 'title', value: 'Test Title' }
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { name: 'content', value: 'Test Content Long Enough' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create post/i }))
    
    await waitFor(() => {
      expect(createPost).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Test Content Long Enough',
        authorId: mockUser.id,
        published: true,
      })
    })
    
    expect(mockRouter.push).toHaveBeenCalledWith('/posts')
    expect(mockRouter.refresh).toHaveBeenCalled()
  })

  it('handles create post error', async () => {
    (createPost as jest.Mock).mockRejectedValueOnce(new Error('API Error'))
    
    render(<CreatePost />)
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { name: 'title', value: 'Test Title' }
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { name: 'content', value: 'Test Content Long Enough' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create post/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Failed to create post. Please try again.')).toBeInTheDocument()
    })
  })

  it('redirects to login if not authenticated', async () => {
    // Override the mock for this specific test
    mockUseUserStore.mockImplementation(() => ({
      user: { id: '', email: '' }, // Provide empty strings to match the expected type
      isAuthenticated: false
    }))
    
    render(<CreatePost />)
    
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/login')
    })
  })

  it('enables submit button when form is valid', () => {
    render(<CreatePost />)
    
    const submitButton = screen.getByRole('button', { name: /create post/i })
    expect(submitButton).toBeDisabled()
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { name: 'title', value: 'Test Title' }
    })
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { name: 'content', value: 'Test Content Long Enough' }
    })
    
    expect(submitButton).not.toBeDisabled()
  })

  it('handles cancel button click', () => {
    render(<CreatePost />)
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockRouter.back).toHaveBeenCalled()
  })
}) 