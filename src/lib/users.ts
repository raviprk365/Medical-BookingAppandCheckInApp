import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'staff' | 'practitioner' | 'nurse' | 'patient';
  clinicId: string | null;
  provider?: 'credentials' | 'google';
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'staff' | 'practitioner' | 'nurse' | 'patient';
  clinicId?: string | null;
  provider?: 'credentials' | 'google';
  image?: string;
}

const DB_PATH = path.join(process.cwd(), 'db.json');

// Read the database file
export async function readDatabase(): Promise<any> {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    // Return default structure if file doesn't exist
    return {
      patients: [],
      appointments: [],
      clinics: [],
      specialties: [],
      practitioners: [],
      users: []
    };
  }
}

// Write to the database file
export async function writeDatabase(data: any): Promise<void> {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    console.log('📂 DB: Looking for user with email:', email);
    const db = await readDatabase();
    console.log('📊 DB: Database loaded, total users:', db.users?.length || 0);
    const users = db.users || [];
    const user = users.find((user: User) => user.email === email) || null;
    console.log('🔍 DB: User search result:', user ? { id: user.id, email: user.email, role: user.role } : 'not found');
    return user;
  } catch (error) {
    console.error('💥 Error finding user by email:', error);
    return null;
  }
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  try {
    const db = await readDatabase();
    const users = db.users || [];
    return users.find((user: User) => user.id === id) || null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

// Create a new user
export async function createUser(userData: CreateUserData): Promise<User> {
  try {
    const db = await readDatabase();
    
    // Check if user already exists
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password if provided
    let hashedPassword = '';
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 12);
    }
    
    // Generate unique ID
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser: User = {
      id,
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      role: userData.role,
      clinicId: userData.clinicId || null,
      provider: userData.provider || 'credentials',
      image: userData.image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add user to database
    if (!db.users) {
      db.users = [];
    }
    db.users.push(newUser);
    
    await writeDatabase(db);
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const db = await readDatabase();
    const users = db.users || [];
    const userIndex = users.findIndex((user: User) => user.id === id);
    
    if (userIndex === -1) {
      return null;
    }
    
    // Update user data
    const updatedUser = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    users[userIndex] = updatedUser;
    await writeDatabase(db);
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Verify password
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// Get all users (admin function)
export async function getAllUsers(): Promise<User[]> {
  try {
    const db = await readDatabase();
    return db.users || [];
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}
