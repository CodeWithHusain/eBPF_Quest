import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

const nextAuthHandler =
  typeof NextAuth === 'function'
    ? NextAuth
    : NextAuth?.default?.default || NextAuth?.default;

const handler = nextAuthHandler(authOptions);

export { handler as GET, handler as POST };
