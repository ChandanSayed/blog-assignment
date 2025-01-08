import { Banner } from '@/app/components/Banner'
import { BlogPost } from '@/app/components/BlogPost'
import { getPosts } from '@/lib/blog'
import Link from 'next/link'
import { Post } from '@prisma/client'

export default async function Home() {
  const posts = await getPosts()
  const recentPosts: Post[] = posts.slice(0, 8)

  return (
    <main>
      <Banner />
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Recent Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentPosts.map((post: Post) => (
            <BlogPost key={post.id} post={post} />
          ))}
        </div>
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
