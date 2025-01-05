import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, secret, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function getSession() {
  const token = cookies().get('session')?.value;
  if (!token) return null;
  try {
    return await decrypt(token);
  } catch (error) {
    return null;
  }
}

export async function getSessionFromRequest(req: Request) {
  const token = req.headers.get('cookie')?.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
  if (!token) throw new Error('Unauthorized');
  try {
    return await decrypt(token);
  } catch (error) {
    throw new Error('Unauthorized');
  }
}
