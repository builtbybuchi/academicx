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

// ── Subjects ──────────────────────────────────────────────

export async function listSubjects(schoolId, className) {
    const q = [Query.equal('schoolId', schoolId), Query.limit(50)];
    if (className) q.push(Query.equal('className', className));
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.SUBJECTS, q);
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
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS, [
        Query.equal('studentId', studentId),
        Query.equal('term', term),
        Query.equal('session', session),
        Query.limit(50),
    ]);
}

// ── Attendance ────────────────────────────────────────────

export async function listStudentAttendance(schoolId, className, date) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE, [
        Query.equal('schoolId', schoolId),
        Query.equal('className', className),
        Query.equal('date', date),
        Query.limit(100),
    ]);
}

export async function staffCheckIn(schoolId, staffDocId) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];
    return databases.createDocument(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE, ID.unique(), {
        schoolId, staffDocId, date: today, checkIn: now, status: 'present', markedBy: staffDocId,
    });
}

export async function staffCheckOut(staffDocId) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE, [
        Query.equal('staffDocId', staffDocId), Query.equal('date', today), Query.limit(1),
    ]);
    if (existing.total === 0) throw new Error('No check-in found for today.');
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE, existing.documents[0].$id, { checkOut: now });
}

// ── PINs ──────────────────────────────────────────────────

export async function verifyPin(code, studentId) {
    const pins = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PINS, [
        Query.equal('code', code), Query.limit(1),
    ]);
    if (pins.total === 0) throw new Error('Invalid PIN code.');
    const pin = pins.documents[0];
    if (pin.used && pin.studentId !== studentId) throw new Error('PIN already used by another student.');
    if (!pin.used) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.PINS, pin.$id, { used: true, studentId });
    }
    return pin;
}

export async function checkPinAccess(studentId, term, session) {
    const pins = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PINS, [
        Query.equal('studentId', studentId), Query.equal('term', term),
        Query.equal('session', session), Query.equal('used', true), Query.limit(1),
    ]);
    return pins.total > 0;
}

// ── Chat ──────────────────────────────────────────────────

export async function sendChatMessage(schoolId, senderId, senderName, senderRole, message, channel = 'general') {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES, ID.unique(), {
        schoolId, senderId, senderName, senderRole, message, channel,
        createdAt: new Date().toISOString(),
    });
}

export async function listChatMessages(schoolId, channel = 'general', limit = 50) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES, [
        Query.equal('schoolId', schoolId),
        Query.equal('channel', channel),
        Query.orderDesc('createdAt'),
        Query.limit(limit),
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

// ── Profile ───────────────────────────────────────────────

export async function updateUserProfile(userDocId, data) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, userDocId, data);
}

// ── Image Upload ──────────────────────────────────────────

export async function uploadImage(file) {
    return storage.createFile(BUCKET_ID, ID.unique(), file);
}

export function getImageUrl(fileId) {
    return storage.getFilePreview(BUCKET_ID, fileId, 400, 400).toString();
}

export { ID, Query, client };
