import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        // Set auth header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  async function login(email, password) {
    try {
      setError('');
      // In a real implementation, this would be an API call to the backend
      // For demo purposes, we'll simulate a successful login
      const userType = email.includes('doctor') ? 'provider' : 'patient';
      const userId = `user_${Math.floor(Math.random() * 1000)}`;
      
      const user = {
        id: userId,
        email,
        name: email.split('@')[0],
        userType,
        token: `demo_token_${userId}`,
      };
      
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      return user;
    } catch (err) {
      setError('Failed to log in: ' + (err.message || 'Unknown error'));
      throw err;
    }
  }

  // Register function
  async function register(name, email, password, userType) {
    try {
      setError('');
      // In a real implementation, this would be an API call to the backend
      // For demo purposes, we'll simulate a successful registration
      const userId = `user_${Math.floor(Math.random() * 1000)}`;
      
      const user = {
        id: userId,
        email,
        name,
        userType,
        token: `demo_token_${userId}`,
      };
      
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      return user;
    } catch (err) {
      setError('Failed to register: ' + (err.message || 'Unknown error'));
      throw err;
    }
  }

  // Logout function
  function logout() {
    setCurrentUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
