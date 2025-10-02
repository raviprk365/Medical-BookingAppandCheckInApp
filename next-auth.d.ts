import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      clinicId: string;
      practitionerId?: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    clinicId: string;
    practitionerId?: string;
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: string;
    clinicId: string;
    practitionerId?: string;
  }
}