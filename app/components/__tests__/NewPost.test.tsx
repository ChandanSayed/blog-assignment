import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NewPost } from '../NewPost'
import { createPost } from '@/lib/blog'
import { useUserStore } from '@/store/userStore'
import { useRouter } from 'next/navigation'
import { useBlogStore } from '@/store/blogStore'


// Mock modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/store/blogStore', () => ({
  useBlogStore: jest.fn()
}))

jest.mock('@/store/userStore', () => ({
  useUserStore: jest.fn()
}))

jest.mock('@/lib/blog', () => ({
  createPost: jest.fn()
}))

describe('NewPost', () => {
  // Define mockUser and mockRouter at the top of describe block
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User'
  }

  // Create a separate mock for router.refresh
  const mockRefresh = jest.fn()
  const mockRouter = {
    push: jest.fn(),
    refresh: mockRefresh  // Use the separate mock function
  }

  const mockDispatch = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useBlogStore as jest.Mock).mockReturnValue({
      dispatch: mockDispatch
    })
    ;(useUserStore as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true
    })
  })

  it('renders the new post form', () => {
    render(<NewPost />)
    expect(screen.getByText('Create New Post')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Post title')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Write your post content...')).toBeInTheDocument()
    expect(screen.getByText('Create Post')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<NewPost />)
    
    // Get the submit button and click it
    const submitButton = screen.getByText('Create Post')
    fireEvent.click(submitButton)
    
    // Check for HTML5 validation
    const titleInput = screen.getByPlaceholderText('Post title')
    const contentInput = screen.getByPlaceholderText('Write your post content...')
    
    expect(titleInput).toBeInvalid()
    expect(contentInput).toBeInvalid()
  })

  it('handles successful post creation', async () => {
    const newPost = {
      id: '1',
      title: 'Test Title',
      content: 'Test Content',
      authorId: mockUser.id,
      published: true
    }
    
    ;(createPost as jest.Mock).mockResolvedValueOnce(newPost)
    
    render(<NewPost />)
    
    // Fill in form
    fireEvent.change(screen.getByPlaceholderText('Post title'), {
      target: { value: 'Test Title' }
    })
    fireEvent.change(screen.getByPlaceholderText('Write your post content...'), {
      target: { value: 'Test Content' }
    })
    
    // Submit form
    await fireEvent.click(screen.getByText('Create Post'))
    
    // Wait for all async operations to complete
    await waitFor(() => {
      expect(createPost).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Test Content',
        authorId: mockUser.id,
        published: true
      })
    })

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'ADD_POST',
        post: newPost
      })
    })
  })

  it('shows loading state during submission', async () => {
    ;(createPost as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(<NewPost />)
    
    // Fill in form
    fireEvent.change(screen.getByPlaceholderText('Post title'), {
      target: { value: 'Test Title' }
    })
    fireEvent.change(screen.getByPlaceholderText('Write your post content...'), {
      target: { value: 'Test Content' }
    })
    
    // Submit form
    fireEvent.click(screen.getByText('Create Post'))
    
    expect(screen.getByText('Creating...')).toBeInTheDocument()
    expect(screen.getByText('Creating...')).toBeDisabled()
  })

  it('does not render when user is not logged in', () => {
    // Override the userStore mock for this specific test
    ;(useUserStore as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false
    })
    
    const { container } = render(<NewPost />)
    expect(container).toBeEmptyDOMElement()
  })
}) 