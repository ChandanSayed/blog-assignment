import { render, screen } from '@testing-library/react'
import PostPage from '../page'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn()
  }))
}))

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({
      value: JSON.stringify({
        state: {
          isAuthenticated: true,
          user: { id: 1, name: 'Test User' },
        },
      }),
    }),
  }),
}))

// Add this mock for useUserStore
jest.mock('@/store/userStore', () => ({
  useUserStore: jest.fn(() => ({
    user: { id: 1, name: 'Test User' },
    isAuthenticated: true
  }))
}))

describe('PostPage', () => {
  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    authorId: 1,
    author: {
      id: 1,
      name: 'Test User',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders post details when post exists', async () => {
    ;(prisma.post.findUnique as jest.Mock).mockResolvedValueOnce(mockPost)

    const page = await PostPage({ params: { id: '1' } })
    render(page)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByText('By Test User')).toBeInTheDocument()
    expect(screen.getByText('← Back to all posts')).toBeInTheDocument()
  })

  it('calls notFound when post does not exist', async () => {
    ;(prisma.post.findUnique as jest.Mock).mockResolvedValueOnce(null)

    await PostPage({ params: { id: '999' } })

    expect(notFound).toHaveBeenCalled()
  })

  it('calls notFound when there is an error', async () => {
    ;(prisma.post.findUnique as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    )

    await PostPage({ params: { id: '1' } })

    expect(notFound).toHaveBeenCalled()
  })
})