import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import UserPosts from '../page'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  notFound: jest.fn()
}))

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    },
    post: {
      findMany: jest.fn(),
      count: jest.fn()
    }
  }
}))

// Mock BlogPost component
jest.mock('@/app/components/BlogPost', () => ({
  BlogPost: ({ post }: { post: { id: number; title: string; content: string; author: { name: string } } }) => (
    <article data-testid={`post-${post.id}`}>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <span>Author: {post.author.name}</span>
    </article>
  )
}))

// Mock Pagination component
jest.mock('@/app/components/Pagination', () => ({
  Pagination: () => <nav>Pagination</nav>
}))

describe('UserPosts Page', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com'
  }

  const mockPosts = [
    {
      id: 1,
      title: 'Test Post 1',
      content: 'Content 1',
      authorId: 1,
      author: mockUser
    },
    {
      id: 2,
      title: 'Test Post 2',
      content: 'Content 2',
      authorId: 1,
      author: mockUser
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default authenticated state
    ;(cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({
        value: JSON.stringify({
          state: {
            isAuthenticated: true,
            user: { id: 1 }
          }
        })
      })
    })

    // Setup default prisma responses
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts)
    ;(prisma.post.count as jest.Mock).mockResolvedValue(mockPosts.length)
  })

  it('redirects to login if user is not authenticated', async () => {
    // Mock unauthenticated state
    ;(cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({
        value: JSON.stringify({
          state: {
            isAuthenticated: false,
            user: null
          }
        })
      })
    })

    try {
      await UserPosts({ params: { id: '1' }, searchParams: {} })
    } catch {
      // Expect redirect to have been called
      expect(redirect).toHaveBeenCalledWith('/login')
    }
  })

  it('redirects to login if no cookie exists', async () => {
    // Mock missing cookie
    ;(cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null)
    })

    try {
      await UserPosts({ params: { id: '1' }, searchParams: {} })
    } catch  {
      // Expect redirect to have been called
      expect(redirect).toHaveBeenCalledWith('/login')
    }
  })

  it('redirects to posts if user tries to access another user\'s posts', async () => {
    ;(cookies as jest.Mock).mockReturnValue({
      get: () => ({
        value: JSON.stringify({
          state: {
            isAuthenticated: true,
            user: { id: 2 }
          }
        })
      })
    })

    await UserPosts({ params: { id: '1' }, searchParams: {} })
    expect(redirect).toHaveBeenCalledWith('/posts')
  })

  it('returns not found for non-existent user', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    await UserPosts({ params: { id: '999' }, searchParams: {} })
    expect(notFound).toHaveBeenCalled()
  })

  it('handles database errors gracefully', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

    await UserPosts({ params: { id: '1' }, searchParams: {} })
    expect(notFound).toHaveBeenCalled()
  })

  it('renders user posts correctly', async () => {
    const component = await UserPosts({ params: { id: '1' }, searchParams: {} })
    render(component)

    expect(screen.getByText(`${mockUser.name}'s Posts`)).toBeInTheDocument()
    expect(screen.getByText(`Total posts: ${mockPosts.length}`)).toBeInTheDocument()
    
    mockPosts.forEach(post => {
      const postElement = screen.getByTestId(`post-${post.id}`)
      expect(within(postElement).getByText(post.title)).toBeInTheDocument()
      expect(within(postElement).getByText(post.content)).toBeInTheDocument()
      expect(within(postElement).getByText(`Author: ${post.author.name}`)).toBeInTheDocument()
    })
  })

  it('renders no posts message when user has no posts', async () => {
    ;(prisma.post.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.post.count as jest.Mock).mockResolvedValue(0)

    const component = await UserPosts({ params: { id: '1' }, searchParams: {} })
    render(component)

    expect(screen.getByText('No posts found')).toBeInTheDocument()
  })

  it('handles pagination correctly', async () => {
    const mockManyPosts = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      title: `Test Post ${i + 1}`,
      content: `Content ${i + 1}`,
      authorId: 1,
      author: mockUser
    }))

    ;(prisma.post.findMany as jest.Mock).mockResolvedValue(mockManyPosts.slice(0, 6))
    ;(prisma.post.count as jest.Mock).mockResolvedValue(mockManyPosts.length)

    const component = await UserPosts({ params: { id: '1' }, searchParams: { page: '1' } })
    render(component)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('applies correct pagination parameters', async () => {
    await UserPosts({ params: { id: '1' }, searchParams: { page: '2' } })

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      where: { authorId: 1 },
      include: { author: true },
      skip: 6,
      take: 6,
      orderBy: { id: 'desc' }
    })
  })
}) 