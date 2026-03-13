require('dotenv').config();
const { Client, Databases, Users, ID, Query } = require('node-appwrite');

const DATABASE_ID = 'academicx_db';
const COLLECTIONS = {
    SCHOOLS: { id: 'schools' },
    USERS: { id: 'users' },
    STUDENTS: { id: 'students' },
    STAFF: { id: 'staff' },
    CLASSES: { id: 'classes' },
    SUBJECTS: { id: 'subjects' },
    RESULTS: { id: 'results' },
    STUDENT_ATTENDANCE: { id: 'student_attendance' },
    STAFF_ATTENDANCE: { id: 'staff_attendance' },
    PINS: { id: 'pins' },
    PAYMENTS: { id: 'payments' },
    CHAT_MESSAGES: { id: 'chat_messages' },
};

function getClient() {
    const client = new Client();
    client
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID || '')
        .setKey(process.env.APPWRITE_API_KEY || '');
    return client;
}

function getDb() {
    return new Databases(getClient());
}

function getUsersApi() {
    return new Users(getClient());
}

function nowIso() {
    return new Date().toISOString();
}

function todayDate() {
    return nowIso().slice(0, 10);
}

function parseJson(value, fallback = {}) {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function getCorsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-AcademicX-Auth-Id',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };
}

function randomPassword(length = 12) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let output = '';
    for (let i = 0; i < length; i += 1) {
        output += chars[Math.floor(Math.random() * chars.length)];
    }
    return output;
}

function randomPin(length = 10) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let output = '';
    for (let i = 0; i < length; i += 1) {
        output += chars[Math.floor(Math.random() * chars.length)];
    }
    return output;
}

function parseJsonArray(raw, fallback = []) {
    if (!raw) return fallback;
    if (Array.isArray(raw)) return raw;
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function extractRoleFromTags(authUser) {
    const roleKeys = ['super_admin', 'admin', 'staff', 'student'];
    const labels = Array.isArray(authUser?.labels) ? authUser.labels : [];
    const prefTags = Array.isArray(authUser?.prefs?.tags) ? authUser.prefs.tags : [];
    const tags = [...labels, ...prefTags].map((item) => String(item).toLowerCase());
    return roleKeys.find((role) => tags.includes(role) || tags.includes(`role:${role}`)) || null;
}

async function getUserByAuthId(authId) {
    const db = getDb();
    const res = await db.listDocuments(DATABASE_ID, COLLECTIONS.USERS.id, [
        Query.equal('authId', authId),
        Query.limit(1),
    ]);
    return res.documents[0] || null;
}

async function getTaggedRole(authId) {
    try {
        const users = getUsersApi();
        const authUser = await users.get(authId);
        return extractRoleFromTags(authUser);
    } catch {
        return null;
    }
}

async function requireRole(authId, allowedRoles) {
    const profile = await getUserByAuthId(authId);
    const taggedRole = await getTaggedRole(authId);
    const effectiveRole = taggedRole || profile?.role;

    if (!effectiveRole) {
        return { authorized: false, error: 'User profile not found.', user: null };
    }

    if (!allowedRoles.includes(effectiveRole)) {
        return { authorized: false, error: `Requires role: ${allowedRoles.join(' or ')}. You are: ${effectiveRole}`, user: profile || null };
    }

    return { authorized: true, user: { ...(profile || {}), role: effectiveRole } };
}

async function requireSchool(authId, schoolId) {
    const profile = await getUserByAuthId(authId);
    const taggedRole = await getTaggedRole(authId);
    const effectiveRole = taggedRole || profile?.role;

    if (!profile && effectiveRole !== 'super_admin') {
        return { authorized: false, error: 'User not found.', user: null };
    }

    if (effectiveRole === 'super_admin') {
        return { authorized: true, user: { ...(profile || {}), role: effectiveRole } };
    }

    if (profile?.schoolId !== schoolId) {
        return { authorized: false, error: 'You do not belong to this school.', user: profile || null };
    }

    return { authorized: true, user: { ...(profile || {}), role: effectiveRole } };
}

async function ensureAuth(definition, authId, payload) {
    if (!definition.roles || definition.roles.length === 0) {
        return { authorized: true, user: null };
    }

    if (!authId) {
        return { authorized: false, error: 'Missing authenticated user context.' };
    }

    const roleCheck = await requireRole(authId, definition.roles);
    if (!roleCheck.authorized) return roleCheck;

    if (!definition.schoolId) return roleCheck;

    const targetSchoolId = definition.schoolId({ payload, authId, user: roleCheck.user });
    if (!targetSchoolId) return roleCheck;

    const schoolCheck = await requireSchool(authId, targetSchoolId);
    if (!schoolCheck.authorized) return schoolCheck;

    return { authorized: true, user: roleCheck.user };
}

async function safeGetSchoolByCode(db, schoolCode) {
    const res = await db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOLS.id, [
        Query.equal('schoolCode', schoolCode),
        Query.limit(1),
    ]);
    return res.documents[0] || null;
}

