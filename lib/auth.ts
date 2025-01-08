import { config } from './config'

const baseUrl = config.baseUrl

export async function login(email: string, password: string) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Authentication failed')
  }

  return res.json()
}

export async function register(email: string, password: string, name: string) {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Registration failed')
  }

  return res.json()
} 