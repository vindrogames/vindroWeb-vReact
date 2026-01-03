/**
 * Authentication Context
 * Global authentication state management using React Context API
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Check authentication status on mount
     */
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Check if user is authenticated
     */
    async function checkAuth() {
        try {
            const data = await authAPI.getCurrentUser();
            setUser(data.user);
            setError(null);
        } catch (err) {
            setUser(null);
            // Don't set error for initial auth check
        } finally {
            setLoading(false);
        }
    }

    /**
     * Login user
     * @param {Object} credentials - {username, password}
     */
    async function login(credentials) {
        try {
            setError(null);
            const data = await authAPI.login(credentials);
            setUser(data.user);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }

    /**
     * Register new user and auto-login
     * @param {Object} userData - {username, email, password, password_confirm}
     */
    async function register(userData) {
        try {
            setError(null);
            // Register user
            await authAPI.register(userData);

            // Auto-login after successful registration
            const loginData = await login({
                username: userData.username,
                password: userData.password
            });

            return loginData;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }

    /**
     * Logout current user
     */
    async function logout() {
        try {
            await authAPI.logout();
            setUser(null);
            setError(null);
        } catch (err) {
            // Even if logout fails on backend, clear local state
            setUser(null);
            setError(err.message);
            throw err;
        }
    }

    /**
     * Update user data (for profile updates, etc.)
     */
    function updateUser(userData) {
        setUser(prevUser => ({
            ...prevUser,
            ...userData
        }));
    }

    /**
     * Refresh user data from backend
     */
    async function refreshUser() {
        try {
            const data = await authAPI.getCurrentUser();
            setUser(data.user);
            setError(null);
            return data.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to use auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