async function getStudentDocByUser(db, userDocId) {
    const res = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, [
        Query.equal('userId', userDocId),
        Query.limit(1),
    ]);
    return res.documents[0] || null;
}

async function getStaffDocByUser(db, userDocId) {
    const res = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF.id, [
        Query.equal('userId', userDocId),
        Query.limit(1),
    ]);
    return res.documents[0] || null;
}

const actions = {
    registerSchool: {
        handler: async ({ payload }) => {
            const db = getDb();
            const usersApi = getUsersApi();

            const schoolCode = (payload.schoolCode || '').trim().toUpperCase();
            if (!payload.schoolName || !schoolCode || !payload.adminEmail || !payload.adminPassword) {
                return { success: false, error: 'schoolName, schoolCode, adminEmail and adminPassword are required.' };
            }

            const existing = await safeGetSchoolByCode(db, schoolCode);
            if (existing) return { success: false, error: 'School code already exists.' };

            const authUser = await usersApi.create(
                ID.unique(),
                payload.adminEmail,
                undefined,
                payload.adminPassword,
                `${payload.firstName || 'School'} ${payload.lastName || 'Admin'}`.trim()
            );

            const schoolDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, ID.unique(), {
                schoolCode,
                name: payload.schoolName,
                address: payload.address || '',
                email: payload.schoolEmail || payload.adminEmail,
                phone: payload.phone || '',
                logo: payload.logo || '',
                status: 'active',
                paymentModel: payload.paymentModel || 'school_pays',
                customPinPrice: Number(payload.customPinPrice || 0),
                schoolBalance: 0,
                resultPublished: false,
                currentSession: payload.currentSession || '',
                currentTerm: payload.currentTerm || '',
                createdBy: authUser.$id,
                createdAt: nowIso(),
            });

            const userDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.USERS.id, ID.unique(), {
                schoolId: schoolDoc.$id,
                schoolCode,
                authId: authUser.$id,
                email: payload.adminEmail,
                firstName: payload.firstName || 'School',
                lastName: payload.lastName || 'Admin',
                phone: payload.phone || '',
                profileImage: '',
                role: 'admin',
                status: 'active',
                createdAt: nowIso(),
            });

            return { success: true, data: { school: schoolDoc, admin: userDoc } };
        },
    },

    createSchoolAdmin: {
        roles: ['super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const usersApi = getUsersApi();
            const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, payload.schoolId);

            if (!payload.email || !payload.password || !payload.firstName || !payload.lastName) {
                return { success: false, error: 'email, password, firstName and lastName are required.' };
            }

            const authUser = await usersApi.create(
                ID.unique(),
                payload.email,
                undefined,
                payload.password,
                `${payload.firstName} ${payload.lastName}`
            );

            const userDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.USERS.id, ID.unique(), {
                schoolId: school.$id,
                schoolCode: school.schoolCode,
                authId: authUser.$id,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                phone: payload.phone || '',
                profileImage: '',
                role: 'admin',
                status: 'active',
                createdAt: nowIso(),
            });

            return { success: true, data: userDoc };
        },
    },

    addStaff: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const usersApi = getUsersApi();

            if (!payload.schoolId || !payload.firstName || !payload.lastName || !payload.email) {
                return { success: false, error: 'schoolId, firstName, lastName and email are required.' };
            }

            const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, payload.schoolId);
            const password = payload.password || randomPassword();
            const authUser = await usersApi.create(
                ID.unique(),
                payload.email,
                undefined,
                password,
                `${payload.firstName} ${payload.lastName}`
            );

            const userDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.USERS.id, ID.unique(), {
                schoolId: payload.schoolId,
                schoolCode: school.schoolCode,
                authId: authUser.$id,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                phone: payload.phone || '',
                profileImage: '',
                role: 'staff',
                status: 'active',
                createdAt: nowIso(),
            });

            const year = new Date().getFullYear();
            const seq = Date.now().toString().slice(-4);
            const staffId = `${school.schoolCode}/${year}/${seq}`;

            const staffDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.STAFF.id, ID.unique(), {
                schoolId: payload.schoolId,
                userId: userDoc.$id,
                staffId,
                employmentYear: year,
                firstName: payload.firstName,
                lastName: payload.lastName,
                gender: payload.gender || 'male',
                profileImage: '',
                department: payload.department || '',
                staffType: payload.staffType || 'academic',
                assignedClasses: JSON.stringify(payload.assignedClasses || []),
                assignedSubjects: JSON.stringify(payload.assignedSubjects || []),
                formTeacherClass: payload.formTeacherClass || '',
                status: 'active',
            });

            return { success: true, data: { user: userDoc, staff: staffDoc, generatedPassword: payload.password ? null : password } };
        },
    },

    enrollStudent: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const usersApi = getUsersApi();

            if (!payload.schoolId || !payload.firstName || !payload.lastName || !payload.className) {
                return { success: false, error: 'schoolId, firstName, lastName and className are required.' };
            }

            const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, payload.schoolId);
            const year = new Date().getFullYear();
            const seq = Date.now().toString().slice(-4);
            const admissionNumber = `${school.schoolCode}/${year}/${seq}`;

            const studentEmail = payload.email || payload.parentEmail || `${admissionNumber.replace(/\//g, '.').toLowerCase()}@student.local`;
            const password = payload.password || randomPassword();

            const authUser = await usersApi.create(
                ID.unique(),
                studentEmail,
                undefined,
                password,
                `${payload.firstName} ${payload.lastName}`
            );

            const userDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.USERS.id, ID.unique(), {
                schoolId: payload.schoolId,
                schoolCode: school.schoolCode,
                authId: authUser.$id,
                email: studentEmail,
                firstName: payload.firstName,
                lastName: payload.lastName,
                phone: payload.parentPhone || '',
                profileImage: '',
                role: 'student',
                status: 'active',
                createdAt: nowIso(),
            });

            const studentDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.STUDENTS.id, ID.unique(), {
                schoolId: payload.schoolId,
                userId: userDoc.$id,
                admissionNumber,
                admissionYear: year,
                firstName: payload.firstName,
                lastName: payload.lastName,
                gender: payload.gender || 'male',
                dateOfBirth: payload.dateOfBirth || '',
                className: payload.className,
                section: payload.section || 'A',
                profileImage: '',
                parentName: payload.parentName || '',
                parentEmail: payload.parentEmail || '',
                parentPhone: payload.parentPhone || '',
                status: 'active',
            });

            return {
                success: true,
                data: {
                    user: userDoc,
                    student: studentDoc,
                    loginEmail: studentEmail,
                    generatedPassword: payload.password ? null : password,
                },
            };
        },
    },

    updateProfile: {
        roles: ['admin', 'staff', 'student', 'super_admin'],
        handler: async ({ authId, payload, user }) => {
            const db = getDb();
            const actor = user || await getUserByAuthId(authId);
            if (!actor) return { success: false, error: 'User profile not found.' };

            const targetUserId = payload.userId || actor.$id;
            const targetDoc = await db.getDocument(DATABASE_ID, COLLECTIONS.USERS.id, targetUserId);

            if (actor.role !== 'super_admin' && actor.role !== 'admin' && targetDoc.$id !== actor.$id) {
                return { success: false, error: 'You can only update your own profile.' };
            }

            const updates = payload.updates || payload;
            const allowed = {
                firstName: updates.firstName,
                lastName: updates.lastName,
                phone: updates.phone,
                profileImage: updates.profileImage,
                status: updates.status,
            };

            const clean = Object.fromEntries(Object.entries(allowed).filter(([, value]) => value !== undefined));
            const updatedUser = await db.updateDocument(DATABASE_ID, COLLECTIONS.USERS.id, targetUserId, clean);

            if (targetDoc.role === 'student' && (clean.firstName || clean.lastName || clean.profileImage)) {
                const student = await getStudentDocByUser(db, targetDoc.$id);
                if (student) {
                    await db.updateDocument(DATABASE_ID, COLLECTIONS.STUDENTS.id, student.$id, {
                        ...(clean.firstName ? { firstName: clean.firstName } : {}),
                        ...(clean.lastName ? { lastName: clean.lastName } : {}),
                        ...(clean.profileImage ? { profileImage: clean.profileImage } : {}),
                    });
                }
            }

            if (targetDoc.role === 'staff' && (clean.firstName || clean.lastName || clean.profileImage)) {
                const staff = await getStaffDocByUser(db, targetDoc.$id);
                if (staff) {
                    await db.updateDocument(DATABASE_ID, COLLECTIONS.STAFF.id, staff.$id, {
                        ...(clean.firstName ? { firstName: clean.firstName } : {}),
                        ...(clean.lastName ? { lastName: clean.lastName } : {}),
                        ...(clean.profileImage ? { profileImage: clean.profileImage } : {}),
                    });
                }
            }

            return { success: true, data: updatedUser };
        },
    },

    markStudentAttendance: {
        roles: ['admin', 'staff', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload, user }) => {
            const db = getDb();
            const records = Array.isArray(payload.records) ? payload.records : [];
            const date = payload.date || todayDate();
            const output = [];

            for (const record of records) {
                const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE.id, [
                    Query.equal('studentId', record.studentId),
                    Query.equal('date', date),
                    Query.limit(1),
                ]);

                const data = {
                    schoolId: payload.schoolId,
                    studentId: record.studentId,
                    className: payload.className || record.className,
                    date,
                    status: record.status,
                    markedBy: payload.markedBy || user?.$id || '',
                };

                if (existing.total > 0) {
                    const updated = await db.updateDocument(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE.id, existing.documents[0].$id, data);
                    output.push(updated);
                } else {
                    const created = await db.createDocument(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE.id, ID.unique(), data);
                    output.push(created);
                }
            }

            return { success: true, data: output };
        },
    },

    staffCheckIn: {
        roles: ['admin', 'staff', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload, user }) => {
            const db = getDb();
            const date = todayDate();
            const now = new Date().toTimeString().slice(0, 8);
            const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, [
                Query.equal('staffDocId', payload.staffDocId),
                Query.equal('date', date),
                Query.limit(1),
            ]);

            if (existing.total > 0) {
                return db.updateDocument(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, existing.documents[0].$id, {
                    checkIn: now,
                    status: 'present',
                    markedBy: payload.markedBy || user?.$id || '',
                });
            }

            return db.createDocument(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, ID.unique(), {
                schoolId: payload.schoolId,
                staffDocId: payload.staffDocId,
                date,
                checkIn: now,
                checkOut: '',
                status: 'present',
                markedBy: payload.markedBy || user?.$id || '',
            });
        },
    },

    staffCheckOut: {
        roles: ['admin', 'staff', 'super_admin'],
        handler: async ({ payload }) => {
            const db = getDb();
            const date = todayDate();
            const now = new Date().toTimeString().slice(0, 8);

            const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, [
                Query.equal('staffDocId', payload.staffDocId),
                Query.equal('date', date),
                Query.limit(1),
            ]);

            if (existing.total === 0) {
                return { success: false, error: 'No check-in record found for today.' };
            }

            return db.updateDocument(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, existing.documents[0].$id, {
                checkOut: now,
            });
        },
    },

    submitResult: {
        roles: ['admin', 'staff', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload, authId }) => {
            const db = getDb();
            const inputRows = Array.isArray(payload.results) ? payload.results : [payload];
            const saved = [];

            for (const row of inputRows) {
                if (!row.studentId || !row.subjectId || !row.term || !row.session) continue;
                const catScore = Number(row.catScore || 0);
                const examScore = Number(row.examScore || 0);
                const totalScore = Number(row.totalScore ?? (catScore + examScore));

                const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, [
                    Query.equal('studentId', row.studentId),
                    Query.equal('subjectId', row.subjectId),
                    Query.equal('term', row.term),
                    Query.equal('session', row.session),
                    Query.limit(1),
                ]);

                const data = {
                    schoolId: payload.schoolId,
                    studentId: row.studentId,
                    subjectId: row.subjectId,
                    className: row.className || payload.className || '',
                    term: row.term,
                    session: row.session,
                    catScore,
                    examScore,
                    totalScore,
                    grade: row.grade || '',
                    remark: row.remark || '',
                    status: row.status || 'submitted',
                    submittedBy: authId,
                };

                if (existing.total > 0) {
                    saved.push(await db.updateDocument(DATABASE_ID, COLLECTIONS.RESULTS.id, existing.documents[0].$id, data));
                } else {
                    saved.push(await db.createDocument(DATABASE_ID, COLLECTIONS.RESULTS.id, ID.unique(), data));
                }
            }

            return { success: true, data: saved };
        },
    },

    approveResults: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const filters = [
                Query.equal('schoolId', payload.schoolId),
                Query.equal('className', payload.className),
                Query.equal('term', payload.term),
                Query.equal('session', payload.session),
                Query.limit(500),
            ];
            const rows = await db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, filters);
            const updated = await Promise.all(rows.documents.map((doc) => (
                db.updateDocument(DATABASE_ID, COLLECTIONS.RESULTS.id, doc.$id, { status: 'approved' })
            )));
            return { success: true, data: updated };
        },
    },

    generateBroadsheet: {
        roles: ['admin', 'staff', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const results = await db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, [
                Query.equal('schoolId', payload.schoolId),
                Query.equal('className', payload.className),
                Query.equal('term', payload.term),
                Query.equal('session', payload.session),
                Query.limit(1000),
            ]);

            const grouped = {};
            results.documents.forEach((row) => {
                if (!grouped[row.studentId]) grouped[row.studentId] = { studentId: row.studentId, total: 0, subjects: 0 };
                grouped[row.studentId].total += Number(row.totalScore || 0);
                grouped[row.studentId].subjects += 1;
            });

            const sheet = Object.values(grouped)
                .map((item) => ({
                    ...item,
                    average: item.subjects ? Number((item.total / item.subjects).toFixed(2)) : 0,
                }))
                .sort((a, b) => b.average - a.average)
                .map((row, index) => ({ ...row, position: index + 1 }));

            return { success: true, data: sheet };
        },
    },

    generateSchoolPins: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const count = Number(payload.count || 0);
            const rows = [];
            for (let i = 0; i < count; i += 1) {
                rows.push(await db.createDocument(DATABASE_ID, COLLECTIONS.PINS.id, ID.unique(), {
                    schoolId: payload.schoolId,
                    code: randomPin(),
                    studentId: '',
                    term: payload.term || '',
                    session: payload.session || '',
                    used: false,
                    paidBy: 'school',
                    price: 500,
                    paymentRef: payload.paymentRef || `manual-${Date.now()}`,
                    expiresAt: payload.expiresAt || new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: nowIso(),
                }));
            }
            return { success: true, data: rows };
        },
    },

    purchaseStudentPin: {
        roles: ['student', 'admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, payload.schoolId);
            const price = Number(600 + (school.customPinPrice || 0));

            const pin = await db.createDocument(DATABASE_ID, COLLECTIONS.PINS.id, ID.unique(), {
                schoolId: payload.schoolId,
                code: randomPin(),
                studentId: payload.studentId,
                term: payload.term || school.currentTerm || '',
                session: payload.session || school.currentSession || '',
                used: false,
                paidBy: 'student',
                price,
                paymentRef: payload.paymentRef || `manual-${Date.now()}`,
                expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: nowIso(),
            });

            await db.createDocument(DATABASE_ID, COLLECTIONS.PAYMENTS.id, ID.unique(), {
                schoolId: payload.schoolId,
                reference: payload.paymentRef || `manual-${Date.now()}`,
                amount: price,
                currency: 'NGN',
                type: 'student_pin_purchase',
                status: 'success',
                provider: 'manual',
                description: 'Student PIN purchase',
                studentId: payload.studentId,
                pinCount: 1,
                createdAt: nowIso(),
            });

            return { success: true, data: pin };
        },
    },

    verifyPin: {
        handler: async ({ payload }) => {
            const db = getDb();
            const pinRows = await db.listDocuments(DATABASE_ID, COLLECTIONS.PINS.id, [
                Query.equal('code', payload.code),
                Query.limit(1),
            ]);

            if (pinRows.total === 0) {
                return { success: false, error: 'Invalid PIN.' };
            }

            const pin = pinRows.documents[0];
            if (pin.used) {
                return { success: false, error: 'PIN has already been used.' };
            }
            if (pin.studentId && payload.studentId && pin.studentId !== payload.studentId) {
                return { success: false, error: 'PIN does not belong to this student.' };
            }
            if (pin.expiresAt && new Date(pin.expiresAt) < new Date()) {
                return { success: false, error: 'PIN has expired.' };
            }

            const updated = await db.updateDocument(DATABASE_ID, COLLECTIONS.PINS.id, pin.$id, { used: true });
            return { success: true, data: updated };
        },
    },

    sendBulkEmailToParents: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const filters = [
                Query.equal('schoolId', payload.schoolId),
                Query.limit(1000),
            ];
            if (payload.className && payload.className !== 'all') {
                filters.push(Query.equal('className', payload.className));
            }

            const students = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, filters);
            const recipients = students.documents.filter((item) => item.parentEmail).map((item) => item.parentEmail);

            return {
                success: true,
                data: {
                    totalRecipients: recipients.length,
                    sent: recipients.length,
                    failed: 0,
                    previewOnly: true,
                    subject: payload.subject,
                },
            };
        },
    },

    sendSchoolAnnouncement: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const students = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, [
                Query.equal('schoolId', payload.schoolId),
                Query.limit(1000),
            ]);
            const recipients = students.documents.filter((item) => item.parentEmail).map((item) => item.parentEmail);

            return {
                success: true,
                data: {
                    totalRecipients: recipients.length,
                    sent: recipients.length,
                    failed: 0,
                    previewOnly: true,
                    subject: payload.subject,
                },
            };
        },
    },

    sendChatMessage: {
        roles: ['admin', 'staff', 'student', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload, user }) => {
            const db = getDb();
            if (!payload.schoolId || !payload.message) {
                return { success: false, error: 'schoolId and message are required.' };
            }

            return db.createDocument(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES.id, ID.unique(), {
                schoolId: payload.schoolId,
                senderId: payload.senderId || user?.$id || '',
                senderName: payload.senderName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User',
                senderRole: payload.senderRole || user?.role || '',
                message: payload.message,
                channel: payload.channel || 'general',
                createdAt: nowIso(),
            });
        },
    },

    listChatMessages: {
        roles: ['admin', 'staff', 'student', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            return db.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES.id, [
                Query.equal('schoolId', payload.schoolId),
                Query.equal('channel', payload.channel || 'general'),
                Query.orderDesc('createdAt'),
                Query.limit(Number(payload.limit || 100)),
            ]);
        },
    },

    getStaffPortalData: {
        roles: ['staff', 'admin', 'super_admin'],
        handler: async ({ authId }) => {
            const db = getDb();
            const user = await getUserByAuthId(authId);
            if (!user) return { success: false, error: 'Profile not found.' };

            const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, user.schoolId);
            const staff = await getStaffDocByUser(db, user.$id);
            const assignedClasses = parseJsonArray(staff?.assignedClasses, []);

            let classStudents = [];
            if (assignedClasses.length > 0) {
                const studentPromises = assignedClasses.map((className) => db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, [
                    Query.equal('schoolId', user.schoolId),
                    Query.equal('className', className),
                    Query.limit(200),
                ]));
                const responses = await Promise.all(studentPromises);
                classStudents = responses.flatMap((r) => r.documents);
            }

            const subjects = await db.listDocuments(DATABASE_ID, COLLECTIONS.SUBJECTS.id, [
                Query.equal('schoolId', user.schoolId),
                Query.limit(300),
            ]);
            const results = await db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, [
                Query.equal('schoolId', user.schoolId),
                Query.limit(500),
            ]);
            const staffAttendance = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, [
                Query.equal('staffDocId', staff?.$id || ''),
                Query.limit(60),
                Query.orderDesc('date'),
            ]);

            return {
                success: true,
                data: {
                    user,
                    school,
                    staff,
                    assignedClasses,
                    students: classStudents,
                    subjects: subjects.documents,
                    results: results.documents,
                    staffAttendance: staffAttendance.documents,
                    currentTerm: school.currentTerm || '',
                    currentSession: school.currentSession || '',
                },
            };
        },
    },

    getStudentPortalData: {
        roles: ['student', 'admin', 'super_admin'],
        handler: async ({ authId }) => {
            const db = getDb();
            const user = await getUserByAuthId(authId);
            if (!user) return { success: false, error: 'Profile not found.' };

            const student = await getStudentDocByUser(db, user.$id);
            if (!student) return { success: false, error: 'Student profile not found.' };

            const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, user.schoolId);
            const term = school.currentTerm || '';
            const session = school.currentSession || '';

            const [results, attendance, pins] = await Promise.all([
                db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, [
                    Query.equal('studentId', student.$id),
                    ...(term ? [Query.equal('term', term)] : []),
                    ...(session ? [Query.equal('session', session)] : []),
                    Query.limit(300),
                ]),
                db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE.id, [
                    Query.equal('studentId', student.$id),
                    Query.limit(200),
                    Query.orderDesc('date'),
                ]),
                db.listDocuments(DATABASE_ID, COLLECTIONS.PINS.id, [
                    Query.equal('studentId', student.$id),
                    ...(term ? [Query.equal('term', term)] : []),
                    ...(session ? [Query.equal('session', session)] : []),
                    Query.limit(50),
                    Query.orderDesc('createdAt'),
                ]),
            ]);

            return {
                success: true,
                data: {
                    user,
                    student,
                    school,
                    term,
                    session,
                    results: results.documents,
                    attendance: attendance.documents,
                    pins: pins.documents,
                    hasVerifiedPin: pins.documents.some((item) => item.used),
                },
            };
        },
    },

    getSuperAdminPortalData: {
        roles: ['super_admin'],
        handler: async () => {
            const db = getDb();
            const [schools, users, payments, pins, results] = await Promise.all([
                db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOLS.id, [Query.limit(300)]),
                db.listDocuments(DATABASE_ID, COLLECTIONS.USERS.id, [Query.limit(1000)]),
                db.listDocuments(DATABASE_ID, COLLECTIONS.PAYMENTS.id, [Query.limit(1000), Query.orderDesc('createdAt')]),
                db.listDocuments(DATABASE_ID, COLLECTIONS.PINS.id, [Query.limit(1000)]),
                db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, [Query.limit(1000)]),
            ]);

            return {
                success: true,
                data: {
                    schools: schools.documents,
                    users: users.documents,
                    payments: payments.documents,
                    pins: pins.documents,
                    results: results.documents,
                },
            };
        },
    },
};

