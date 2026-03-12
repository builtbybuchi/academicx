/**
 * AcademicX - Attendance Functions
 * Student attendance (marked by form teacher) + Staff check-in/check-out.
 */
require('dotenv').config();
const { Client, Databases, ID, Query } = require('node-appwrite');
const { DATABASE_ID, COLLECTIONS } = require('../database/schema.js');

function getClient() {
    const client = new Client();
    client
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID || '')
        .setKey(process.env.APPWRITE_API_KEY || '');
    return client;
}

// ─── Student Attendance (Form Teacher marks class) ────────

/**
 * Mark student attendance for a class on a given date.
 * Only the form teacher of that class should call this.
 * @param {string} schoolId
 * @param {string} className
 * @param {string} date - YYYY-MM-DD
 * @param {Array<{studentId, status}>} records - list of { studentId, status: 'present'|'absent'|'late'|'excused' }
 * @param {string} markedBy - form teacher userId
 */
async function markStudentAttendance(schoolId, className, date, records, markedBy) {
    const db = new Databases(getClient());
    const results = [];

    for (const rec of records) {
        try {
            // Check if already marked for this student+date
            const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE.id, [
                Query.equal('studentId', rec.studentId),
                Query.equal('date', date),
                Query.limit(1),
            ]);

            if (existing.total > 0) {
                // Update existing
                await db.updateDocument(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE.id, existing.documents[0].$id, {
                    status: rec.status,
                    markedBy,
                });
                results.push({ studentId: rec.studentId, action: 'updated' });
            } else {
                // Create new
                await db.createDocument(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE.id, ID.unique(), {
                    schoolId,
                    studentId: rec.studentId,
                    className,
                    date,
                    status: rec.status,
                    markedBy,
                });
                results.push({ studentId: rec.studentId, action: 'created' });
            }
        } catch (e) {
            results.push({ studentId: rec.studentId, action: 'error', error: e.message });
        }
    }

    return { success: true, data: results };
}

/**
 * Get student attendance for a class on a given date.
 */
async function getClassAttendance(schoolId, className, date) {
    const db = new Databases(getClient());
    const res = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE.id, [
        Query.equal('schoolId', schoolId),
        Query.equal('className', className),
        Query.equal('date', date),
        Query.limit(100),
    ]);
    return { success: true, data: res.documents };
}

/**
 * Get individual student attendance across a date range.
 */
async function getStudentAttendanceRange(studentId, startDate, endDate) {
    const db = new Databases(getClient());
    const res = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENT_ATTENDANCE.id, [
        Query.equal('studentId', studentId),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.limit(100),
        Query.orderAsc('date'),
    ]);
    return { success: true, data: res.documents };
}

// ─── Staff Attendance (Check-in / Check-out) ──────────────

/**
 * Staff check-in.
 * Creates a record for today or updates existing.
 */
async function staffCheckIn(schoolId, staffDocId, markedBy) {
    const db = new Databases(getClient());
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

    try {
        const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, [
            Query.equal('staffDocId', staffDocId),
            Query.equal('date', today),
            Query.limit(1),
        ]);

        if (existing.total > 0) {
            // Already checked in today
            return { success: false, error: 'Already checked in today.', data: existing.documents[0] };
        }

        // Determine if late (after 8:30 AM)
        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        const isLate = (hour > 8 || (hour === 8 && minute > 30));

        const doc = await db.createDocument(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, ID.unique(), {
            schoolId,
            staffDocId,
            date: today,
            checkIn: now,
            status: isLate ? 'late' : 'present',
            markedBy: markedBy || staffDocId,
        });

        return { success: true, data: doc };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Staff check-out.
 * Updates the existing record with checkout time.
 */
async function staffCheckOut(staffDocId) {
    const db = new Databases(getClient());
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    try {
        const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, [
            Query.equal('staffDocId', staffDocId),
            Query.equal('date', today),
            Query.limit(1),
        ]);

        if (existing.total === 0) {
            return { success: false, error: 'No check-in record found for today. Check in first.' };
        }

        const doc = existing.documents[0];

        // If less than 4 hours since check-in, mark as half_day
        const checkInParts = doc.checkIn.split(':');
        const checkInMinutes = parseInt(checkInParts[0]) * 60 + parseInt(checkInParts[1]);
        const nowParts = now.split(':');
        const nowMinutes = parseInt(nowParts[0]) * 60 + parseInt(nowParts[1]);
        const hoursWorked = (nowMinutes - checkInMinutes) / 60;

        const updatedDoc = await db.updateDocument(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, doc.$id, {
            checkOut: now,
            status: hoursWorked < 4 ? 'half_day' : doc.status,
        });

        return { success: true, data: updatedDoc };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Get staff attendance for a school on a given date.
 */
async function getStaffAttendance(schoolId, date) {
    const db = new Databases(getClient());
    const res = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF_ATTENDANCE.id, [
        Query.equal('schoolId', schoolId),
        Query.equal('date', date),
        Query.limit(100),
    ]);
    return { success: true, data: res.documents };
}

module.exports = {
    markStudentAttendance,
    getClassAttendance,
    getStudentAttendanceRange,
    staffCheckIn,
    staffCheckOut,
    getStaffAttendance,
};
