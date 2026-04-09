import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@pharmacy.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              deviceType: 'WEB',
              deviceName: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Invalid credentials');
          }

          const { user, tokens } = data;

          if (!user || !tokens?.accessToken) {
            throw new Error('Invalid response from server');
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'viewer',
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('Authentication failed. Please try again.');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.refreshToken = (user as { refreshToken?: string }).refreshToken;
      }

      if (trigger === 'update' && token) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { accessToken?: string }).accessToken = token.accessToken as string;
        (session.user as { refreshToken?: string }).refreshToken = token.refreshToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      if (user && typeof window !== 'undefined') {
        localStorage.setItem(
          'authToken',
          (user as { accessToken?: string }).accessToken || ''
        );
      }
    },
    async signOut({ token }) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const refreshToken = token?.refreshToken as string | undefined;

        if (refreshToken) {
          await fetch(`${apiUrl}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          }).catch(() => {
            // Ignore logout API errors - we still want to sign out locally
          });
        }
      } catch {
        // Ignore errors during logout
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || process.env.NEXT_AUTH_SECRET || 'your-secret-key-change-in-production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };