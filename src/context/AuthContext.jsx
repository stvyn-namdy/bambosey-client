// client/src/context/AuthContext.jsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api, { endpoints } from "../lib/api";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Get user profile from backend
        const response = await api.get(endpoints.auth.profile);
        const userData = response.data;
        
        // Transform user data to match frontend expectations
        const transformedUser = {
          ...userData,
          isAdmin: userData.role === 'ADMIN',
        };
        
        setUser(transformedUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password, remember) => {
    try {
      const response = await api.post(endpoints.auth.login, {
        email,
        password,
        remember,
      });

      const { accessToken, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('accessToken', accessToken);
      
      // Transform user data to match frontend expectations
      const transformedUser = {
        ...userData,
        isAdmin: userData.role === 'ADMIN',
      };
      
      // Set user data
      setUser(transformedUser);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post(endpoints.auth.register, userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await api.post(endpoints.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
