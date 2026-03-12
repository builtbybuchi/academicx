require('dotenv').config();

const auth = require('./auth.js');
const attendance = require('./attendance.js');
const notifications = require('./notifications.js');
const pins = require('./pins.js');
const results = require('./results.js');
const { requireRole, requireSchool } = require('../auth/middleware.js');

function getCorsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-AcademicX-Auth-Id',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

async function authorize(authId, allowedRoles, schoolId) {
    if (!allowedRoles || allowedRoles.length === 0) {
        return { authorized: true };
    }

    if (!authId) {
        return { authorized: false, error: 'Missing authenticated user context.' };
    }

    const roleCheck = await requireRole(authId, allowedRoles);
    if (!roleCheck.authorized) {
        return roleCheck;
    }

    if (!schoolId) {
        return roleCheck;
    }

    const schoolCheck = await requireSchool(authId, schoolId);
    if (!schoolCheck.authorized) {
        return schoolCheck;
    }

    return roleCheck;
}

const actionMap = {
    registerSchool: {
        handler: async ({ payload }) => auth.registerSchool(payload),
    },
    enrollStudent: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => auth.enrollStudent(payload),
    },
    addStaff: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => auth.addStaff(payload),
    },
    updateProfile: {
        roles: ['admin', 'staff', 'student', 'super_admin'],
        handler: async ({ authId, payload }) => auth.updateProfile(payload.userId || authId, payload.updates || payload),
    },
    markStudentAttendance: {
        roles: ['admin', 'staff', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => attendance.markStudentAttendance(payload.schoolId, payload.className, payload.date, payload.records || [], payload.markedBy),
    },
    staffCheckIn: {
        roles: ['admin', 'staff', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => attendance.staffCheckIn(payload.schoolId, payload.staffDocId, payload.markedBy),
    },
    staffCheckOut: {
        roles: ['admin', 'staff', 'super_admin'],
        handler: async ({ payload }) => attendance.staffCheckOut(payload.staffDocId),
    },
    submitResult: {
        roles: ['admin', 'staff', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => results.submitResult(payload),
    },
    approveResults: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => results.approveResults(payload.schoolId, payload.className, payload.term, payload.session),
    },
    generateBroadsheet: {
        roles: ['admin', 'staff', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => results.generateBroadsheet(payload.schoolId, payload.className, payload.term, payload.session),
    },
    generateSchoolPins: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => pins.generateSchoolPins(payload.schoolId, payload.term, payload.session, payload.count, payload.paymentRef || `manual-${Date.now()}`),
    },
    purchaseStudentPin: {
        roles: ['student', 'admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => pins.purchaseStudentPin(payload.schoolId, payload.studentId, payload.term, payload.session, payload.paymentRef || `manual-${Date.now()}`),
    },
    verifyPin: {
        handler: async ({ payload }) => pins.verifyPin(payload.code, payload.studentId),
    },
    sendBulkEmailToParents: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => notifications.sendBulkEmailToParents(payload.schoolId, payload.className || 'all', payload.subject, payload.messageHtml),
    },
    sendSchoolAnnouncement: {
        roles: ['admin', 'super_admin'],
        schoolId: ({ payload }) => payload.schoolId,
        handler: async ({ payload }) => notifications.sendSchoolAnnouncement(payload.schoolId, payload.subject, payload.messageHtml),
    },
};

module.exports = async ({ req, res, error }) => {
    const corsHeaders = getCorsHeaders();

    if (req.method === 'OPTIONS') {
        return res.text('', 204, corsHeaders);
    }

    try {
        const query = parseJson(req.queryString || '{}', {});
        const body = parseJson(req.body, {});
        const action = body.action || query.action;
        const payload = body.payload || body.data || {};
        const authId = req.headers['x-academicx-auth-id'] || payload.authId || '';

        if (!action || !actionMap[action]) {
            return res.json({ success: false, error: 'Unknown action.' }, 400, corsHeaders);
        }

        const definition = actionMap[action];
        const scopedSchoolId = definition.schoolId ? definition.schoolId({ payload, authId }) : undefined;
        const authResult = await authorize(authId, definition.roles, scopedSchoolId);

        if (!authResult.authorized) {
            return res.json({ success: false, error: authResult.error }, 403, corsHeaders);
        }

        const result = await definition.handler({ payload, authId, user: authResult.user || null });
        const bodyResult = result && Object.prototype.hasOwnProperty.call(result, 'success') ? result : { success: true, data: result };

        return res.json(bodyResult, bodyResult.success === false ? 400 : 200, corsHeaders);
    } catch (err) {
        error(err.message);
        return res.json({ success: false, error: err.message || 'Function execution failed.' }, 500, corsHeaders);
    }
};