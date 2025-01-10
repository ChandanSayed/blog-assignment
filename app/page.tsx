import { Banner } from '@/app/components/Banner'
import { BlogPost } from '@/app/components/BlogPost'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: { author: true },
    take: 8,
    orderBy: { id: 'desc' },
  })

  return (
    <main>
      <Banner />
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8">Recent Posts</h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <BlogPost key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No posts yet.</p>
        )}
        <div className="text-center mt-8">
          <Link 
            href="/posts" 
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </main>
  )
}
