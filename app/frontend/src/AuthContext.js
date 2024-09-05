// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const login = (token, refreshToken) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    setIsAuthenticated(true);
    console.log('[AuthContext] USER LOGGED IN');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    console.log('[AuthContext] USER LOGGED OUT');
  };

  const axiosInstance = axios.create({
    // baseURL: process.env.REACT_APP_API_URL,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          try {
            const response = await axiosInstance.post('/api/refresh-token', {
              refreshToken: refreshToken,
            });

            const { token } = response.data;
            localStorage.setItem('token', token);
            axiosInstance.defaults.headers.common['x-access-token'] = token;

            return axiosInstance(originalRequest);
          } catch (err) {
            logout();
            return Promise.reject(err);
          }
        } else {
          logout();
        }
      }

      return Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, axiosInstance }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
