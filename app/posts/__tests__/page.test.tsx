import { render, screen } from '@testing-library/react'
import Posts from '../page'
import { prisma } from '@/lib/prisma'
import { initializeDatabase } from '@/lib/initDb'

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

jest.mock('@/lib/initDb', () => ({
  initializeDatabase: jest.fn(),
}))

// Mock the stores
jest.mock('@/store/userStore', () => ({
  useUserStore: jest.fn(() => ({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    },
    isAuthenticated: true
  }))
}))

jest.mock('@/store/blogStore', () => ({
  useBlogStore: jest.fn(() => ({
    posts: [],
    dispatch: jest.fn()
  }))
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn()
  }))
}))

// Mock BlogPost component
jest.mock('@/app/components/BlogPost', () => ({
  BlogPost: ({ post }: any) => (
    <div data-testid={`post-${post.id}`}>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <span>By {post.author.name}</span>
    </div>
  )
}))

jest.mock('next/link', () => 
  function Link({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
)

describe('Posts Page', () => {
  const mockPosts = [
    {
      id: 1,
      title: 'Test Post 1',
      content: 'Test Content 1',
      authorId: 1,
      author: {
        id: 1,
        name: 'Test Author',
        email: 'test@example.com',
      },
    },
    {
      id: 2,
      title: 'Test Post 2',
      content: 'Test Content 2',
      authorId: 1,
      author: {
        id: 1,
        name: 'Test Author',
        email: 'test@example.com',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the transaction to return posts and count
    ;(prisma.$transaction as jest.Mock).mockResolvedValue([mockPosts, mockPosts.length])
  })

  it('renders all posts correctly', async () => {
    const page = await Posts({ searchParams: {} })
    render(page)

    // Check if posts are rendered
    expect(screen.getByTestId('post-1')).toBeInTheDocument()
    expect(screen.getByTestId('post-2')).toBeInTheDocument()
    expect(screen.getByText('All Blog Posts')).toBeInTheDocument()
  })

  it('renders empty state when no posts', async () => {
    ;(prisma.$transaction as jest.Mock).mockResolvedValue([[], 0])

    const page = await Posts({ searchParams: {} })
    render(page)

    expect(screen.getByText('No posts found.')).toBeInTheDocument()
  })

  it('handles pagination correctly', async () => {
    const page = await Posts({ searchParams: { page: '1' } })
    render(page)

    // Verify that the correct number of posts is displayed
    const posts = screen.getAllByTestId(/post-/)
    expect(posts).toHaveLength(2)
  })

  it('handles errors gracefully', async () => {
    ;(prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'))

    const page = await Posts({ searchParams: {} })
    render(page)

    expect(screen.getByText('Failed to load posts. Please try again later.')).toBeInTheDocument()
  })

  it('initializes database before fetching posts', async () => {
    await Posts({ searchParams: {} })

    expect(initializeDatabase).toHaveBeenCalled()
    expect(prisma.$transaction).toHaveBeenCalled()
  })
}) 