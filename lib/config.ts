const env = process.env.NODE_ENV || 'development'

export const config = {
  baseUrl: env === 'production' 
    ? process.env.NEXT_PUBLIC_BASE_URL 
    : 'http://localhost:3000',
} 