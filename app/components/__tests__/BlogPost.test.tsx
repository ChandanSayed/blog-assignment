import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BlogPost } from '../BlogPost'

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

// Mock stores
const mockDispatch = jest.fn()
jest.mock('@/store/blogStore', () => ({
  useBlogStore: () => ({
    dispatch: mockDispatch
  })
}))

const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User'
}

jest.mock('@/store/userStore', () => ({
  useUserStore: () => ({
    user: mockUser
  })
}))

// Mock API functions
jest.mock('@/lib/blog', () => ({
  updatePost: jest.fn(),
  deletePost: jest.fn()
}))

describe('BlogPost', () => {
  const mockPost = {
    id: '1',
    title: 'Test Post',
    content: 'Test Content',
    authorId: '123',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders post content', () => {
    render(<BlogPost post={mockPost} />)
    expect(screen.getByText(mockPost.title)).toBeInTheDocument()
    expect(screen.getByText(mockPost.content)).toBeInTheDocument()
    expect(screen.getByText(`By ${mockPost.author.name}`)).toBeInTheDocument()
  })

  it('shows edit and delete buttons when editable and user is author', () => {
    render(<BlogPost post={mockPost} isEditable={true} showActions={true} />)
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('does not show action buttons when not editable', () => {
    render(<BlogPost post={mockPost} isEditable={false} showActions={true} />)
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('enters edit mode when edit button is clicked', () => {
    render(<BlogPost post={mockPost} isEditable={true} showActions={true} />)
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    expect(screen.getByDisplayValue(mockPost.title)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockPost.content)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('updates post when save is clicked', async () => {
    const { updatePost } = require('@/lib/blog')
    updatePost.mockResolvedValueOnce({ ...mockPost, title: 'Updated Title' })

    render(<BlogPost post={mockPost} isEditable={true} showActions={true} />)
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    // Update title
    fireEvent.change(screen.getByDisplayValue(mockPost.title), {
      target: { value: 'Updated Title' }
    })
    
    // Save changes
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    
    await waitFor(() => {
      expect(updatePost).toHaveBeenCalledWith(mockPost.id, {
        title: 'Updated Title',
        content: mockPost.content
      })
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_POST',
        post: { ...mockPost, title: 'Updated Title' }
      })
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('deletes post when delete is confirmed', async () => {
    const { deletePost } = require('@/lib/blog')
    deletePost.mockResolvedValueOnce({})
    window.confirm = jest.fn(() => true)

    render(<BlogPost post={mockPost} isEditable={true} showActions={true} />)
    
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    
    await waitFor(() => {
      expect(deletePost).toHaveBeenCalledWith(mockPost.id)
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'DELETE_POST',
        id: mockPost.id
      })
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('cancels delete when not confirmed', async () => {
    const { deletePost } = require('@/lib/blog')
    window.confirm = jest.fn(() => false)

    render(<BlogPost post={mockPost} isEditable={true} showActions={true} />)
    
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    
    expect(deletePost).not.toHaveBeenCalled()
    expect(mockDispatch).not.toHaveBeenCalled()
  })
}) 