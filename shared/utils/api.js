/**
 * AcademicX - Shared API Layer
 * Wraps Appwrite SDK for all frontend apps.
 */
import { Client, Account, Databases, Storage, Realtime, ID, Query } from 'appwrite';

// ── Appwrite Client ───────────────────────────────────────
const client = new Client();
client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

const FUNCTION_URL = import.meta.env.VITE_APPWRITE_FUNCTION_URL || '';

export const DATABASE_ID = 'academicx_db';
export const BUCKET_ID = 'school_media';

// Collection IDs
export const COLLECTIONS = {
    SCHOOLS: 'schools',
    USERS: 'users',
    STUDENTS: 'students',
    STAFF: 'staff',
    ACADEMIC_SESSIONS: 'academic_sessions',
    CLASSES: 'classes',
    SUBJECTS: 'subjects',
    GRADING_SCHEMES: 'grading_schemes',
    RESULTS: 'results',
    STUDENT_ATTENDANCE: 'student_attendance',
    STAFF_ATTENDANCE: 'staff_attendance',
    PINS: 'pins',
    PAYMENTS: 'payments',
    CHAT_MESSAGES: 'chat_messages',
};

// ── Auth Helpers ──────────────────────────────────────────

export async function login(email, password) {
    return account.createEmailPasswordSession(email, password);
}

export async function logout() {
    return account.deleteSession('current');
}

export async function getCurrentUser() {
    return account.get();
}

export async function getUserProfile(authId) {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [
        Query.equal('authId', authId),
        Query.limit(1),
    ]);
    return res.documents[0] || null;
}

export async function listUsers(schoolId, roles = []) {
    const queries = [Query.limit(500)];
    if (schoolId) queries.push(Query.equal('schoolId', schoolId));
    if (roles.length > 0) queries.push(Query.equal('role', roles));
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, queries);
}

export async function getStudentByUserId(userId) {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS, [
        Query.equal('userId', userId),
        Query.limit(1),
    ]);
    return res.documents[0] || null;
}

export async function getStaffByUserId(userId) {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.STAFF, [
        Query.equal('userId', userId),
        Query.limit(1),
    ]);
    return res.documents[0] || null;
}

export async function invokeBackendFunction(action, payload = {}) {
    if (!FUNCTION_URL) {
        throw new Error('VITE_APPWRITE_FUNCTION_URL is not configured.');
    }

    const currentUser = await account.get().catch(() => null);
    const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(currentUser?.$id ? { 'X-AcademicX-Auth-Id': currentUser.$id } : {}),
        },
        body: JSON.stringify({ action, payload }),
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};

    if (!response.ok || result.success === false) {
        throw new Error(result.error || 'Backend function request failed.');
    }

    return result.data ?? result;
}

// ── School ────────────────────────────────────────────────

export async function getSchool(schoolId) {
    return databases.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS, schoolId);
}

export async function updateSchool(schoolId, data) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.SCHOOLS, schoolId, data);
}

// ── Students ──────────────────────────────────────────────

export async function listStudents(schoolId, className) {
    const queries = [Query.equal('schoolId', schoolId), Query.equal('status', 'active'), Query.limit(200)];
    if (className) queries.push(Query.equal('className', className));
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS, queries);
}

export async function getStudent(docId) {
    return databases.getDocument(DATABASE_ID, COLLECTIONS.STUDENTS, docId);
}

export async function updateStudent(docId, data) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.STUDENTS, docId, data);
}

// ── Staff ─────────────────────────────────────────────────

export async function listStaff(schoolId) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.STAFF, [
        Query.equal('schoolId', schoolId),
        Query.equal('status', 'active'),
        Query.limit(200),
    ]);
}

export async function getStaffDoc(docId) {
    return databases.getDocument(DATABASE_ID, COLLECTIONS.STAFF, docId);
}

export async function updateStaffDoc(docId, data) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.STAFF, docId, data);
}

// ── Classes ───────────────────────────────────────────────

export async function listClasses(schoolId) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.CLASSES, [
        Query.equal('schoolId', schoolId), Query.limit(50),
    ]);
}

export async function createClass(data) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.CLASSES, ID.unique(), data);
}

// ── Subjects ──────────────────────────────────────────────

export async function listSubjects(schoolId, className) {
    const q = [Query.equal('schoolId', schoolId), Query.limit(50)];
    if (className) q.push(Query.equal('className', className));
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.SUBJECTS, q);
}

export async function createSubject(data) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.SUBJECTS, ID.unique(), data);
}

export async function listGradingSchemes(schoolId) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.GRADING_SCHEMES, [
        Query.equal('schoolId', schoolId),
        Query.limit(20),
    ]);
}

export async function getGradingScheme(schoolId) {
    const res = await listGradingSchemes(schoolId);
    return res.documents[0] || null;
}

export async function saveGradingScheme(schoolId, data, documentId) {
    if (documentId) {
        return databases.updateDocument(DATABASE_ID, COLLECTIONS.GRADING_SCHEMES, documentId, data);
    }
    return databases.createDocument(DATABASE_ID, COLLECTIONS.GRADING_SCHEMES, ID.unique(), { schoolId, ...data });
}

// ── Results ───────────────────────────────────────────────

export async function listResults(schoolId, filters = {}) {
    const q = [Query.equal('schoolId', schoolId), Query.limit(500)];
    if (filters.className) q.push(Query.equal('className', filters.className));
    if (filters.term) q.push(Query.equal('term', filters.term));
    if (filters.session) q.push(Query.equal('session', filters.session));
    if (filters.status) q.push(Query.equal('status', filters.status));
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS, q);
}

