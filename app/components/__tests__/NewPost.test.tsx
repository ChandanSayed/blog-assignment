import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NewPost } from '../NewPost'
import { createPost } from '@/lib/blog'

// Mock modules
const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User'
}

// Mock userStore with user
jest.mock('@/store/userStore', () => ({
  useUserStore: () => ({
    user: mockUser // Ensure user is always defined for tests
  })
}))

const mockDispatch = jest.fn()
jest.mock('@/store/blogStore', () => ({
  useBlogStore: () => ({
    dispatch: mockDispatch
  })
}))

// Mock createPost function
jest.mock('@/lib/blog', () => ({
  createPost: jest.fn()
}))

// Mock window.location.reload
const mockReload = jest.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true
})

describe('NewPost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    fireEvent.click(screen.getByText('Create Post'))
    
    await waitFor(() => {
      expect(createPost).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Test Content',
        authorId: mockUser.id,
        published: true
      })
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'ADD_POST',
        post: newPost
      })
      expect(mockReload).toHaveBeenCalled()
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
    jest.spyOn(require('@/store/userStore'), 'useUserStore').mockImplementation(() => ({
      user: null
    }))
    
    const { container } = render(<NewPost />)
    expect(container).toBeEmptyDOMElement()
  })
}) 