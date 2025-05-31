'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, User, LoginCredentials, RegisterData } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple hash function for demo purposes (in real app use proper hashing)
const simpleHash = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('chorely-auth-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('chorely-auth-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Get users from localStorage
      const savedUsers = localStorage.getItem('chorely-users');
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

      // Find user by email
      const foundUser = users.find(u => u.email === credentials.email);
      
      if (!foundUser) {
        return false;
      }

      // Check password (simple hash comparison)
      const hashedPassword = simpleHash(credentials.password);
      if (foundUser.passwordHash !== hashedPassword) {
        return false;
      }

      // Create auth user (without password)
      const authUser: AuthUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        households: foundUser.households,
      };

      setUser(authUser);
      localStorage.setItem('chorely-auth-user', JSON.stringify(authUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      // Get existing users
      const savedUsers = localStorage.getItem('chorely-users');
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

      // Check if email already exists
      if (users.some(u => u.email === data.email)) {
        return false;
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        passwordHash: simpleHash(data.password),
        createdAt: new Date().toISOString(),
        role: 'user',
        households: [], // New users start with no households
      };

      // Save user
      const updatedUsers = [...users, newUser];
      localStorage.setItem('chorely-users', JSON.stringify(updatedUsers));

      // Auto-login after registration
      const authUser: AuthUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        households: newUser.households,
      };

      setUser(authUser);
      localStorage.setItem('chorely-auth-user', JSON.stringify(authUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chorely-auth-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 