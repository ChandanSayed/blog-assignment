export function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About BlogApp</h3>
            <p className="text-gray-300">
              A platform for sharing thoughts, ideas, and stories with the world.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="/posts" className="text-gray-300 hover:text-white">
                  All Posts
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-300 hover:text-white">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-300 hover:text-white">
                  Sign Up
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300">
              Email: contact@blogapp.com<br />
              Follow us on Twitter: @blogapp
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} BlogApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 