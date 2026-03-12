/**
 * AcademicX - Auth Context (React)
 * Provides authentication state across all frontend apps using Appwrite.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, getUserProfile } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const authUser = await account.get();
            setUser(authUser);

            // Load profile from users collection
            const profileDoc = await getUserProfile(authUser.$id);
            setProfile(profileDoc);
        } catch {
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        await account.createEmailPasswordSession(email, password);
        await checkAuth();
    }

    async function logout() {
        await account.deleteSession('current');
        setUser(null);
        setProfile(null);
    }

    const value = {
        user,
        profile,
        loading,
        login,
        logout,
        checkAuth,
        isAdmin: profile?.role === 'admin',
        isStaff: profile?.role === 'staff',
        isStudent: profile?.role === 'student',
        isSuperAdmin: profile?.role === 'super_admin',
        schoolId: profile?.schoolId,
        schoolCode: profile?.schoolCode,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        // Return a safe fallback for components outside AuthProvider
        return {
            user: null, profile: null, loading: false,
            login: async () => { }, logout: async () => { },
            isAdmin: false, isStaff: false, isStudent: false, isSuperAdmin: false,
            schoolId: null, schoolCode: null,
        };
    }
    return context;
}

export default AuthContext;
