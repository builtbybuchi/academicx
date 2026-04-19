require('dotenv').config();
const { Client, Databases, Users, ID, Query } = require('node-appwrite');
const nodemailer = require('nodemailer');

// Alibaba Cloud Direct Mail SMTP Configuration
const SMTP_FROM = process.env.SMTP_FROM || 'AcademicX <no-reply@mail.sinod.app>';
const SMTP_HOST = process.env.SMTP_HOST || 'smtpdm-ap-southeast-1.aliyun.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '80', 10);
const SMTP_USERNAME = process.env.SMTP_USERNAME || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const DATABASE_ID = 'academicx_db';
const COLLECTIONS = {
    SCHOOLS: { id: 'schools' },
    USERS: { id: 'users' },
    STUDENTS: { id: 'students' },
    STAFF: { id: 'staff' },
    ACADEMIC_SESSIONS: { id: 'academic_sessions' },
    CLASSES: { id: 'classes' },
    SUBJECTS: { id: 'subjects' },
    RESULTS: { id: 'results' },
    STUDENT_ATTENDANCE: { id: 'student_attendance' },
    STAFF_ATTENDANCE: { id: 'staff_attendance' },
    PINS: { id: 'pins' },
    PAYMENTS: { id: 'payments' },
    CHAT_MESSAGES: { id: 'chat_messages' },
    EMAIL_SENDS: { id: 'email_sends' },
    CONTACT_MESSAGES: { id: 'contact_messages' },
    SCHOOL_FEES: { id: 'school_fees' },
    WHATSAPP_REMINDERS: { id: 'whatsapp_reminders' },
};

function getClient() {
    const client = new Client();
    client
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID || '69b314920018940d98b4')
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

const SQUAD_FEE_RATE = 0.012;
const PLATFORM_FEE_RATE = 0.007;
const TOTAL_FEE_RATE = SQUAD_FEE_RATE + PLATFORM_FEE_RATE;

function computePaymentFees(amount) {
    const numericAmount = Number(amount || 0);
    const squadFee = Number((numericAmount * SQUAD_FEE_RATE).toFixed(2));
    const platformFee = Number((numericAmount * PLATFORM_FEE_RATE).toFixed(2));
    return {
        amount: numericAmount,
        squadFee,
        platformFee,
        totalFee: Number((squadFee + platformFee).toFixed(2)),
        totalCharge: Number((numericAmount + squadFee + platformFee).toFixed(2)),
    };
}

async function createPaymentAttemptRecord(db, data) {
    const basePayload = {
        schoolId: data.schoolId,
        reference: data.reference,
        amount: data.amount,
        currency: data.currency || 'NGN',
        status: data.status || 'pending',
        provider: data.provider || 'squad',
        description: data.description || '',
        studentId: data.studentId || '',
        createdAt: data.createdAt || nowIso(),
        metadata: data.metadata || '{}',
    };

    const candidateTypes = Array.from(new Set([
        data.type || 'school_fee',
        'pin_purchase',
    ]));

    let lastErr = null;
    for (const candidateType of candidateTypes) {
        try {
            return await db.createDocument(DATABASE_ID, COLLECTIONS.PAYMENTS.id, ID.unique(), {
                ...basePayload,
                type: candidateType,
            });
        } catch (err) {
            lastErr = err;
        }
    }

    throw lastErr || new Error('Unable to create payment attempt record.');
}

function stripHtmlTags(value) {
    return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildPaymentReceiptHtml({ school, student, feeDoc, paymentAmount, serviceFee, totalCharge, reference, paymentDate }) {
    const schoolName = school?.name || 'AcademicX School';
    const studentName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim();
    const admissionNumber = student?.admissionNumber || '';
    const term = feeDoc?.term || '';
    const session = feeDoc?.session || '';
    return `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 680px; margin: 0 auto; padding: 24px; background: #f8fafc;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px;">
                <h2 style="margin: 0 0 12px; font-size: 24px; color: #1d4ed8;">Payment Receipt</h2>
                <p style="margin: 0 0 20px; color: #475569;">${schoolName} has successfully received a school fee payment.</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr><td style="padding: 8px 0; color: #64748b; width: 180px;">Student</td><td style="padding: 8px 0; font-weight: 600;">${studentName}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Admission Number</td><td style="padding: 8px 0; font-weight: 600;">${admissionNumber}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Term / Session</td><td style="padding: 8px 0; font-weight: 600;">${term} / ${session}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Fee Paid</td><td style="padding: 8px 0; font-weight: 600;">₦${Number(paymentAmount || 0).toLocaleString()}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Service Fee</td><td style="padding: 8px 0; font-weight: 600;">₦${Number(serviceFee || 0).toLocaleString()}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Total Charged</td><td style="padding: 8px 0; font-weight: 600;">₦${Number(totalCharge || 0).toLocaleString()}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Reference</td><td style="padding: 8px 0; font-weight: 600;">${reference || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Paid At</td><td style="padding: 8px 0; font-weight: 600;">${paymentDate || nowIso()}</td></tr>
                </table>
                <p style="margin: 24px 0 0; color: #64748b; font-size: 13px;">This receipt was generated automatically after verified payment confirmation.</p>
            </div>
        </div>
    `;
}

async function sendPaymentReceiptEmails(db, { school, student, feeDoc, paymentAmount, serviceFee, totalCharge, reference, paymentDate }) {
    const recipients = [...new Set([
        String(student?.parentEmail || '').trim(),
        String(school?.email || '').trim(),
        'lexrunit@gmail.com',
    ].filter(Boolean))];

    if (recipients.length === 0) return [];

    const subject = `Payment receipt - ${school?.name || 'AcademicX School'}`;
    const html = buildPaymentReceiptHtml({ school, student, feeDoc, paymentAmount, serviceFee, totalCharge, reference, paymentDate });
    const text = stripHtmlTags(html);
    const results = [];

    for (const recipient of recipients) {
        const result = await sendEmailWithSMTP({ to: recipient, subject, html, text });
        results.push({ recipient, ...result });

        await saveEmailRecord(db, {
            schoolId: school?.$id || '',
            recipients: [recipient],
            subject,
            body: html,
            status: result.success ? 'sent' : 'failed',
            errorMessage: result.error || '',
            sentBy: 'system',
        });
    }

    return results;
}

async function finalizeSchoolFeePayment(db, { transactionRef, metadata, paymentDate }) {
    const feeId = String(metadata?.feeId || '').trim();
    const studentId = String(metadata?.studentId || '').trim();
    const schoolId = String(metadata?.schoolId || '').trim();
    const paymentAmount = Number(metadata?.paymentAmount || 0);

    if (!transactionRef || !feeId || !studentId || !schoolId) {
        throw new Error('Missing payment metadata for school fee finalization.');
    }
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
        throw new Error('Invalid payment amount in transaction metadata.');
    }

    const paymentRows = await db.listDocuments(DATABASE_ID, COLLECTIONS.PAYMENTS.id, [
        Query.equal('reference', transactionRef),
        Query.limit(1),
    ]);
    const existingPayment = paymentRows.total > 0 ? paymentRows.documents[0] : null;
    if (existingPayment && String(existingPayment.status || '').toLowerCase() === 'success') {
        return { success: true, alreadyProcessed: true, feeId };
    }

    const feeDoc = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, feeId);
    const principalAmount = Number(feeDoc.amount || 0);
    const amountPaid = Number((Number(feeDoc.amountPaid || 0) + paymentAmount).toFixed(2));
    const outstandingAmount = Math.max(0, Number((principalAmount - amountPaid).toFixed(2)));
    const status = outstandingAmount <= 0 ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending');
    const serviceFee = Math.min(Number((paymentAmount * TOTAL_FEE_RATE).toFixed(2)), 2500);
    const totalCharge = Number((paymentAmount + serviceFee).toFixed(2));
    const processedAt = paymentDate || nowIso();

    await db.updateDocument(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, feeId, {
        status,
        amountPaid,
        outstandingAmount,
        paidAt: processedAt,
        lastPaymentAt: processedAt,
        paymentReference: transactionRef,
        updatedAt: processedAt,
    });

    if (existingPayment) {
        const existingMeta = parseJson(existingPayment.metadata || '{}', {});
        await db.updateDocument(DATABASE_ID, COLLECTIONS.PAYMENTS.id, existingPayment.$id, {
            status: 'success',
            metadata: JSON.stringify({
                ...existingMeta,
                stage: 'successful',
                verifiedAt: processedAt,
            }),
        });
    } else {
        await createPaymentAttemptRecord(db, {
            schoolId,
            reference: transactionRef,
            amount: paymentAmount,
            currency: 'NGN',
            type: 'school_fee',
            status: 'success',
            provider: 'squad',
            description: `School fee payment (${feeDoc.term || ''} ${feeDoc.session || ''})`,
            studentId,
            createdAt: processedAt,
            metadata: JSON.stringify({
                kind: 'school_fee',
                stage: 'successful',
                verifiedAt: processedAt,
                feeId,
                term: feeDoc.term || '',
                session: feeDoc.session || '',
                paymentAmount,
                serviceFee,
                totalCharge,
            }),
        });
    }

    const [student, school] = await Promise.all([
        db.getDocument(DATABASE_ID, COLLECTIONS.STUDENTS.id, studentId),
        db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, schoolId),
    ]);

    try {
        await sendPaymentReceiptEmails(db, {
            school,
            student,
            feeDoc,
            paymentAmount,
            serviceFee,
            totalCharge,
            reference: transactionRef,
            paymentDate: processedAt,
        });
    } catch (receiptError) {
        console.error('Failed to send payment receipt email:', receiptError?.message || receiptError);
    }

    if (student.parentPhone) {
        try {
            const reminderService = require('../whatsapp/reminder-service');
            await reminderService.handlePaymentSuccess({
                feeId,
                transactionRef,
                metadata,
            });
        } catch (whatsAppError) {
            console.error('Failed to send WhatsApp payment confirmation:', whatsAppError?.message || whatsAppError);
        }
    }

    return {
        success: true,
        alreadyProcessed: false,
        feeId,
        transactionRef,
        paymentAmount,
        serviceFee,
        totalCharge,
    };
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
    const tags = [...labels, ...prefTags]
        .map((item) => String(item).toLowerCase())
        .map((item) => (item === 'superadmin' ? 'super_admin' : item))
        .map((item) => (item === 'role:superadmin' ? 'role:super_admin' : item));
    return roleKeys.find((role) => tags.includes(role) || tags.includes(`role:${role}`)) || null;
}

