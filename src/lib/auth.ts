import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider (disabled until credentials are configured)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    
    // Credentials Provider for email/password login
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Auth: Starting authorization process');
        console.log('🔐 Auth: Received credentials:', { email: credentials?.email, hasPassword: !!credentials?.password });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Auth: Missing credentials');
          return null;
        }

        try {
          // Read users from db.json
          const { readDatabase } = await import('@/lib/users');
          const db = await readDatabase();
          const users = db.users || [];
          
          console.log('🔍 Auth: Found users in database:', users.length);
          
          const user = users.find((u: any) => u.email === credentials.email);
          
          if (!user) {
            console.log('❌ Auth: User not found for email:', credentials.email);
            return null;
          }

          console.log('✅ Auth: User found:', { id: user.id, email: user.email, role: user.role });

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log('🔓 Auth: Password verification result:', isPasswordValid);
          
          if (!isPasswordValid) {
            console.log('❌ Auth: Invalid password for user:', credentials.email);
            return null;
          }

          const returnUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            clinicId: user.clinicId,
            practitionerId: user.practitionerId, // For doctors
          };

          console.log('🎉 Auth: Login successful, returning user:', returnUser);
          return returnUser;
        } catch (error) {
          console.error('💥 Auth: Database error:', error);
          return null;
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Handle initial sign in
      if (user && account && account.provider === 'credentials') {
        console.log('🔄 JWT: Setting user data in token');
        token.role = user.role;
        token.clinicId = user.clinicId;
        token.userId = user.id;
        token.practitionerId = (user as any).practitionerId; // Add practitionerId to token
      }
      
      // Handle existing sessions - refresh practitionerId if missing
      if (token.userId && !token.practitionerId && token.role === 'doctor') {
        console.log('🔄 JWT: Refreshing practitionerId for existing session');
        try {
          // Read users from database to get practitionerId
          const { readDatabase } = await import('@/lib/users');
          const db = await readDatabase();
          const user = db.users?.find((u: any) => u.id === token.userId);
          if (user && user.practitionerId) {
            token.practitionerId = user.practitionerId;
            console.log('✅ JWT: Updated practitionerId in token:', token.practitionerId);
          }
        } catch (error) {
          console.error('❌ JWT: Error refreshing practitionerId:', error);
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      if (token.role) {
        session.user.role = token.role as string;
      }
      if (token.clinicId) {
        session.user.clinicId = token.clinicId as string;
      }
      if (token.practitionerId) {
        (session.user as any).practitionerId = token.practitionerId as string;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback - url:', url, 'baseUrl:', baseUrl);
      // Handle successful login redirect
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/staff/dashboard`; // Default to staff dashboard
    }
  },
  
  pages: {
    signIn: '/auth/signin',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Set to true in production with HTTPS
      },
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: true, // Enable debug mode
};
