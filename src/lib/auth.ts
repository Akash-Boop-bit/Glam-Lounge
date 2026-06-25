import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'glam-lounge-super-secret-key-2026';
const key = new TextEncoder().encode(JWT_SECRET);

export async function signJWT(payload: any): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function verifyJWT(token: string): Promise<any | null> {
  try {
    const { payload } = await jose.jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

