import { BlogPost } from '@/app/components/BlogPost'
import { prisma } from '@/lib/prisma'
import { Pagination } from '@/app/components/Pagination'
import { notFound, redirect } from 'next/navigation'
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

export default async function UserPosts({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { page?: string }
}) {
  const userData = await getUserFromCookie()
  
  if (!userData?.isAuthenticated) {
    redirect('/login')
  }

  if (userData.user.id !== Number(params.id)) {
    redirect('/posts')
  }

  const page = Number(searchParams.page) || 1
  const pageSize = 6
  const skip = (page - 1) * pageSize

  try {
    const [user, posts, totalPosts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: Number(params.id) },
      }),
      prisma.post.findMany({
        where: { authorId: Number(params.id) },
        include: { author: true },
        skip,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
      prisma.post.count({
        where: { authorId: Number(params.id) },
      }),
    ])

    if (!user) {
      return notFound()
    }

    const totalPages = Math.ceil(totalPosts / pageSize)

    return (
      <main className="container mx-auto px-2 md:px-4">
        <h1 className="text-xl md:text-2xl font-bold mb-4">
          {user.name}&apos;s Posts
        </h1>
        <p className="text-gray-600">Total posts: {totalPosts}</p>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogPost 
                key={post.id} 
                post={post} 
                isEditable={true}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No posts found</p>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} />
        )}
      </main>
    )
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return notFound()
  }
} 