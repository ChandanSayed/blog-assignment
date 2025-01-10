import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import Posts from '../page'
import { prisma } from '@/lib/prisma'

// Mock userStore
jest.mock('@/store/userStore', () => ({
  useUserStore: () => ({
    user: {
      id: '123',
      name: 'Test User',
      email: 'test@example.com'
    },
    isAuthenticated: true
  })
}))

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
      count: jest.fn()
    }
  }
}))

// Mock BlogPost component with unique identifiers
jest.mock('@/app/components/BlogPost', () => ({
  BlogPost: ({ post }: any) => (
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

describe('Posts Page', () => {
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
    ;(prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts)
    ;(prisma.post.count as jest.Mock).mockResolvedValue(mockPosts.length)
  })

  it('renders all posts correctly', async () => {
    const component = await Posts({ searchParams: {} })
    render(component)

    expect(screen.getByText('All Blog Posts')).toBeInTheDocument()
    
    mockPosts.forEach(post => {
      const postElement = screen.getByTestId(`post-${post.id}`)
      expect(postElement).toBeInTheDocument()
      expect(within(postElement).getByText(post.title)).toBeInTheDocument()
      expect(within(postElement).getByText(post.content)).toBeInTheDocument()
      expect(within(postElement).getByText(`Author: ${post.author.name}`)).toBeInTheDocument()
    })
  })

  it('renders create new post button', async () => {
    const component = await Posts({ searchParams: {} })
    render(component)

    expect(screen.getByRole('link', { name: /create new post/i }))
      .toHaveAttribute('href', '/posts/create')
  })

  it('handles empty posts list', async () => {
    ;(prisma.post.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.post.count as jest.Mock).mockResolvedValue(0)

    const component = await Posts({ searchParams: {} })
    render(component)

    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('applies correct pagination parameters', async () => {
    await Posts({ searchParams: { page: '2' } })

    expect(prisma.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 6,
      take: 6,
      orderBy: { id: 'desc' },
      include: { author: true }
    }))
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

    const component = await Posts({ searchParams: { page: '1' } })
    render(component)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('handles database errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(prisma.post.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

    const component = await Posts({ searchParams: {} })
    render(component)

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load posts. Please try again later.')).toBeInTheDocument()
    
    consoleError.mockRestore()
  })
}) 