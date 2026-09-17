import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './authOptions.js';
import { getUserById } from '../db/users.js';

/**
 * Retrieves the raw NextAuth session on the server.
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Retrieves the currently authenticated user from the database.
 * Returns safe user object or null if unauthenticated.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }

  // Fetch full user record from database to ensure up-to-date attributes
  const user = await getUserById(session.user.id);
  return user;
}

/**
 * Requires authentication for server components / pages.
 * Redirects unauthenticated requests to /login.
 */
export async function requireAuth(callbackUrl = '/dashboard') {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return user;
}
