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

        // Temporary hardcoded users for testing
        const hardcodedUsers = {
          'admin@sydneymed.com': {
            id: 'user-1',
            email: 'admin@sydneymed.com',
            name: 'Admin User',
            role: 'admin',
            clinicId: 'clinic-1',
            password: '$2b$12$Iqe8ummXQP5Y9kEdqP0tB.Aw0VduhSxR3sMnYoEbw6x9NdM7jOK96'
          },
          'doctor@sydneymed.com': {
            id: 'user-2',
            email: 'doctor@sydneymed.com',
            name: 'Dr. Sarah Chen',
            role: 'doctor',
            clinicId: 'clinic-1',
            password: '$2b$12$Iqe8ummXQP5Y9kEdqP0tB.Aw0VduhSxR3sMnYoEbw6x9NdM7jOK96'
          },
          'nurse@sydneymed.com': {
            id: 'user-3',
            email: 'nurse@sydneymed.com',
            name: 'Nurse Jennifer',
            role: 'nurse',
            clinicId: 'clinic-1',
            password: '$2b$12$Iqe8ummXQP5Y9kEdqP0tB.Aw0VduhSxR3sMnYoEbw6x9NdM7jOK96'
          },
          'reception@sydneymed.com': {
            id: 'user-4',
            email: 'reception@sydneymed.com',
            name: 'Reception Staff',
            role: 'staff',
            clinicId: 'clinic-1',
            password: '$2b$12$Iqe8ummXQP5Y9kEdqP0tB.Aw0VduhSxR3sMnYoEbw6x9NdM7jOK96'
          }
        };

        const user = hardcodedUsers[credentials.email as keyof typeof hardcodedUsers];
        
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
        };

        console.log('🎉 Auth: Login successful, returning user:', returnUser);
        return returnUser;
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