function normalizePhone(value) {
    return String(value || '').replace(/\D+/g, '');
}

// Create SMTP transporter for Alibaba Cloud Direct Mail
function createSMTPTransport() {
    if (!SMTP_USERNAME || !SMTP_PASS) {
        return null;
    }
    
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USERNAME,
            pass: SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
}

async function sendEmailWithSMTP({ to, subject, html, text }) {
    const transporter = createSMTPTransport();
    
    if (!transporter) {
        return { success: false, error: 'SMTP not configured. Please set SMTP_USERNAME and SMTP_PASS.' };
    }

    try {
        const info = await transporter.sendMail({
            from: SMTP_FROM,
            to: Array.isArray(to) ? to.join(',') : to,
            subject,
            html,
            text,
        });

        return { success: true, messageId: info.messageId };
    } catch (error) {
        return { success: false, error: error.message || 'Failed to send email' };
    }
}

// Save email send record to database
async function saveEmailRecord(db, { schoolId, recipients, subject, body, status, errorMessage, sentBy }) {
    try {
        return await db.createDocument(DATABASE_ID, COLLECTIONS.EMAIL_SENDS.id, ID.unique(), {
            schoolId,
            recipients: Array.isArray(recipients) ? recipients : [recipients],
            subject,
            body,
            status,
            errorMessage: errorMessage || '',
            sentBy: sentBy || '',
            sentAt: status === 'sent' ? nowIso() : '',
            createdAt: nowIso(),
        });
    } catch (err) {
        console.error('Failed to save email record:', err);
        return null;
    }
}

// Resend a previously sent email
async function resendEmail(db, emailId) {
    try {
        const emailRecord = await db.getDocument(DATABASE_ID, COLLECTIONS.EMAIL_SENDS.id, emailId);
        if (!emailRecord) {
            return { success: false, error: 'Email record not found' };
        }

        const result = await sendEmailWithSMTP({
            to: emailRecord.recipients,
            subject: emailRecord.subject,
            html: emailRecord.body,
            text: emailRecord.body?.replace(/<[^>]*>/g, ' ') || '',
        });

        // Save new record
        await saveEmailRecord(db, {
            schoolId: emailRecord.schoolId,
            recipients: emailRecord.recipients,
            subject: emailRecord.subject,
            body: emailRecord.body,
            status: result.success ? 'sent' : 'failed',
            errorMessage: result.error || '',
            sentBy: emailRecord.sentBy,
        });

        return result;
    } catch (err) {
        return { success: false, error: err.message };
    }
}

function phoneMatches(inputPhone, storedPhone) {
    const left = normalizePhone(inputPhone);
    const right = normalizePhone(storedPhone);
    if (!left || !right) return false;
    if (left === right) return true;

    // Accept local/international variants by matching the trailing 10 digits.
    const left10 = left.slice(-10);
    const right10 = right.slice(-10);
    return left10 && right10 && left10 === right10;
}

function isDuplicateAuthUserError(err) {
    const message = String(err?.message || '').toLowerCase();
    return Boolean(err?.code === 409 || message.includes('same id, email, or phone'));
}

