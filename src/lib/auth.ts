import { SignJWT, jwtVerify } from 'jose'

const getSecretKey = () => {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET is not set in environment variables')
  }
  return new TextEncoder().encode(secret)
}

export async function createAdminToken(payload: { id: string; username: string }) {
  const key = getSecretKey()
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function verifyAdminToken(token: string) {
  try {
    const key = getSecretKey()
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    return payload as { id: string; username: string; exp?: number; iat?: number }
  } catch (error) {
    return null
  }
}
