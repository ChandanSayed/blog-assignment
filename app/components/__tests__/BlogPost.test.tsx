import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BlogPost } from '../BlogPost'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { useBlogStore } from '@/store/blogStore'

// Mock modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock stores
jest.mock('@/store/blogStore', () => ({
  useBlogStore: jest.fn()
}))

jest.mock('@/store/userStore', () => ({
  useUserStore: jest.fn()
}))

describe('BlogPost', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  }

  const mockDispatch = jest.fn()

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    authorId: 1,
    author: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    }
  }

  beforeEach(() => {
    jest.resetAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useBlogStore as jest.Mock).mockReturnValue({
      dispatch: mockDispatch
    })
    ;(useUserStore as jest.Mock).mockReturnValue({
      user: { id: 1 },
      isAuthenticated: true
    })
  })

  it('renders post content', () => {
    render(<BlogPost post={mockPost} isEditable={false} showActions={false} />)
    expect(screen.getByText(mockPost.title)).toBeInTheDocument()
    expect(screen.getByText(mockPost.content)).toBeInTheDocument()
    expect(screen.getByText(`By ${mockPost.author.name}`)).toBeInTheDocument()
  })

  it('shows edit and delete buttons when editable and user is author', () => {
    render(<BlogPost post={mockPost} isEditable={true} showActions={true} />)
    
    // Add debug to help see what's rendered
    screen.debug()
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('does not show action buttons when not editable', () => {
    render(<BlogPost post={mockPost} isEditable={false} showActions={true} />)
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('navigates to edit page when edit button is clicked', () => {
    render(<BlogPost post={mockPost} isEditable={true} showActions={true} />)
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    expect(mockRouter.push).toHaveBeenCalledWith(`/posts/${mockPost.id}/edit`)
  })

  it('deletes post when confirmed', () => {
    window.confirm = jest.fn(() => true)
    
    render(<BlogPost post={mockPost} isEditable={true} showActions={true} />)
    
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'DELETE_POST',
      id: mockPost.id
    })
  })

  it('cancels delete when not confirmed', () => {
    window.confirm = jest.fn(() => false)
    
    render(<BlogPost post={mockPost} isEditable={true} showActions={true} />)
    
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })
})