/**
 * Authentication Context
 * Global authentication state management using React Context API
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './services/authService';
import { useLoading } from '../LoadingContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const { showLoader, hideLoader } = useLoading();

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

        const isCheatEnabled = import.meta.env.VITE_AUTH_CHEAT === 'true';

        if (isCheatEnabled && import.meta.env.DEV) {
            console.log("🛠️ Auth: Using Frontend Cheat Mode");
            setUser({ id: '999', username: 'dev_user', role: 'admin', provider: 'your mom', login_count: '420' });
            setLoading(false);
            return;
        }

        const returningFromOAuth = sessionStorage.getItem('oauth_pending') === '1';
        if (returningFromOAuth) {
            sessionStorage.removeItem('oauth_pending');
            showLoader();
        }

        console.log("🌐 Auth: Attempting Backend Sync...");

        try {
            const data = await authAPI.getCurrentUser();
            setUser(data.user);
            setError(null);
            if (returningFromOAuth && data.user?.login_count === 1) {
                setShowWelcomeModal(true);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
            if (returningFromOAuth) hideLoader();
        }
    }

    /**
     * Login user
     * @param {Object} credentials - {username, password}
     */
    async function login(credentials) {
        showLoader();
        try {
            setError(null);
            const data = await authAPI.login(credentials);
            setUser(data.user);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            hideLoader();
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
        showLoader();
        try {
            await authAPI.logout();
            setUser(null);
            setError(null);
        } catch (err) {
            setUser(null);
            setError(err.message);
            throw err;
        } finally {
            hideLoader();
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
        showWelcomeModal,
        dismissWelcomeModal: () => setShowWelcomeModal(false),
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
