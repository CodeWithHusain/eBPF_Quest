import Credentials from 'next-auth/providers/credentials';
import Github from 'next-auth/providers/github';
import { verifyCredentials } from '../db/users.js';

// Resolve CJS/ESM interop across different runtime environments
const CredentialsProvider =
  typeof Credentials === 'function'
    ? Credentials
    : Credentials?.default?.default || Credentials?.default;

const GithubProvider =
  typeof Github === 'function'
    ? Github
    : Github?.default?.default || Github?.default;

import { createResilientAdapter } from './resilientAdapter.js';

const githubId = process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET;

export const isGitHubConfigured = Boolean(githubId && githubSecret);

export const authOptions = {
  adapter: createResilientAdapter(),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    ...(isGitHubConfigured
      ? [
          GithubProvider({
            clientId: githubId,
            clientSecret: githubSecret,
            profile(profile) {
              return {
                id: String(profile.id),
                name: profile.name || profile.login,
                email: profile.email,
                image: profile.avatar_url,
                username: profile.login
                  ? profile.login.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_')
                  : `user_${profile.id}`,
                role: 'STUDENT',
              };
            },
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }
        return await verifyCredentials(credentials.identifier, credentials.password);
      },
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/dashboard',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role || 'STUDENT';
      }

      // Handle profile updates from client trigger
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.username) token.username = session.username;
        if (session.image) token.picture = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-bpfquest-stage3-auth-key-minimum32chars',
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions;
