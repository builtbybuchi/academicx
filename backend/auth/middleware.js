/**
 * AcademicX - Auth Middleware
 * Server-side helpers for role-based access control.
 */
require('dotenv').config();
const { Client, Users, Databases, Query } = require('node-appwrite');
const { DATABASE_ID, COLLECTIONS } = require('../database/schema.js');

function getClient() {
    const client = new Client();
    client
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID || '')
        .setKey(process.env.APPWRITE_API_KEY || '');
    return client;
}

/**
 * Get user profile from auth ID.
 */
async function getUserByAuthId(authId) {
    const db = new Databases(getClient());
    const res = await db.listDocuments(DATABASE_ID, COLLECTIONS.USERS.id, [
        Query.equal('authId', authId),
        Query.limit(1),
    ]);
    return res.documents[0] || null;
}

function extractRoleFromTags(authUser) {
    const roleKeys = ['super_admin', 'admin', 'staff', 'student'];
    const labels = Array.isArray(authUser?.labels) ? authUser.labels : [];
    const prefTags = Array.isArray(authUser?.prefs?.tags) ? authUser.prefs.tags : [];
    const tags = [...labels, ...prefTags]
        .map((item) => String(item).toLowerCase())
        .map((item) => (item === 'superadmin' ? 'super_admin' : item))
        .map((item) => (item === 'role:superadmin' ? 'role:super_admin' : item));
    return roleKeys.find((role) => tags.includes(role) || tags.includes(`role:${role}`)) || null;
}

async function getTaggedRole(authId) {
    try {
        const users = new Users(getClient());
        const authUser = await users.get(authId);
        return extractRoleFromTags(authUser);
    } catch {
        return null;
    }
}

/**
 * Verify that a user has the required role for an operation.
 * @param {string} authId - Appwrite Auth user ID (from JWT)
 * @param {string[]} allowedRoles - e.g. ['admin', 'super_admin']
 */
async function requireRole(authId, allowedRoles) {
    const profile = await getUserByAuthId(authId);
    const taggedRole = await getTaggedRole(authId);
    const effectiveRole = taggedRole || profile?.role;

    if (!profile && !effectiveRole) {
        return { authorized: false, error: 'User profile not found.', user: null };
    }

    if (!allowedRoles.includes(effectiveRole)) {
        return { authorized: false, error: `Requires role: ${allowedRoles.join(' or ')}. You are: ${effectiveRole || 'unknown'}`, user: profile };
    }

    return { authorized: true, user: { ...(profile || {}), role: effectiveRole } };
}

/**
 * Verify that a user belongs to a specific school.
 */
async function requireSchool(authId, schoolId) {
    const profile = await getUserByAuthId(authId);

    if (!profile) return { authorized: false, error: 'User not found.' };

    if (profile.role === 'super_admin') return { authorized: true, user: profile };

    if (profile.schoolId !== schoolId) {
        return { authorized: false, error: 'You do not belong to this school.' };
    }

    return { authorized: true, user: profile };
}

/**
 * Check if a staff member is the form teacher of a class.
 */
async function isFormTeacher(authId, className) {
    const db = new Databases(getClient());
    const profile = await getUserByAuthId(authId);

    if (!profile || profile.role !== 'staff') return false;

    const staffDocs = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF.id, [
        Query.equal('userId', profile.authId),
        Query.limit(1),
    ]);

    if (staffDocs.total === 0) return false;

    return staffDocs.documents[0].formTeacherClass === className;
}

/**
 * Check if a staff member is assigned to teach a subject.
 */
async function isSubjectTeacher(authId, subjectId) {
    const db = new Databases(getClient());
    const subject = await db.getDocument(DATABASE_ID, COLLECTIONS.SUBJECTS.id, subjectId);
    const profile = await getUserByAuthId(authId);

    if (!profile) return false;

    // Get staff doc
    const staffDocs = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF.id, [
        Query.equal('userId', profile.authId),
        Query.limit(1),
    ]);

    if (staffDocs.total === 0) return false;

    return subject.staffId === staffDocs.documents[0].$id;
}

module.exports = {
    getUserByAuthId,
    requireRole,
    requireSchool,
    isFormTeacher,
    isSubjectTeacher,
};
