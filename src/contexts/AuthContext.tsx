'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginCredentials, RegisterData } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('chorely-auth-user');
    if (savedUser) {
      try {
        const parsedUser: AuthUser = JSON.parse(savedUser);
        
        // Defensive check for old data structure.
        // If `households` is an array of strings, the data is stale.
        if (Array.isArray(parsedUser.households) && parsedUser.households.length > 0 && typeof parsedUser.households[0] === 'string') {
          console.warn('Stale user session data found. Clearing session.');
          localStorage.removeItem('chorely-auth-user');
          setUser(null);
        } else {
          // Here you might want to add a check to verify the user session with the backend
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('chorely-auth-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        return false;
      }

      const userData = await response.json();
      
      // Fetch household info
      const householdsResponse = await fetch(`/api/user/${userData.id}/households`);
      if (!householdsResponse.ok) {
        // Handle case where fetching households fails
        console.error('Failed to fetch user households');
        // Depending on the app's requirements, you might want to log the user out
        // or let them proceed without household info. For now, we'll proceed.
      }
      const households = householdsResponse.ok ? await householdsResponse.json() : [];

      // All users are now considered admins.
      const authUser: AuthUser = { ...userData, households, role: 'admin' };

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Handle registration failure (e.g., email already exists)
        return false;
      }

      // Automatically log in the user after successful registration
      return await login({ email: data.email, password: data.password });

    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chorely-auth-user');
    // Optionally, you could also call a backend endpoint to invalidate the session/token
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