function normalizeContext(arg1, arg2, arg3) {
    if (arg1 && typeof arg1 === 'object' && arg1.req && arg1.res) {
        return { req: arg1.req, res: arg1.res, error: arg1.error };
    }
    return { req: arg1, res: arg2, error: arg3 };
}

function respondJson(res, payload, status, headers) {
    if (res && typeof res.json === 'function') {
        return res.json(payload, status, headers);
    }
    if (res && typeof res.send === 'function') {
        return res.send(JSON.stringify(payload), status, { 'Content-Type': 'application/json', ...(headers || {}) });
    }
    return payload;
}

function respondText(res, text, status, headers) {
    if (res && typeof res.text === 'function') {
        return res.text(text, status, headers);
    }
    if (res && typeof res.send === 'function') {
        return res.send(text, status, headers);
    }
    return text;
}

module.exports = async (arg1, arg2, arg3) => {
    const { req, res, error } = normalizeContext(arg1, arg2, arg3);
    const corsHeaders = getCorsHeaders();

    if (!req || !res) {
        return { success: false, error: 'Invalid function context.' };
    }

    if (req.method === 'OPTIONS') {
        return respondText(res, '', 204, corsHeaders);
    }

    try {
        const query = parseJson(req.queryString || '{}', {});
        const body = parseJson(req.body, {});
        const action = body.action || query.action;
        const payload = body.payload || body.data || {};
        const authId = req.headers['x-academicx-auth-id'] || payload.authId || '';

        if (!action || !actions[action]) {
            return respondJson(res, { success: false, error: 'Unknown action.' }, 400, corsHeaders);
        }

        const definition = actions[action];
        const authResult = await ensureAuth(definition, authId, payload);

        if (!authResult.authorized) {
            return respondJson(res, { success: false, error: authResult.error }, 403, corsHeaders);
        }

        const result = await definition.handler({ payload, authId, user: authResult.user || null });
        const bodyResult = result && Object.prototype.hasOwnProperty.call(result, 'success') ? result : { success: true, data: result };

        return respondJson(res, bodyResult, bodyResult.success === false ? 400 : 200, corsHeaders);
    } catch (err) {
        if (typeof error === 'function') {
            error(err.message);
        }
        return respondJson(res, { success: false, error: err.message || 'Function execution failed.' }, 500, corsHeaders);
    }
};