async function generateUniqueAdmissionNumber(db, schoolId, schoolCode) {
    const year = new Date().getFullYear();

    for (let attempt = 0; attempt < 12; attempt += 1) {
        const randomTail = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`.slice(-6);
        const admissionNumber = `${schoolCode}/${year}/${randomTail}`;

        const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, [
            Query.equal('schoolId', schoolId),
            Query.equal('admissionNumber', admissionNumber),
            Query.limit(1),
        ]);

        if (existing.total === 0) {
            return { admissionNumber, year };
        }
    }

    throw new Error('Unable to generate a unique student ID. Please try again.');
}

async function setAuthUserTags(usersApi, authUserId, role, schoolId) {
    const labels = [role, `role:${role}`];
    if (schoolId) labels.push(`school:${schoolId}`);

    if (typeof usersApi.updateLabels === 'function') {
        try {
            await usersApi.updateLabels(authUserId, labels);
        } catch {
            // Best-effort only. Profile role remains source of truth fallback.
        }
    }

    if (typeof usersApi.updatePrefs === 'function') {
        try {
            await usersApi.updatePrefs(authUserId, {
                tags: labels,
                role,
                schoolId: schoolId || '',
            });
        } catch {
            // Best-effort only.
        }
    }
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
    if (definition.auth && !authId) {
        return { authorized: false, error: 'Missing authenticated user context.' };
    }

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

async function getClassByIdOrName(db, schoolId, classId, className) {
    if (classId) {
        const classDoc = await db.getDocument(DATABASE_ID, COLLECTIONS.CLASSES.id, classId);
        if (classDoc.schoolId !== schoolId) {
            throw new Error('Class does not belong to this school.');
        }
        return classDoc;
    }

    const normalized = String(className || '').trim();
    if (!normalized) {
        throw new Error('classId or className is required.');
    }

    const res = await db.listDocuments(DATABASE_ID, COLLECTIONS.CLASSES.id, [
        Query.equal('schoolId', schoolId),
        Query.equal('name', normalized),
        Query.limit(1),
    ]);
    if (res.total === 0) {
        throw new Error('Class not found.');
    }
    return res.documents[0];
}

function isAdminRole(role) {
    return role === 'admin' || role === 'super_admin';
}

async function canManageStaffAttendance(db, actor, schoolId) {
    if (!actor?.role) return false;
    if (isAdminRole(actor.role)) return true;
    if (actor.role !== 'staff') return false;

    const staffDoc = await getStaffDocByUser(db, actor.$id);
    if (!staffDoc || staffDoc.schoolId !== schoolId) return false;
    return Boolean(staffDoc.canMarkStaffAttendance || staffDoc.attendanceRole === 'officer');
}

async function canMarkClassAttendance(db, actor, schoolId, className) {
    if (!actor?.role) return false;
    if (isAdminRole(actor.role)) return true;
    if (actor.role !== 'staff') return false;

    const staffDoc = await getStaffDocByUser(db, actor.$id);
    if (!staffDoc || staffDoc.schoolId !== schoolId) return false;

    const classNameNormalized = String(className || '').trim();
    if (!classNameNormalized) return false;

    const multi = parseJsonArray(staffDoc.formTeacherClasses, []);
    if (multi.includes(classNameNormalized)) return true;

    return String(staffDoc.formTeacherClass || '').trim() === classNameNormalized;
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

            console.log('Registering school:', payload.schoolName, payload.adminEmail);
            const authUser = await usersApi.create(
                ID.unique(),
                payload.adminEmail,
                undefined,
                payload.adminPassword,
                `${payload.firstName || 'School'} ${payload.lastName || 'Admin'}`.trim()
            ).catch(e => {
                console.error('Appwrite user creation failed:', e.message);
                throw e;
            });
            console.log('Auth user created:', authUser.$id);

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

            await setAuthUserTags(usersApi, authUser.$id, 'admin', schoolDoc.$id);

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

            await setAuthUserTags(usersApi, authUser.$id, 'admin', school.$id);

            return { success: true, data: userDoc };
        },
    },

    listFormTeachers: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const [classesRes, staffRes] = await Promise.all([
                db.listDocuments(DATABASE_ID, COLLECTIONS.CLASSES.id, [
                    Query.equal('schoolId', payload.schoolId),
                    Query.limit(500),
                ]),
                db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF.id, [
                    Query.equal('schoolId', payload.schoolId),
                    Query.equal('status', 'active'),
                    Query.limit(500),
                ]),
            ]);

            const staffById = Object.fromEntries(staffRes.documents.map((item) => [item.$id, item]));
            const rows = classesRes.documents.map((classDoc) => ({
                ...classDoc,
                formTeacher: classDoc.formTeacherId ? (staffById[classDoc.formTeacherId] || null) : null,
            }));

            return { success: true, data: rows };
        },
    },

    assignFormTeacher: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            if (!payload.staffDocId) {
                return { success: false, error: 'staffDocId is required.' };
            }

            const classDoc = await getClassByIdOrName(db, payload.schoolId, payload.classId, payload.className);
            const staffDoc = await db.getDocument(DATABASE_ID, COLLECTIONS.STAFF.id, payload.staffDocId);

            if (staffDoc.schoolId !== payload.schoolId) {
                return { success: false, error: 'Selected staff does not belong to this school.' };
            }

            if (classDoc.formTeacherId && classDoc.formTeacherId !== staffDoc.$id) {
                const previousStaff = await db.getDocument(DATABASE_ID, COLLECTIONS.STAFF.id, classDoc.formTeacherId).catch(() => null);
                if (previousStaff) {
                    const previousClasses = parseJsonArray(previousStaff.formTeacherClasses, []);
                    const updatedPreviousClasses = previousClasses.filter((name) => name !== classDoc.name);
                    await db.updateDocument(DATABASE_ID, COLLECTIONS.STAFF.id, classDoc.formTeacherId, {
                        formTeacherClass: updatedPreviousClasses[0] || '',
                        formTeacherClasses: JSON.stringify(updatedPreviousClasses),
                    }).catch(() => null);
                }
            }

            const currentClasses = parseJsonArray(staffDoc.formTeacherClasses, []);
            const mergedClasses = currentClasses.includes(classDoc.name)
                ? currentClasses
                : [...currentClasses, classDoc.name];

            const updatedClass = await db.updateDocument(DATABASE_ID, COLLECTIONS.CLASSES.id, classDoc.$id, {
                formTeacherId: staffDoc.$id,
            });
            const updatedStaff = await db.updateDocument(DATABASE_ID, COLLECTIONS.STAFF.id, staffDoc.$id, {
                formTeacherClass: mergedClasses[0] || classDoc.name,
                formTeacherClasses: JSON.stringify(mergedClasses),
            });

            return { success: true, data: { class: updatedClass, staff: updatedStaff } };
        },
    },

    setStaffAttendanceOfficer: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload, authId }) => {
            const db = getDb();
            if (!payload.staffDocId) {
                return { success: false, error: 'staffDocId is required.' };
            }

            const enabled = Boolean(payload.enabled);
            const staffDoc = await db.getDocument(DATABASE_ID, COLLECTIONS.STAFF.id, payload.staffDocId);
            if (staffDoc.schoolId !== payload.schoolId) {
                return { success: false, error: 'Selected staff does not belong to this school.' };
            }

            const updated = await db.updateDocument(DATABASE_ID, COLLECTIONS.STAFF.id, payload.staffDocId, {
                canMarkStaffAttendance: enabled,
                attendanceRole: enabled ? 'officer' : 'none',
                attendanceAssignedBy: enabled ? authId : '',
                attendanceAssignedAt: enabled ? nowIso() : '',
            });

            return { success: true, data: updated };
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
                dateOfBirth: payload.dateOfBirth || '',
                phone: payload.phone || '',
                profileImage: '',
                role: 'staff',
                status: 'active',
                createdAt: nowIso(),
            });

            await setAuthUserTags(usersApi, authUser.$id, 'staff', payload.schoolId);

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
                dateOfBirth: payload.dateOfBirth || '',
                gender: payload.gender || 'male',
                profileImage: '',
                department: Array.isArray(payload.department)
                    ? payload.department.join(', ')
                    : (payload.department || ''),
                staffType: payload.staffType || 'academic',
                assignedClasses: JSON.stringify(payload.assignedClasses || []),
                assignedSubjects: JSON.stringify(payload.assignedSubjects || []),
                formTeacherClass: payload.formTeacherClass || '',
                formTeacherClasses: JSON.stringify(payload.formTeacherClasses || (payload.formTeacherClass ? [payload.formTeacherClass] : [])),
                canMarkStaffAttendance: Boolean(payload.canMarkStaffAttendance),
                attendanceRole: payload.canMarkStaffAttendance ? 'officer' : 'none',
                attendanceAssignedBy: payload.canMarkStaffAttendance ? (payload.attendanceAssignedBy || '') : '',
                attendanceAssignedAt: payload.canMarkStaffAttendance ? nowIso() : '',
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

            const className = String(payload.className || payload.class || payload.classLevel || '').trim();
            const parentEmail = String(payload.parentEmail || '').trim();
            const parentPhone = String(payload.parentPhone || '').trim();

            if (!payload.schoolId || !payload.firstName || !payload.lastName || !className) {
                return { success: false, error: 'schoolId, firstName, lastName and className are required.' };
            }

            if (!parentEmail && !parentPhone) {
                return { success: false, error: 'parentEmail or parentPhone is required for student sign-in.' };
            }

            const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, payload.schoolId);
            let admissionNumber = '';
            let year = new Date().getFullYear();
            let studentEmail = '';
            const password = payload.password || parentPhone || parentEmail || randomPassword();

            let authUser = null;
            for (let attempt = 0; attempt < 8; attempt += 1) {
                const generated = await generateUniqueAdmissionNumber(db, payload.schoolId, school.schoolCode);
                admissionNumber = generated.admissionNumber;
                year = generated.year;
                // Student auth identity is always bound to student ID, not parent email.
                studentEmail = `${admissionNumber.replace(/\//g, '.').toLowerCase()}@students.academicx.local`;

                try {
                    authUser = await usersApi.create(
                        ID.unique(),
                        studentEmail,
                        undefined,
                        password,
                        `${payload.firstName} ${payload.lastName}`
                    );
                    break;
                } catch (error) {
                    if (!isDuplicateAuthUserError(error)) throw error;
                }
            }

            if (!authUser) {
                return { success: false, error: 'Unable to create a unique student account. Please try again.' };
            }

            const userDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.USERS.id, ID.unique(), {
                schoolId: payload.schoolId,
                schoolCode: school.schoolCode,
                authId: authUser.$id,
                email: studentEmail,
                firstName: payload.firstName,
                lastName: payload.lastName,
                dateOfBirth: payload.dateOfBirth || '',
                phone: payload.parentPhone || '',
                profileImage: '',
                role: 'student',
                status: 'active',
                createdAt: nowIso(),
            });

            await setAuthUserTags(usersApi, authUser.$id, 'student', payload.schoolId);

            const studentDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.STUDENTS.id, ID.unique(), {
                schoolId: payload.schoolId,
                userId: userDoc.$id,
                admissionNumber,
                admissionYear: year,
                firstName: payload.firstName,
                lastName: payload.lastName,
                gender: payload.gender || 'male',
                dateOfBirth: payload.dateOfBirth || '',
                className,
                section: payload.section || 'A',
                profileImage: '',
                parentName: payload.parentName || '',
                parentEmail,
                parentPhone,
                allergies: payload.allergies || '',
                status: 'active',
            });

            return {
                success: true,
                data: {
                    user: userDoc,
                    student: studentDoc,
                    studentId: admissionNumber,
                    loginEmail: studentEmail,
                    generatedPassword: payload.password ? null : password,
                },
            };
        },
    },

    resolveStudentLogin: {
        handler: async ({ payload }) => {
            const db = getDb();
            const usersApi = getUsersApi();

            const studentId = String(payload.studentId || '').trim();
            const parentCredential = String(payload.parentCredential || '').trim();
            const schoolId = String(payload.schoolId || '').trim();

            if (!studentId || !parentCredential) {
                return { success: false, error: 'studentId and parentCredential are required.' };
            }

            const attemptIds = [...new Set([studentId, studentId.toUpperCase()])];
            let student = null;
            for (const id of attemptIds) {
                const queries = [
                    Query.equal('admissionNumber', id),
                    Query.equal('status', 'active'),
                    Query.limit(1),
                ];
                if (schoolId) queries.unshift(Query.equal('schoolId', schoolId));

                const rows = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, queries);
                if (rows.total > 0) {
                    student = rows.documents[0];
                    break;
                }
            }

            if (!student) {
                return { success: false, error: 'Invalid student credentials.' };
            }

            const credentialLower = parentCredential.toLowerCase();
            const emailMatch = student.parentEmail && student.parentEmail.toLowerCase() === credentialLower;
            const phoneMatch = phoneMatches(parentCredential, student.parentPhone);

            if (!emailMatch && !phoneMatch) {
                return { success: false, error: 'Invalid student credentials.' };
            }

            const userDoc = await db.getDocument(DATABASE_ID, COLLECTIONS.USERS.id, student.userId);
            if (!userDoc?.email) {
                return { success: false, error: 'Student login record is incomplete.' };
            }

            // Backward compatibility: keep student auth secret aligned with parent credential.
            if (userDoc?.authId && typeof usersApi.updatePassword === 'function') {
                try {
                    await usersApi.updatePassword(userDoc.authId, parentCredential);
                } catch {
                    // Best-effort only.
                }
            }

            return {
                success: true,
                data: {
                    loginEmail: userDoc.email,
                    loginPassword: parentCredential,
                    studentId: student.admissionNumber,
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
                dateOfBirth: updates.dateOfBirth,
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
                        ...(clean.dateOfBirth !== undefined ? { dateOfBirth: clean.dateOfBirth || '' } : {}),
                        ...(updates.allergies !== undefined ? { allergies: updates.allergies || '' } : {}),
                        ...(clean.profileImage ? { profileImage: clean.profileImage } : {}),
                    });
                }
            }

            if (targetDoc.role === 'staff' && (clean.firstName || clean.lastName || clean.profileImage || clean.dateOfBirth !== undefined)) {
                const staff = await getStaffDocByUser(db, targetDoc.$id);
                if (staff) {
                    await db.updateDocument(DATABASE_ID, COLLECTIONS.STAFF.id, staff.$id, {
                        ...(clean.firstName ? { firstName: clean.firstName } : {}),
                        ...(clean.lastName ? { lastName: clean.lastName } : {}),
                        ...(clean.dateOfBirth !== undefined ? { dateOfBirth: clean.dateOfBirth || '' } : {}),
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
            const markedAt = nowIso();
            const output = [];

            const className = payload.className || records[0]?.className || '';
            const allowed = await canMarkClassAttendance(db, user, payload.schoolId, className);
            if (!allowed) {
                return { success: false, error: 'Only the assigned form teacher for this class (or an admin) can mark student attendance.' };
            }

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
                    markedAt,
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
            const allowed = await canManageStaffAttendance(db, user, payload.schoolId);
            if (!allowed) {
                return { success: false, error: 'Only assigned attendance officers or admins can mark staff attendance.' };
            }

            const date = todayDate();
            const now = new Date().toTimeString().slice(0, 8);
            const markedAt = nowIso();
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
                    markedAt,
                    excuseReason: '',
                    excusedBy: '',
                    excusedAt: '',
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
                markedAt,
                excuseReason: '',
                excusedBy: '',
                excusedAt: '',
            });
        },
    },

    staffCheckOut: {
        roles: ['admin', 'staff', 'super_admin'],
        handler: async ({ payload, user }) => {
            const db = getDb();
            const date = todayDate();
            const now = new Date().toTimeString().slice(0, 8);
            const markedAt = nowIso();

            const targetStaff = await db.getDocument(DATABASE_ID, COLLECTIONS.STAFF.id, payload.staffDocId);
            const allowed = await canManageStaffAttendance(db, user, targetStaff.schoolId);
            if (!allowed) {
                return { success: false, error: 'Only assigned attendance officers or admins can mark staff attendance.' };
            }

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
                markedAt,
            });
        },
    },

    markStaffAttendance: {
        roles: ['admin', 'staff', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload, user }) => {
            const db = getDb();
            const allowed = await canManageStaffAttendance(db, user, payload.schoolId);
            if (!allowed) {
                return { success: false, error: 'Only assigned attendance officers or admins can mark staff attendance.' };
            }

            const date = payload.date || todayDate();
            const records = Array.isArray(payload.records) ? payload.records : [];
            const now = new Date().toTimeString().slice(0, 8);
            const markedAt = nowIso();
            const output = [];

            for (const row of records) {
                const staffDocId = String(row.staffDocId || '').trim();
                if (!staffDocId) continue;

                const status = String(row.status || 'present').toLowerCase();
                const normalizedStatus = ['present', 'absent', 'late', 'excused'].includes(status) ? status : 'present';

                const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, [
                    Query.equal('staffDocId', staffDocId),
                    Query.equal('date', date),
                    Query.limit(1),
                ]);

                const current = existing.documents[0] || null;
                const data = {
                    schoolId: payload.schoolId,
                    staffDocId,
                    date,
                    status: normalizedStatus,
                    markedBy: payload.markedBy || user?.$id || '',
                    markedAt,
                    checkIn: '',
                    checkOut: '',
                    excuseReason: '',
                    excusedBy: '',
                    excusedAt: '',
                };

                if (normalizedStatus === 'present' || normalizedStatus === 'late') {
                    data.checkIn = row.checkIn || current?.checkIn || now;
                    data.checkOut = row.checkOut || current?.checkOut || '';
                }

                if (normalizedStatus === 'excused') {
                    data.excuseReason = String(row.excuseReason || 'Excused').trim();
                    data.excusedBy = user?.$id || '';
                    data.excusedAt = nowIso();
                }

                if (existing.total > 0) {
                    output.push(await db.updateDocument(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, current.$id, data));
                } else {
                    output.push(await db.createDocument(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, ID.unique(), data));
                }
            }

            return { success: true, data: output };
        },
    },

    staffSetExcused: {
        roles: ['admin', 'staff', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload, user }) => {
            const db = getDb();
            const allowed = await canManageStaffAttendance(db, user, payload.schoolId);
            if (!allowed) {
                return { success: false, error: 'Only assigned attendance officers or admins can set excuses.' };
            }

            const date = payload.date || todayDate();
            const reason = String(payload.excuseReason || '').trim();
            if (!reason) {
                return { success: false, error: 'excuseReason is required.' };
            }
            const markedAt = nowIso();

            const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, [
                Query.equal('staffDocId', payload.staffDocId),
                Query.equal('date', date),
                Query.limit(1),
            ]);

            const baseData = {
                schoolId: payload.schoolId,
                staffDocId: payload.staffDocId,
                date,
                status: 'absent',
                markedBy: payload.markedBy || user?.$id || '',
                markedAt,
                excuseReason: reason,
                excusedBy: user?.$id || '',
                excusedAt: nowIso(),
                checkIn: '',
                checkOut: '',
            };

            if (existing.total > 0) {
                return db.updateDocument(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, existing.documents[0].$id, baseData);
            }
            return db.createDocument(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, ID.unique(), baseData);
        },
    },

    listStaffAttendanceRecords: {
        roles: ['admin', 'staff', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload, user }) => {
            const db = getDb();
            const allowed = await canManageStaffAttendance(db, user, payload.schoolId);
            if (!allowed) {
                return { success: false, error: 'Only assigned attendance officers or admins can view staff attendance records.' };
            }

            const queries = [
                Query.equal('schoolId', payload.schoolId),
                Query.orderDesc('date'),
                Query.limit(Number(payload.limit || 200)),
            ];
            if (payload.staffDocId) queries.push(Query.equal('staffDocId', payload.staffDocId));
            if (payload.date) queries.push(Query.equal('date', payload.date));
            if (payload.status) queries.push(Query.equal('status', payload.status));

            return db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, queries);
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

    publishResults: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload, authId }) => {
            const db = getDb();
            const filters = [
                Query.equal('schoolId', payload.schoolId),
                Query.equal('className', payload.className),
                Query.equal('term', payload.term),
                Query.equal('session', payload.session),
                Query.equal('status', 'approved'),
                Query.limit(1000),
            ];

            const rows = await db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, filters);
            const publishedAt = nowIso();

            const updated = await Promise.all(rows.documents.map((doc) => (
                db.updateDocument(DATABASE_ID, COLLECTIONS.RESULTS.id, doc.$id, {
                    published: true,
                    isPublished: true,
                    publishedAt,
                    publishedBy: authId || '',
                })
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

            if (recipients.length === 0) {
                return {
                    success: true,
                    data: {
                        totalRecipients: 0,
                        sent: 0,
                        failed: 0,
                        previewOnly: false,
                        subject: payload.subject,
                        message: 'No recipients found with parent email addresses.',
                    },
                };
            }

            // If email service not configured, save as pending and return
            if (!SMTP_USERNAME || !SMTP_PASS) {
                await saveEmailRecord(db, {
                    schoolId: payload.schoolId,
                    recipients,
                    subject: payload.subject,
                    body: payload.messageHtml,
                    status: 'failed',
                    errorMessage: 'SMTP not configured',
                    sentBy: payload.sentBy || '',
                });
                return {
                    success: true,
                    data: {
                        totalRecipients: recipients.length,
                        sent: 0,
                        failed: 0,
                        previewOnly: true,
                        subject: payload.subject,
                        message: 'Email service not configured. Set SMTP credentials to enable sending.',
                    },
                };
            }

            // Send emails via SMTP
            const emailResult = await sendEmailWithSMTP({
                to: recipients,
                subject: payload.subject,
                html: payload.messageHtml,
                text: payload.messageHtml?.replace(/<[^>]*>/g, ' ') || '',
            });

            // Save email record
            await saveEmailRecord(db, {
                schoolId: payload.schoolId,
                recipients,
                subject: payload.subject,
                body: payload.messageHtml,
                status: emailResult.success ? 'sent' : 'failed',
                errorMessage: emailResult.error || '',
                sentBy: payload.sentBy || '',
            });

            if (!emailResult.success) {
                return {
                    success: false,
                    error: emailResult.error,
                    data: {
                        totalRecipients: recipients.length,
                        sent: 0,
                        failed: recipients.length,
                        previewOnly: false,
                        subject: payload.subject,
                    },
                };
            }

            return {
                success: true,
                data: {
                    totalRecipients: recipients.length,
                    sent: recipients.length,
                    failed: 0,
                    previewOnly: false,
                    subject: payload.subject,
                    messageId: emailResult.messageId,
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

            if (recipients.length === 0) {
                return {
                    success: true,
                    data: {
                        totalRecipients: 0,
                        sent: 0,
                        failed: 0,
                        previewOnly: false,
                        subject: payload.subject,
                        message: 'No recipients found with parent email addresses.',
                    },
                };
            }

            // If email service not configured, save as pending and return
            if (!SMTP_USERNAME || !SMTP_PASS) {
                await saveEmailRecord(db, {
                    schoolId: payload.schoolId,
                    recipients,
                    subject: payload.subject,
                    body: payload.messageHtml,
                    status: 'failed',
                    errorMessage: 'SMTP not configured',
                    sentBy: payload.sentBy || '',
                });
                return {
                    success: true,
                    data: {
                        totalRecipients: recipients.length,
                        sent: 0,
                        failed: 0,
                        previewOnly: true,
                        subject: payload.subject,
                        message: 'Email service not configured. Set SMTP credentials to enable sending.',
                    },
                };
            }

            // Send emails via SMTP
            const emailResult = await sendEmailWithSMTP({
                to: recipients,
                subject: payload.subject,
                html: payload.messageHtml,
                text: payload.messageHtml?.replace(/<[^>]*>/g, ' ') || '',
            });

            // Save email record
            await saveEmailRecord(db, {
                schoolId: payload.schoolId,
                recipients,
                subject: payload.subject,
                body: payload.messageHtml,
                status: emailResult.success ? 'sent' : 'failed',
                errorMessage: emailResult.error || '',
                sentBy: payload.sentBy || '',
            });

            if (!emailResult.success) {
                return {
                    success: false,
                    error: emailResult.error,
                    data: {
                        totalRecipients: recipients.length,
                        sent: 0,
                        failed: recipients.length,
                        previewOnly: false,
                        subject: payload.subject,
                    },
                };
            }

            return {
                success: true,
                data: {
                    totalRecipients: recipients.length,
                    sent: recipients.length,
                    failed: 0,
                    previewOnly: false,
                    subject: payload.subject,
                    messageId: emailResult.messageId,
                },
            };
        },
    },

    listEmailSends: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const queries = [
                Query.equal('schoolId', payload.schoolId),
                Query.orderDesc('createdAt'),
                Query.limit(Number(payload.limit || 100)),
            ];
            if (payload.status) {
                queries.push(Query.equal('status', payload.status));
            }
            return db.listDocuments(DATABASE_ID, COLLECTIONS.EMAIL_SENDS.id, queries);
        },
    },

    resendEmail: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const result = await resendEmail(db, payload.emailId);
            return result;
        },
    },

    getEmailTemplate: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const db = getDb();
            const emailRecord = await db.getDocument(DATABASE_ID, COLLECTIONS.EMAIL_SENDS.id, payload.emailId);
            if (!emailRecord) {
                return { success: false, error: 'Email template not found' };
            }
            return {
                success: true,
                data: {
                    subject: emailRecord.subject,
                    body: emailRecord.body,
                    recipients: emailRecord.recipients,
                },
            };
        },
    },

    initiateResultPublishing: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload, authId }) => {
            const db = getDb();
            const { schoolId, academicSession, term, className, paymentOption } = payload;

            // Get all students with results for this session/term/class
            const resultFilters = [
                Query.equal('schoolId', schoolId),
                Query.equal('session', academicSession),
                Query.equal('term', term),
                Query.equal('status', 'approved'),
            ];
            if (className && className !== 'all') {
                resultFilters.push(Query.equal('className', className));
            }

            const results = await db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, [
                ...resultFilters,
                Query.limit(1000),
            ]);

            // Get unique students
            const studentIds = [...new Set(results.documents.map(r => r.studentId))];
            const studentCount = studentIds.length;

            if (studentCount === 0) {
                return { success: false, error: 'No approved results found to publish.' };
            }

            // Calculate costs
            const costPerStudent = paymentOption === 'school_pays' ? 400 : 500;
            const totalCost = studentCount * costPerStudent;

            return {
                success: true,
                data: {
                    studentCount,
                    costPerStudent,
                    totalCost,
                    paymentOption,
                    academicSession,
                    term,
                    className,
                },
            };
        },
    },

    createSquadCoPayment: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const { amount, email, reference, metadata } = payload;
            
            const SQUADCO_SECRET_KEY = process.env.SQUADCO_SECRET_KEY;
            const SQUADCO_BASE_URL = process.env.SQUADCO_BASE_URL || 'https://api-d.squadco.com';

            if (!SQUADCO_SECRET_KEY) {
                return { success: false, error: 'SquadCo not configured' };
            }

            try {
                const response = await fetch(`${SQUADCO_BASE_URL}/transaction/initiate`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SQUADCO_SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: amount * 100, // Convert to kobo
                        email,
                        currency: 'NGN',
                        initiate_type: 'inline',
                        transaction_ref: reference,
                        metadata,
                        callback_url: payload.callbackUrl || '',
                    }),
                });

                const data = await response.json();

                if (!response.ok || data.status !== 200) {
                    return { success: false, error: data.message || 'Payment initiation failed' };
                }

                return {
                    success: true,
                    data: {
                        checkoutUrl: data.data?.checkout_url,
                        transactionRef: data.data?.transaction_ref || reference,
                    },
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
    },

    verifySquadCoPayment: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => {
            const { transactionRef } = payload;
            
            const SQUADCO_SECRET_KEY = process.env.SQUADCO_SECRET_KEY;
            const SQUADCO_BASE_URL = process.env.SQUADCO_BASE_URL || 'https://api-d.squadco.com';

            if (!SQUADCO_SECRET_KEY) {
                return { success: false, error: 'SquadCo not configured' };
            }

            try {
                const response = await fetch(`${SQUADCO_BASE_URL}/transaction/${transactionRef}`, {
                    headers: {
                        'Authorization': `Bearer ${SQUADCO_SECRET_KEY}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    return { success: false, error: data.message || 'Verification failed' };
                }

                const isSuccess = data.data?.transaction_status === 'success';

                return {
                    success: true,
                    data: {
                        status: data.data?.transaction_status,
                        isSuccess,
                        amount: data.data?.amount / 100, // Convert from kobo
                        reference: data.data?.transaction_ref,
                        metadata: data.data?.metadata,
                    },
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
    },

    publishResultsWithPins: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload, authId }) => {
            const db = getDb();
            const { schoolId, academicSession, term, className, paymentOption, paymentRef, studentIds } = payload;

            const results = [];
            const errors = [];

            // Generate pins for each student
            for (const studentId of studentIds) {
                try {
                    // Check if pin already exists
                    const existingPins = await db.listDocuments(DATABASE_ID, COLLECTIONS.PINS.id, [
                        Query.equal('studentId', studentId),
                        Query.equal('session', academicSession),
                        Query.equal('term', term),
                        Query.limit(1),
                    ]);

                    let pin;
                    if (existingPins.total > 0) {
                        pin = existingPins.documents[0];
                    } else {
                        // Create new pin
                        pin = await db.createDocument(DATABASE_ID, COLLECTIONS.PINS.id, ID.unique(), {
                            schoolId,
                            studentId,
                            code: randomPin(),
                            session: academicSession,
                            term,
                            used: false,
                            paymentStatus: paymentOption === 'school_pays' ? 'school_paid' : 'pending',
                            paymentRef: paymentRef || '',
                            createdAt: nowIso(),
                            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                        });
                    }

                    // Publish all results for this student
                    const studentResults = await db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, [
                        Query.equal('studentId', studentId),
                        Query.equal('session', academicSession),
                        Query.equal('term', term),
                        Query.equal('status', 'approved'),
                    ]);

                    for (const result of studentResults.documents) {
                        await db.updateDocument(DATABASE_ID, COLLECTIONS.RESULTS.id, result.$id, {
                            published: true,
                            isPublished: true,
                            publishedAt: nowIso(),
                            publishedBy: authId,
                            pinId: pin.$id,
                        });
                    }

                    results.push({
                        studentId,
                        pinCode: pin.code,
                        pinId: pin.$id,
                        status: 'published',
                    });
                } catch (err) {
                    errors.push({ studentId, error: err.message });
                }
            }

            // Save payment record
            if (paymentRef) {
                await db.createDocument(DATABASE_ID, COLLECTIONS.PAYMENTS.id, ID.unique(), {
                    schoolId,
                    reference: paymentRef,
                    amount: payload.amount,
                    currency: 'NGN',
                    type: paymentOption === 'school_pays' ? 'school_result_publish' : 'student_result_access',
                    status: 'success',
                    provider: 'squadco',
                    description: `Result publishing for ${studentIds.length} students`,
                    metadata: JSON.stringify({ studentIds, academicSession, term, className }),
                    createdAt: nowIso(),
                });
            }

            return {
                success: true,
                data: {
                    published: results.length,
                    errors: errors.length > 0 ? errors : undefined,
                    results,
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
            const formTeacherClasses = (() => {
                const multi = parseJsonArray(staff?.formTeacherClasses, []);
                if (multi.length > 0) return multi;
                const single = String(staff?.formTeacherClass || '').trim();
                return single ? [single] : [];
            })();
            const assignedSubjectsRaw = parseJsonArray(staff?.assignedSubjects, []);

            const subjects = await db.listDocuments(DATABASE_ID, COLLECTIONS.SUBJECTS.id, [
                Query.equal('schoolId', user.schoolId),
                Query.limit(300),
            ]);
            const subjectList = subjects.documents;

            const assignedSubjectValues = assignedSubjectsRaw.map((value) => String(value || '').trim()).filter(Boolean);
            const assignedSubjectById = new Set(assignedSubjectValues.filter((value) => /^[a-z0-9]{10,}$/i.test(value)));
            const assignedSubjectByName = new Set(assignedSubjectValues.map((value) => value.toLowerCase()));

            const filteredSubjects = assignedSubjectValues.length === 0
                ? subjectList
                : subjectList.filter((subject) => (
                    assignedSubjectById.has(String(subject.$id || ''))
                    || assignedSubjectByName.has(String(subject.name || '').toLowerCase())
                ));

            const allowedClasses = new Set([
                ...assignedClasses,
                ...formTeacherClasses,
                ...filteredSubjects.map((item) => item.className).filter(Boolean),
            ]);

            let classStudents = [];
            if (allowedClasses.size > 0) {
                const studentPromises = Array.from(allowedClasses).map((className) => db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, [
                    Query.equal('schoolId', user.schoolId),
                    Query.equal('className', className),
                    Query.limit(200),
                ]));
                const responses = await Promise.all(studentPromises);
                classStudents = responses.flatMap((r) => r.documents);
            }

            const results = await db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, [
                Query.equal('schoolId', user.schoolId),
                Query.limit(500),
            ]);

            const filteredResults = results.documents.filter((row) => {
                const classAllowed = allowedClasses.size === 0 || allowedClasses.has(String(row.className || ''));
                const subjectAllowed = filteredSubjects.length === 0 || filteredSubjects.some((subject) => subject.$id === row.subjectId);
                return classAllowed && subjectAllowed;
            });

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
                    formTeacherClasses,
                    assignedSubjects: assignedSubjectsRaw,
                    students: classStudents,
                    subjects: filteredSubjects,
                    results: filteredResults,
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

            const [results, attendance, pins, fees] = await Promise.all([
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
                db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, [
                    Query.equal('studentId', student.$id),
                    Query.limit(100),
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
                    fees: fees.documents,
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

    /** Create school fee payment */
    createSchoolFeePayment: {
        auth: true,
        handler: async ({ payload, authId }) => {
            const db = getDb();
            const { studentId, amount, term, session, platformFee, callbackUrl } = payload;

            if (!studentId || !amount || !term || !session) {
                return { success: false, error: 'Missing required fields' };
            }

            try {
                // Get student and school info
                const student = await db.getDocument(DATABASE_ID, COLLECTIONS.STUDENTS.id, studentId);
                const user = await getUserByAuthId(authId);
                if (!user) {
                    return { success: false, error: 'Authenticated user profile not found.' };
                }
                const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, user.schoolId);

                // Calculate total amount with platform fee
                const platformFeeAmount = Math.min(amount * 0.019, 2500);
                const totalAmount = amount + platformFeeAmount;

                // Check if fee record already exists
                const existingFees = await db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, [
                    Query.equal('schoolId', school.$id),
                    Query.equal('studentId', studentId),
                    Query.equal('term', term),
                    Query.equal('session', session),
                    Query.limit(1)
                ]);

                if (existingFees.total > 0) {
                    return { success: false, error: 'Fee record already exists for this term/session' };
                }

                // Create fee record
                const feeRecord = await db.createDocument(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, ID.unique(), {
                    schoolId: school.$id,
                    studentId,
                    term,
                    session,
                    amount,
                    platformFee: platformFeeAmount,
                    totalAmount,
                    status: 'pending',
                    amountPaid: 0,
                    outstandingAmount: Number(amount || 0),
                    paymentMethod: 'online',
                    createdAt: nowIso()
                });

                // Initiate payment with Squad
                const squad = require('./payment-squad');
                const resolvedCallbackUrl = String(callbackUrl || '').trim() || `${process.env.FRONTEND_URL || ''}/payment-success`;
                if (!/^https?:\/\//i.test(resolvedCallbackUrl)) {
                    return { success: false, error: 'Payment callback URL is not configured properly on the backend.' };
                }
                const paymentResult = await squad.initiateTransaction({
                    email: student.parentEmail || user.email,
                    amount: totalAmount,
                    callbackUrl: resolvedCallbackUrl,
                    metadata: {
                        type: 'school_fee',
                        feeId: feeRecord.$id,
                        studentId,
                        schoolId: school.$id
                    }
                });

                if (!paymentResult.success) {
                    return { success: false, error: paymentResult.error };
                }

                // Track initiation attempt for superadmin visibility, but do not block checkout if tracking write fails.
                try {
                    await createPaymentAttemptRecord(db, {
                        schoolId: school.$id,
                        reference: paymentResult.data.transactionRef,
                        amount: Number(amount || 0),
                        currency: 'NGN',
                        type: 'school_fee',
                        status: 'pending',
                        provider: 'squad',
                        description: `School fee payment (${term} ${session})`,
                        studentId,
                        createdAt: nowIso(),
                        metadata: JSON.stringify({
                            type: 'school_fee',
                            kind: 'school_fee',
                            stage: 'initiated',
                            feeId: feeRecord.$id,
                            term,
                            session,
                            paymentAmount: Number(amount || 0),
                            totalCharge: totalAmount,
                            platformFee: platformFeeAmount,
                        }),
                    });
                } catch (trackingError) {
                    console.error('Payment initiation tracking failed:', trackingError?.message || trackingError);
                }

                return {
                    success: true,
                    data: {
                        feeId: feeRecord.$id,
                        checkoutUrl: paymentResult.data.checkoutUrl,
                        transactionRef: paymentResult.data.transactionRef
                    }
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    },

    /** Get school fees report */
    recordManualSchoolFeePayment: {
        auth: true,
        handler: async ({ payload, authId }) => {
            const db = getDb();
            const { studentId, amount, term, session, paymentMethod, notes } = payload;

            if (!studentId || !amount || !term || !session) {
                return { success: false, error: 'studentId, amount, term and session are required.' };
            }

            const amountToRecord = Number(amount || 0);
            if (!Number.isFinite(amountToRecord) || amountToRecord <= 0) {
                return { success: false, error: 'Invalid payment amount.' };
            }

            try {
                const user = await getUserByAuthId(authId);
                if (!user) {
                    return { success: false, error: 'Authenticated user profile not found.' };
                }

                const [student, school] = await Promise.all([
                    db.getDocument(DATABASE_ID, COLLECTIONS.STUDENTS.id, studentId),
                    db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, user.schoolId),
                ]);

                if (student.schoolId !== user.schoolId) {
                    return { success: false, error: 'Student does not belong to your school.' };
                }

                let feeDoc = null;
                const feeRows = await db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, [
                    Query.equal('schoolId', user.schoolId),
                    Query.equal('studentId', studentId),
                    Query.equal('term', term),
                    Query.equal('session', session),
                    Query.limit(1),
                ]);

                if (feeRows.total > 0) {
                    feeDoc = feeRows.documents[0];
                } else {
                    const schoolData = parseJson(school.data || '{}', {});
                    const classFeeAmounts = schoolData.classFeeAmounts || {};
                    const configuredAmount = Number(classFeeAmounts[student.className] || amountToRecord || 0);

                    if (!Number.isFinite(configuredAmount) || configuredAmount <= 0) {
                        return { success: false, error: 'No class fee configured for this student. Configure class fee first.' };
                    }

                    feeDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, ID.unique(), {
                        schoolId: user.schoolId,
                        studentId,
                        term,
                        session,
                        amount: configuredAmount,
                        platformFee: 0,
                        totalAmount: configuredAmount,
                        status: 'pending',
                        amountPaid: 0,
                        outstandingAmount: configuredAmount,
                        paymentMethod: 'manual',
                        createdAt: nowIso(),
                    });
                }

                const principalAmount = Number(feeDoc.amount || 0);
                const alreadyPaid = Number(feeDoc.amountPaid || 0);
                const outstandingAmount = Math.max(0, Number((principalAmount - alreadyPaid).toFixed(2)));

                if (amountToRecord > outstandingAmount) {
                    return { success: false, error: `Amount exceeds outstanding balance of ${outstandingAmount}` };
                }

                const reference = `MANUAL-${feeDoc.$id.slice(0, 8)}-${Date.now()}`;
                const manualMeta = {
                    type: 'school_fee',
                    kind: 'school_fee',
                    stage: 'initiated',
                    feeId: feeDoc.$id,
                    studentId,
                    schoolId: user.schoolId,
                    term,
                    session,
                    paymentAmount: amountToRecord,
                    paymentMethod: String(paymentMethod || 'manual').slice(0, 50),
                    notes: String(notes || '').slice(0, 1000),
                    source: 'admin_manual_record',
                };

                await createPaymentAttemptRecord(db, {
                    schoolId: user.schoolId,
                    reference,
                    amount: amountToRecord,
                    currency: 'NGN',
                    type: 'school_fee',
                    status: 'pending',
                    provider: 'manual',
                    description: `Manual school fee payment (${term} ${session})`,
                    studentId,
                    createdAt: nowIso(),
                    metadata: JSON.stringify(manualMeta),
                });

                const finalized = await finalizeSchoolFeePayment(db, {
                    transactionRef: reference,
                    metadata: manualMeta,
                    paymentDate: nowIso(),
                });

                return {
                    success: true,
                    data: {
                        reference,
                        feeId: feeDoc.$id,
                        alreadyProcessed: Boolean(finalized?.alreadyProcessed),
                    },
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
    },

    /** Get school fees report */
    getSchoolFeesReport: {
        auth: true,
        handler: async ({ payload, authId }) => {
            const db = getDb();
            const { term, session } = payload;

            if (!term || !session) {
                return { success: false, error: 'Term and session are required' };
            }

            try {
                const user = await getUserByAuthId(authId);
                if (!user) {
                    return { success: false, error: 'Authenticated user profile not found.' };
                }
                
                // Get all fees for the term/session
                const fees = await db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, [
                    Query.equal('schoolId', user.schoolId),
                    Query.equal('term', term),
                    Query.equal('session', session),
                    Query.limit(1000)
                ]);

                // Get student details
                const studentIds = [...new Set(fees.documents.map(f => f.studentId))];
                const students = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, [
                    Query.equal('schoolId', user.schoolId),
                    Query.limit(1000)
                ]);

                const studentMap = students.documents.reduce((acc, student) => {
                    acc[student.$id] = student;
                    return acc;
                }, {});

                // Separate paid and unpaid students
                const paidStudents = [];
                const unpaidStudents = [];

                fees.documents.forEach(fee => {
                    const student = studentMap[fee.studentId];
                    if (student) {
                        const studentWithFee = {
                            ...student,
                            amount: fee.amount,
                            paidAt: fee.paidAt,
                            paymentMethod: fee.paymentMethod
                        };

                        if (fee.status === 'paid') {
                            paidStudents.push(studentWithFee);
                        } else {
                            unpaidStudents.push(studentWithFee);
                        }
                    }
                });

                // Group by class
                const groupByClass = (students) => {
                    return students.reduce((acc, student) => {
                        if (!acc[student.className]) {
                            acc[student.className] = [];
                        }
                        acc[student.className].push(student);
                        return acc;
                    }, {});
                };

                return {
                    success: true,
                    data: {
                        paidStudents: groupByClass(paidStudents),
                        unpaidStudents: groupByClass(unpaidStudents),
                        summary: {
                            totalStudents: students.documents.length,
                            paidCount: paidStudents.length,
                            unpaidCount: unpaidStudents.length,
                            totalCollected: fees.documents
                                .filter(f => f.status === 'paid')
                                .reduce((sum, f) => sum + f.amount, 0)
                        }
                    }
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    },

    /** Initiate student fee payment */
    getStudentFeeStatus: {
        auth: false,
        handler: async ({ payload }) => {
            const db = getDb();
            const { schoolId, studentId, term, session } = payload;

            if (!schoolId || !studentId || !term || !session) {
                return { success: false, error: 'schoolId, studentId, term and session are required' };
            }

            const normalizedStudentId = String(studentId).trim();
            const attemptIds = [...new Set([normalizedStudentId, normalizedStudentId.toUpperCase()])];
            let student = null;

            for (const attemptId of attemptIds) {
                const studentRows = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, [
                    Query.equal('schoolId', schoolId),
                    Query.equal('admissionNumber', attemptId),
                    Query.equal('status', 'active'),
                    Query.limit(1),
                ]);
                if (studentRows.total > 0) {
                    student = studentRows.documents[0];
                    break;
                }
            }

            if (!student) {
                return { success: false, error: 'Student not found.' };
            }

            const feesRows = await db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, [
                Query.equal('schoolId', schoolId),
                Query.equal('studentId', student.$id),
                Query.equal('term', term),
                Query.equal('session', session),
                Query.limit(1),
            ]);

            if (feesRows.total === 0) {
                return { success: false, error: 'We cannot access this fee record for the selected term and session.' };
            }

            const fee = feesRows.documents[0];
            const principal = Number(fee.amount || 0);
            const amountPaid = Number(fee.amountPaid || 0);
            const derivedOutstanding = Math.max(0, Number((principal - amountPaid).toFixed(2)));
            const feeStatus = String(fee.status || '').toLowerCase();
            const isSettledPaid = feeStatus === 'paid' && Boolean(fee.paidAt);
            const outstanding = isSettledPaid ? 0 : derivedOutstanding;

            return {
                success: true,
                data: {
                    fee,
                    student,
                    breakdown: {
                        principal,
                        amountPaid,
                        outstanding,
                        squadFeeRate: SQUAD_FEE_RATE,
                        platformFeeRate: PLATFORM_FEE_RATE,
                    },
                },
            };
        },
    },

    /** Initiate student fee payment */
    initiateStudentFeePayment: {
        auth: true,
        handler: async ({ payload, authId }) => {
            const db = getDb();
            const { schoolId, feeId, studentId, amount, term, session, callbackUrl } = payload;

            if (!schoolId || !studentId || !amount || !term || !session) {
                return { success: false, error: 'schoolId, studentId, amount, term and session are required' };
            }

            try {
                // Verify the fee belongs to the authenticated student
                const user = await getUserByAuthId(authId);
                if (!user) {
                    return { success: false, error: 'Authenticated user profile not found.' };
                }
                const student = await db.getDocument(DATABASE_ID, COLLECTIONS.STUDENTS.id, studentId);
                
                if (student.userId !== user.$id) {
                    return { success: false, error: 'Unauthorized: Fee does not belong to this student' };
                }

                // Get fee record by document ID first, then fall back to the school/student/term/session lookup.
                let fee = null;
                if (feeId) {
                    try {
                        fee = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, feeId);
                    } catch {
                        fee = null;
                    }
                }

                if (!fee) {
                    const feeRows = await db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, [
                        Query.equal('schoolId', schoolId),
                        Query.equal('studentId', student.$id),
                        Query.equal('term', term),
                        Query.equal('session', session),
                        Query.limit(1),
                    ]);
                    fee = feeRows.documents[0] || null;
                }

                if (!fee) {
                    return { success: false, error: 'Unable to locate the fee record for this term/session.' };
                }
                
                if (fee.studentId !== studentId) {
                    return { success: false, error: 'Invalid fee record' };
                }

                if (fee.status === 'paid') {
                    return { success: false, error: 'Fee already paid' };
                }

                const amountToPay = Number(amount || 0);
                if (!Number.isFinite(amountToPay) || amountToPay <= 0) {
                    return { success: false, error: 'Invalid payment amount' };
                }

                const alreadyPaid = Number(fee.amountPaid || 0);
                const principalAmount = Number(fee.amount || 0);
                const outstandingAmount = Math.max(0, Number((principalAmount - alreadyPaid).toFixed(2)));
                if (amountToPay > outstandingAmount) {
                    return { success: false, error: `Amount exceeds outstanding balance of ${outstandingAmount}` };
                }

                const feeBreakdown = computePaymentFees(amountToPay);

                // Initiate payment with Squad
                const squad = require('./payment-squad');
                const resolvedCallbackUrl = String(callbackUrl || '').trim() || `${process.env.FRONTEND_URL || ''}/payment-success`;
                if (!/^https?:\/\//i.test(resolvedCallbackUrl)) {
                    return { success: false, error: 'Payment callback URL is not configured properly on the backend.' };
                }
                const paymentResult = await squad.initiateTransaction({
                    email: student.parentEmail || user.email,
                    amount: feeBreakdown.totalCharge,
                    callbackUrl: resolvedCallbackUrl,
                    metadata: {
                        type: 'school_fee',
                        feeId: fee.$id,
                        studentId: student.$id,
                        schoolId: fee.schoolId,
                        paymentAmount: amountToPay,
                        squadFee: feeBreakdown.squadFee,
                        platformFee: feeBreakdown.platformFee,
                    }
                });

                if (!paymentResult.success) {
                    return { success: false, error: paymentResult.error };
                }

                // Track initiation attempt for superadmin visibility, but do not block checkout if tracking write fails.
                try {
                    await createPaymentAttemptRecord(db, {
                        schoolId: fee.schoolId,
                        reference: paymentResult.data.transactionRef,
                        amount: amountToPay,
                        currency: 'NGN',
                        type: 'school_fee',
                        status: 'pending',
                        provider: 'squad',
                        description: `School fee payment (${term} ${session})`,
                        studentId: student.$id,
                        createdAt: nowIso(),
                        metadata: JSON.stringify({
                            type: 'school_fee',
                            kind: 'school_fee',
                            stage: 'initiated',
                            feeId: fee.$id,
                            studentId: student.$id,
                            schoolId: fee.schoolId,
                            term,
                            session,
                            paymentAmount: amountToPay,
                            outstandingBefore: outstandingAmount,
                            totalCharge: feeBreakdown.totalCharge,
                            squadFee: feeBreakdown.squadFee,
                            platformFee: feeBreakdown.platformFee,
                        }),
                    });
                } catch (trackingError) {
                    console.error('Payment initiation tracking failed:', trackingError?.message || trackingError);
                }

                return {
                    success: true,
                    data: {
                        feeId: fee.$id,
                        checkoutUrl: paymentResult.data.checkoutUrl,
                        transactionRef: paymentResult.data.transactionRef,
                        paymentAmount: amountToPay,
                        charges: {
                            squadFeeRate: SQUAD_FEE_RATE,
                            platformFeeRate: PLATFORM_FEE_RATE,
                            squadFee: feeBreakdown.squadFee,
                            platformFee: feeBreakdown.platformFee,
                            totalCharge: feeBreakdown.totalCharge,
                        },
                    }
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    },

    /** Handle Squad webhook for school fee payments */
    handleSchoolFeeWebhook: {
        auth: false,
        handler: async ({ payload }) => {
            const db = getDb();
            const { event, data } = payload;
            
            try {
                if (event === 'charge_successful' && data.metadata?.type === 'school_fee') {
                    await finalizeSchoolFeePayment(db, {
                        transactionRef: data.transaction_ref,
                        metadata: data.metadata,
                        paymentDate: nowIso(),
                    });
                    return { success: true };
                }

                if ((event === 'charge_failed' || event === 'transaction_failed' || event === 'payment_failed') && data?.transaction_ref) {
                    const paymentRows = await db.listDocuments(DATABASE_ID, COLLECTIONS.PAYMENTS.id, [
                        Query.equal('reference', data.transaction_ref),
                        Query.limit(1),
                    ]);
                    if (paymentRows.total > 0) {
                        const existingMeta = parseJson(paymentRows.documents[0].metadata || '{}', {});
                        await db.updateDocument(DATABASE_ID, COLLECTIONS.PAYMENTS.id, paymentRows.documents[0].$id, {
                            status: 'failed',
                            metadata: JSON.stringify({
                                ...existingMeta,
                                stage: 'failed',
                                failedAt: nowIso(),
                                failureReason: data?.message || data?.reason || '',
                            }),
                        });
                    }

                    if (data?.metadata?.feeId) {
                        try {
                            await db.updateDocument(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, data.metadata.feeId, {
                                paymentReference: data.transaction_ref || '',
                                updatedAt: nowIso(),
                            });
                        } catch {
                            // Best-effort only for failed attempts.
                        }
                    }
                    return { success: true };
                }
                
                return { success: true }; // Acknowledge other events
            } catch (error) {
                console.error('Webhook error:', error);
                return { success: false, error: error.message };
            }
        }
    },

    verifySchoolFeePayment: {
        auth: false,
        handler: async ({ payload }) => {
            const db = getDb();
            const transactionRef = String(payload.transactionRef || payload.reference || '').trim();
            if (!transactionRef) {
                return { success: false, error: 'transactionRef is required.' };
            }

            const squad = require('./payment-squad');
            const verification = await squad.verifyTransaction(transactionRef);
            if (!verification.success) {
                return { success: false, error: verification.error || 'Unable to verify payment at this time.' };
            }

            const status = String(verification.data?.status || '').toLowerCase();
            
            // Try to get metadata from our payment record in DB (Squad may not return it)
            let metadata = {};
            try {
                const paymentRows = await db.listDocuments(DATABASE_ID, COLLECTIONS.PAYMENTS.id, [
                    Query.equal('reference', transactionRef),
                    Query.limit(1),
                ]);
                if (paymentRows.total > 0) {
                    const paymentRecord = paymentRows.documents[0];
                    const storedMeta = parseJson(paymentRecord.metadata || '{}', {});
                    metadata = storedMeta;
                    console.log('Verified payment record found in DB:', { reference: transactionRef, metadata });
                } else {
                    console.warn('No payment record found in DB for reference:', transactionRef);
                }
            } catch (err) {
                console.error('Error looking up payment record:', err?.message || err);
                // Fall back to verification response metadata if DB lookup fails
                metadata = verification.data?.metadata || {};
            }
            
            // Check for either 'type' or 'kind' field for backwards compatibility
            const isSchoolFeePayment = metadata?.type === 'school_fee' || metadata?.kind === 'school_fee';
            if (!isSchoolFeePayment) {
                console.error('Payment metadata validation failed:', { 
                    reference: transactionRef,
                    metadata,
                    status
                });
                return { success: false, error: 'Verified transaction is not a school fee payment or metadata not found.' };
            }

            if (!['success', 'successful', 'approved', 'paid'].includes(status)) {
                return {
                    success: false,
                    error: `Payment is not successful yet (status: ${status || 'unknown'}).`,
                    data: {
                        status,
                        reference: verification.data?.reference || transactionRef,
                    },
                };
            }

            const result = await finalizeSchoolFeePayment(db, {
                transactionRef,
                metadata,
                paymentDate: verification.data?.paidAt || nowIso(),
            });

            return {
                success: true,
                data: {
                    verified: true,
                    reference: transactionRef,
                    status,
                    alreadyProcessed: Boolean(result.alreadyProcessed),
                },
            };
        },
    },

    /** Public: school website contact form → contact_messages (validated server-side). */
    submitContactMessage: {
        handler: async ({ payload }) => {
            const db = getDb();
            const schoolId = String(payload.schoolId || '').trim();
            if (!schoolId) {
                return { success: false, error: 'schoolId is required.' };
            }

            const name = String(payload.name || '').trim().slice(0, 150);
            const message = String(payload.message || '').trim().slice(0, 5000);
            if (!name || !message) {
                return { success: false, error: 'name and message are required.' };
            }

            try {
                await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, schoolId);
            } catch {
                return { success: false, error: 'School not found.' };
            }

            const email = String(payload.email || '').trim().slice(0, 255);
            const phone = String(payload.phone || '').trim().slice(0, 20);
            const subject = String(payload.subject || '').trim().slice(0, 200);

            const doc = await db.createDocument(DATABASE_ID, COLLECTIONS.CONTACT_MESSAGES.id, ID.unique(), {
                schoolId,
                name,
                email: email || '',
                phone: phone || '',
                subject: subject || '',
                message,
                status: 'new',
                createdAt: nowIso(),
            });

            return { success: true, data: { id: doc.$id } };
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
