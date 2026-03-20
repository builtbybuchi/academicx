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
    EMAIL_SENDS: 'email_sends',
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

export async function listAcademicSessions(schoolId) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.ACADEMIC_SESSIONS, [
        Query.equal('schoolId', schoolId),
        Query.limit(500),
    ]);
}

export async function createAcademicSession(data) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.ACADEMIC_SESSIONS, ID.unique(), data);
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

export async function updateSubject(docId, data) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.SUBJECTS, docId, data);
}

export async function deleteSubject(docId) {
    return databases.deleteDocument(DATABASE_ID, COLLECTIONS.SUBJECTS, docId);
}

export async function upsertClassNames(schoolId, classNames = []) {
    const existing = await listClasses(schoolId);
    const existingNames = new Set(existing.documents.map((item) => item.name));
    const created = [];

    for (const className of classNames) {
        if (!className || existingNames.has(className)) continue;
        const doc = await createClass({ schoolId, name: className, level: className.replace(/[A-Z]$/i, ''), studentCount: 0, formTeacherId: '' });
        created.push(doc);
        existingNames.add(className);
    }

    return { created, existing: existing.documents };
}

export async function upsertSubjects(schoolId, subjectRows = []) {
    const existing = await listSubjects(schoolId);
    const existingKeys = new Set(existing.documents.map((item) => `${item.className}::${item.code}`));
    const created = [];

    for (const row of subjectRows) {
        const className = String(row.className || '').trim();
        const name = String(row.name || '').trim();
        const code = String(row.code || '').trim().toUpperCase();
        if (!className || !name || !code) continue;

        const key = `${className}::${code}`;
        if (existingKeys.has(key)) continue;

        const doc = await createSubject({
            schoolId,
            name,
            code,
            className,
            staffId: row.staffId || '',
        });
        created.push(doc);
        existingKeys.add(key);
    }

    return { created, existing: existing.documents };
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

function isUnknownScoreComponentsError(error) {
    const message = String(error?.message || '').toLowerCase();
    return message.includes('unknown attribute') && message.includes('scorecomponents');
}

function toLegacyGradingPayload(data = {}) {
    let components = [];
    if (Array.isArray(data.scoreComponents)) {
        components = data.scoreComponents;
    } else if (typeof data.scoreComponents === 'string') {
        try {
            const parsed = JSON.parse(data.scoreComponents);
            components = Array.isArray(parsed) ? parsed : [];
        } catch {
            components = [];
        }
    }

    const normalized = components.map((item) => ({
        name: String(item?.name || '').toLowerCase(),
        weight: Number(item?.weight || 0),
    }));

    const catWeight = normalized.find((item) => item.name.includes('cat'))?.weight ?? 30;
    const examWeight = normalized.find((item) => item.name.includes('exam'))?.weight ?? Math.max(0, 100 - catWeight);

    return {
        name: data.name,
        ranges: data.ranges,
        catWeight,
        examWeight,
    };
}

export async function saveGradingScheme(schoolId, data, documentId) {
    try {
        if (documentId) {
            return databases.updateDocument(DATABASE_ID, COLLECTIONS.GRADING_SCHEMES, documentId, data);
        }
        return databases.createDocument(DATABASE_ID, COLLECTIONS.GRADING_SCHEMES, ID.unique(), { schoolId, ...data });
    } catch (error) {
        if (!isUnknownScoreComponentsError(error)) {
            throw error;
        }

        const legacyData = toLegacyGradingPayload(data);
        if (documentId) {
            return databases.updateDocument(DATABASE_ID, COLLECTIONS.GRADING_SCHEMES, documentId, legacyData);
        }
        return databases.createDocument(DATABASE_ID, COLLECTIONS.GRADING_SCHEMES, ID.unique(), { schoolId, ...legacyData });
    }
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

export async function listFormTeachers(schoolId) {
    return invokeBackendFunction('listFormTeachers', { schoolId });
}

export async function assignFormTeacher(payload) {
    return invokeBackendFunction('assignFormTeacher', payload);
}

export async function setStaffAttendanceOfficer(payload) {
    return invokeBackendFunction('setStaffAttendanceOfficer', payload);
}

export async function setStaffExcused(payload) {
    return invokeBackendFunction('staffSetExcused', payload);
}

export async function listStaffAttendanceRecords(payload) {
    return invokeBackendFunction('listStaffAttendanceRecords', payload);
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

function assertChatChannelAccess(role, channel) {
    const normalizedRole = String(role || '').toLowerCase();
    const normalizedChannel = String(channel || '').toLowerCase();
    if ((normalizedRole === 'staff' || normalizedRole === 'student') && (normalizedChannel === 'admins' || normalizedChannel === 'admin')) {
        throw new Error('Access denied to admin-only chat channel.');
    }
}

export async function sendChatMessage(schoolId, senderId, senderName, senderRole, message, channel = 'general') {
    assertChatChannelAccess(senderRole, channel);
    return databases.createDocument(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES, ID.unique(), {
        schoolId,
        senderId,
        senderName,
        senderRole,
        message,
        channel,
        createdAt: new Date().toISOString(),
    });
}

export async function listChatMessages(schoolId, channel = 'general', limit = 50, viewerRole = '') {
    assertChatChannelAccess(viewerRole, channel);
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES, [
        Query.equal('schoolId', schoolId),
        Query.equal('channel', channel),
        Query.orderDesc('createdAt'),
        Query.limit(Number(limit || 50)),
    ]);
}

export async function listSchoolChatMessages(schoolId, limit = 400) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES, [
        Query.equal('schoolId', schoolId),
        Query.orderDesc('createdAt'),
        Query.limit(Number(limit || 400)),
    ]);
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

export function subscribeToSchoolChatMessages(schoolId, callback) {
    const channelString = `databases.${DATABASE_ID}.collections.${COLLECTIONS.CHAT_MESSAGES}.documents`;
    return client.subscribe(channelString, (response) => {
        if (response.payload.schoolId === schoolId) {
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

export async function listEmailSends(schoolId, status, limit = 100) {
    return invokeBackendFunction('listEmailSends', { schoolId, status, limit });
}

export async function resendEmail(schoolId, emailId) {
    return invokeBackendFunction('resendEmail', { schoolId, emailId });
}

export async function getEmailTemplate(schoolId, emailId) {
    return invokeBackendFunction('getEmailTemplate', { schoolId, emailId });
}

export async function initiateResultPublishing(payload) {
    return invokeBackendFunction('initiateResultPublishing', payload);
}

export async function createSquadCoPayment(payload) {
    return invokeBackendFunction('createSquadCoPayment', payload);
}

export async function verifySquadCoPayment(payload) {
    return invokeBackendFunction('verifySquadCoPayment', payload);
}

export async function publishResultsWithPins(payload) {
    return invokeBackendFunction('publishResultsWithPins', payload);
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

export async function resolveStudentLogin(payload) {
    return invokeBackendFunction('resolveStudentLogin', payload);
}

// ── Image Upload ──────────────────────────────────────────

export async function uploadImage(file) {
    return storage.createFile(BUCKET_ID, ID.unique(), file);
}

export function getImageUrl(fileId) {
    return storage.getFilePreview(BUCKET_ID, fileId, 400, 400).toString();
}

export { ID, Query, client };