export async function getStudentResults(studentId, term, session) {
    const queries = [Query.equal('studentId', studentId), Query.limit(200)];
    if (term) queries.push(Query.equal('term', term));
    if (session) queries.push(Query.equal('session', session));
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS, queries);
}

// ── Attendance ────────────────────────────────────────────

export async function listStudentAttendance(schoolId, className, date) {
    const queries = [Query.limit(200)];
    if (schoolId) queries.push(Query.equal('schoolId', schoolId));
    if (className) queries.push(Query.equal('className', className));
    if (date) queries.push(Query.equal('date', date));
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE, queries);
}

export async function getStudentAttendanceRange(studentId, startDate, endDate) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE, [
        Query.equal('studentId', studentId),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.orderAsc('date'),
        Query.limit(200),
    ]);
}

export async function listStaffAttendance(schoolId, date) {
    const queries = [Query.limit(200)];
    if (schoolId) queries.push(Query.equal('schoolId', schoolId));
    if (date) queries.push(Query.equal('date', date));
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE, queries);
}

export async function getStaffAttendanceRange(staffDocId, startDate, endDate) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE, [
        Query.equal('staffDocId', staffDocId),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.orderAsc('date'),
        Query.limit(200),
    ]);
}

export async function staffCheckIn(schoolId, staffDocId) {
    return invokeBackendFunction('staffCheckIn', { schoolId, staffDocId, markedBy: staffDocId });
}

export async function staffCheckOut(staffDocId) {
    return invokeBackendFunction('staffCheckOut', { staffDocId });
}

export async function markStudentAttendance(payload) {
    return invokeBackendFunction('markStudentAttendance', payload);
}

export async function submitResult(payload) {
    return invokeBackendFunction('submitResult', payload);
}

export async function approveResults(payload) {
    return invokeBackendFunction('approveResults', payload);
}

export async function generateBroadsheet(payload) {
    return invokeBackendFunction('generateBroadsheet', payload);
}

// ── PINs ──────────────────────────────────────────────────

export async function verifyPin(code, studentId) {
    return invokeBackendFunction('verifyPin', { code, studentId });
}

export async function checkPinAccess(studentId, term, session) {
    const pins = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PINS, [
        Query.equal('studentId', studentId), Query.equal('term', term),
        Query.equal('session', session), Query.equal('used', true), Query.limit(1),
    ]);
    return pins.total > 0;
}

export async function listPins(schoolId, term, session) {
    const queries = [Query.equal('schoolId', schoolId), Query.limit(500)];
    if (term) queries.push(Query.equal('term', term));
    if (session) queries.push(Query.equal('session', session));
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.PINS, queries);
}

export async function generateSchoolPins(payload) {
    return invokeBackendFunction('generateSchoolPins', payload);
}

export async function purchaseStudentPin(payload) {
    return invokeBackendFunction('purchaseStudentPin', payload);
}

// ── Chat ──────────────────────────────────────────────────

export async function sendChatMessage(schoolId, senderId, senderName, senderRole, message, channel = 'general') {
    return invokeBackendFunction('sendChatMessage', {
        schoolId,
        senderId,
        senderName,
        senderRole,
        message,
        channel,
    });
}

export async function listChatMessages(schoolId, channel = 'general', limit = 50) {
    return invokeBackendFunction('listChatMessages', { schoolId, channel, limit });
}

/**
 * Subscribe to real-time chat messages.
 */
export function subscribeToChatMessages(schoolId, channel, callback) {
    const channelString = `databases.${DATABASE_ID}.collections.${COLLECTIONS.CHAT_MESSAGES}.documents`;
    return client.subscribe(channelString, (response) => {
        if (response.payload.schoolId === schoolId && response.payload.channel === channel) {
            callback(response.payload);
        }
    });
}

// ── Profile ───────────────────────────────────────────────

export async function updateUserProfile(userDocId, data) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, userDocId, data);
}

export async function updateProfile(payload) {
    return invokeBackendFunction('updateProfile', payload);
}

export async function registerSchool(payload) {
    return invokeBackendFunction('registerSchool', payload);
}

export async function enrollStudent(payload) {
    return invokeBackendFunction('enrollStudent', payload);
}

export async function addStaff(payload) {
    return invokeBackendFunction('addStaff', payload);
}

export async function sendBulkEmailToParents(payload) {
    return invokeBackendFunction('sendBulkEmailToParents', payload);
}

export async function sendSchoolAnnouncement(payload) {
    return invokeBackendFunction('sendSchoolAnnouncement', payload);
}

export async function listSchools() {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOLS, [Query.limit(200)]);
}

export async function listPayments(schoolId) {
    const queries = [Query.limit(500)];
    if (schoolId) queries.push(Query.equal('schoolId', schoolId));
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.PAYMENTS, queries);
}

export async function getStaffPortalData() {
    return invokeBackendFunction('getStaffPortalData', {});
}

export async function getStudentPortalData() {
    return invokeBackendFunction('getStudentPortalData', {});
}

export async function getSuperAdminPortalData() {
    return invokeBackendFunction('getSuperAdminPortalData', {});
}

export async function createSchoolAdmin(payload) {
    return invokeBackendFunction('createSchoolAdmin', payload);
}

// ── Image Upload ──────────────────────────────────────────

export async function uploadImage(file) {
    return storage.createFile(BUCKET_ID, ID.unique(), file);
}

export function getImageUrl(fileId) {
    return storage.getFilePreview(BUCKET_ID, fileId, 400, 400).toString();
}

export { ID, Query, client };
