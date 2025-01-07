import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Clean up existing data
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});

    // Create users with posts
    const user1 = await prisma.user.create({
      data: {
        email: "alice@example.com",
        name: "Alice Johnson",
        password: "password123",
        posts: {
          create: [
            {
              title: "My First Post",
              content: "This is my first post content. Hello world!",
              published: true,
            },
            {
              title: "My Second Post",
              content: "This is my second post content. Getting the hang of it!",
              published: false,
            },
          ],
        },
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: "bob@example.com",
        name: "Bob Smith",
        password: "password456",
        posts: {
          create: [
            {
              title: "Bob's First Post",
              content: "Hello everyone! This is my first post.",
              published: true,
            },
          ],
        },
      },
    });

    // Create additional standalone posts linked to users
    await prisma.post.create({
      data: {
        title: "Technology Trends 2024",
        content: "AI and machine learning continue to evolve...",
        published: true,
        authorId: user1.id,
      },
    });

    await prisma.post.create({
      data: {
        title: "Web Development Best Practices",
        content: "Modern web development requires...",
        published: true,
        authorId: user2.id,
      },
    });

    await prisma.post.create({
      data: {
        title: "Draft: Future of Programming",
        content: "Programming paradigms are shifting towards...",
        published: false,
        authorId: user1.id,
      },
    });

    // Fetch users with posts to display the results
    const usersWithPosts = await prisma.user.findMany({
      include: {
        posts: true,
      },
    });

    console.log(usersWithPosts);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
