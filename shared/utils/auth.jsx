/**
 * AcademicX - Auth Context (React)
 * Provides authentication state across all frontend apps using Appwrite.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, getUserProfile, resolveStudentLogin } from './api.js';

const AuthContext = createContext(null);

function getRoleFromAuthUser(authUser) {
    const roleKeys = ['super_admin', 'admin', 'staff', 'student'];
    const labels = Array.isArray(authUser?.labels) ? authUser.labels : [];
    const prefTags = Array.isArray(authUser?.prefs?.tags) ? authUser.prefs.tags : [];
    const tags = [...labels, ...prefTags].map((item) => String(item).toLowerCase());

    for (const role of roleKeys) {
        if (tags.includes(role) || tags.includes(`role:${role}`)) {
            return role;
        }
    }

    return null;
}

function prettyRole(role) {
    if (!role) return 'this';
    return role.replace('_', ' ');
}

export function AuthProvider({ children, defaultRole = null }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const authUser = await account.get();
            const taggedRole = getRoleFromAuthUser(authUser);

            if (defaultRole && taggedRole && taggedRole !== defaultRole) {
                await account.deleteSession('current').catch(() => { });
                setUser(null);
                setProfile(null);
                return {
                    ok: false,
                    error: `This portal is for ${prettyRole(defaultRole)} accounts only.`,
                };
            }

            setUser(authUser);

            // Load profile from users collection
            const profileDoc = await getUserProfile(authUser.$id);

            if (defaultRole && profileDoc?.role && profileDoc.role !== defaultRole) {
                await account.deleteSession('current').catch(() => { });
                setUser(null);
                setProfile(null);
                return {
                    ok: false,
                    error: `This portal is for ${prettyRole(defaultRole)} accounts only.`,
                };
            }

            setProfile(profileDoc);
            return { ok: true, user: authUser, profile: profileDoc };
        } catch {
            setUser(null);
            setProfile(null);
            return { ok: false, error: 'No active session.' };
        } finally {
            setLoading(false);
        }
    }

    async function login(identifier, password) {
        let loginEmail = identifier;
        let loginPassword = password;

        if (defaultRole === 'student') {
            const studentId = String(identifier || '').trim();
            const parentCredential = String(password || '').trim();
            const resolved = await resolveStudentLogin({ studentId, parentCredential });
            loginEmail = resolved.loginEmail;
            loginPassword = resolved.loginPassword || parentCredential;
        }

        await account.createEmailPasswordSession(loginEmail, loginPassword);
        const status = await checkAuth();
        if (!status?.ok) {
            throw new Error(status?.error || 'Unable to sign in to this portal with this account.');
        }
    }

    async function logout() {
        await account.deleteSession('current');
        setUser(null);
        setProfile(null);
    }

    const taggedRole = getRoleFromAuthUser(user);
    const effectiveRole = taggedRole || profile?.role || null;

    const value = {
        user,
        profile,
        effectiveRole,
        taggedRole,
        loading,
        login,
        logout,
        checkAuth,
        isAdmin: effectiveRole === 'admin',
        isStaff: effectiveRole === 'staff',
        isStudent: effectiveRole === 'student',
        isSuperAdmin: effectiveRole === 'super_admin',
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
