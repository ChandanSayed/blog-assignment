import { prisma } from '@/lib/prisma'
import { BlogPost } from '@/app/components/BlogPost'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'

async function getUserFromCookie() {
  const cookieStore = cookies()
  const userJson = cookieStore.get('user-storage')?.value
  if (!userJson) return null
  
  try {
    return JSON.parse(userJson).state
  } catch {
    return null
  }
}

export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  const userData = await getUserFromCookie()
  const postId = Number(params.id)

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
      },
    })

    if (!post) {
      return notFound()
    }

    return (
      <main className="container mx-auto px-2 md:px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <BlogPost
            post={post}
            isEditable={userData?.user?.id === post.authorId}
            showActions={true}
          />
          
          <div className="mt-8">
            <a
              href="/posts"
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              ← Back to all posts
            </a>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error fetching post:', error)
    return notFound()
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(params.id) },
      select: {
        title: true,
        content: true,
      },
    })

    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.',
      }
    }

    return {
      title: post.title,
      description: post.content?.slice(0, 160) || 'No description available',
    }
  } catch {
    return {
      title: 'Post',
      description: 'View post details',
    }
  }
} 