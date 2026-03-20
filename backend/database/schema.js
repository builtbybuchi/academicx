/**
 * AcademicX - Complete Database Schema (v2)
 * 14 Appwrite collections with attributes, indexes, and permissions.
 *
 * Payment model:
 *   - App is FREE to use
 *   - Schools pay ₦500/student OR students pay ₦600/student (+ optional school markup)
 *     when results are published at end of term.
 *   - If students pay, school keeps surplus above ₦600 base.
 */

const DATABASE_ID = 'academicx_db';
const BUCKET_ID = 'school_media';

const COLLECTIONS = {
    // ─── 1. SCHOOLS ───────────────────────────────────────────
    SCHOOLS: {
        id: 'schools',
        name: 'Schools',
        attributes: [
            { key: 'schoolCode', type: 'string', size: 8, required: true },     // 3-8 alpha, unique, set at signup
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'address', type: 'string', size: 500 },
            { key: 'email', type: 'string', size: 255, required: true },
            { key: 'phone', type: 'string', size: 20 },
            { key: 'logo', type: 'string', size: 500 },                        // file ID in school_media bucket
            { key: 'status', type: 'enum', elements: ['active', 'inactive', 'suspended'], default: 'active' },
            { key: 'paymentModel', type: 'enum', elements: ['school_pays', 'student_pays'], default: 'school_pays' },
            { key: 'customPinPrice', type: 'integer', default: 0 },             // additional markup over ₦600 base
            { key: 'schoolBalance', type: 'float', default: 0 },                // withdrawable balance from student payments
            { key: 'resultPublished', type: 'boolean', default: false },
            { key: 'currentSession', type: 'string', size: 20 },                // e.g. "2025/2026"
            { key: 'currentTerm', type: 'string', size: 20 },                   // e.g. "First Term"
            { key: 'createdBy', type: 'string', size: 36 },                     // admin userId
            { key: 'createdAt', type: 'datetime' },
        ],
        indexes: [
            { key: 'idx_schoolCode', type: 'unique', attributes: ['schoolCode'] },
            { key: 'idx_status', type: 'key', attributes: ['status'] },
            { key: 'idx_email', type: 'unique', attributes: ['email'] },
        ],
    },

    // ─── 2. USERS (all auth users) ────────────────────────────
    USERS: {
        id: 'users',
        name: 'Users',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36 },                      // links to schools.$id
            { key: 'schoolCode', type: 'string', size: 8 },
            { key: 'authId', type: 'string', size: 36, required: true },        // Appwrite Auth user ID
            { key: 'email', type: 'string', size: 255, required: true },
            { key: 'firstName', type: 'string', size: 100, required: true },
            { key: 'lastName', type: 'string', size: 100, required: true },
            { key: 'dateOfBirth', type: 'string', size: 10 },
            { key: 'phone', type: 'string', size: 20 },
            { key: 'profileImage', type: 'string', size: 500 },                 // file ID
            { key: 'role', type: 'enum', elements: ['super_admin', 'admin', 'staff', 'student'], required: true },
            { key: 'status', type: 'enum', elements: ['active', 'inactive'], default: 'active' },
            { key: 'createdAt', type: 'datetime' },
        ],
        indexes: [
            { key: 'idx_school_role', type: 'key', attributes: ['schoolId', 'role'] },
            { key: 'idx_authId', type: 'unique', attributes: ['authId'] },
            { key: 'idx_email', type: 'unique', attributes: ['email'] },
        ],
    },

    // ─── 3. STUDENTS ──────────────────────────────────────────
    STUDENTS: {
        id: 'students',
        name: 'Students',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'userId', type: 'string', size: 36 },                        // links to users.$id
            { key: 'admissionNumber', type: 'string', size: 50, required: true },// schoolCode/year/0001
            { key: 'admissionYear', type: 'integer', required: true },
            { key: 'firstName', type: 'string', size: 100, required: true },
            { key: 'lastName', type: 'string', size: 100, required: true },
            { key: 'gender', type: 'enum', elements: ['male', 'female'] },
            { key: 'dateOfBirth', type: 'string', size: 10 },
            { key: 'className', type: 'string', size: 20, required: true },
            { key: 'section', type: 'string', size: 5 },
            { key: 'profileImage', type: 'string', size: 500 },
            { key: 'parentName', type: 'string', size: 200 },
            { key: 'parentEmail', type: 'string', size: 255 },
            { key: 'parentPhone', type: 'string', size: 20 },
            { key: 'allergies', type: 'string', size: 500 },
            { key: 'status', type: 'enum', elements: ['active', 'graduated', 'withdrawn'], default: 'active' },
        ],
        indexes: [
            { key: 'idx_school_class', type: 'key', attributes: ['schoolId', 'className'] },
            { key: 'idx_admission', type: 'unique', attributes: ['schoolId', 'admissionNumber'] },
            { key: 'idx_userId', type: 'key', attributes: ['userId'] },
        ],
    },

    // ─── 4. STAFF ─────────────────────────────────────────────
    STAFF: {
        id: 'staff',
        name: 'Staff',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'userId', type: 'string', size: 36 },
            { key: 'staffId', type: 'string', size: 50, required: true },        // schoolCode/year/0001
            { key: 'employmentYear', type: 'integer', required: true },
            { key: 'firstName', type: 'string', size: 100, required: true },
            { key: 'lastName', type: 'string', size: 100, required: true },
            { key: 'dateOfBirth', type: 'string', size: 10 },
            { key: 'gender', type: 'enum', elements: ['male', 'female'] },
            { key: 'profileImage', type: 'string', size: 500 },
            { key: 'department', type: 'string', size: 100 },
            { key: 'staffType', type: 'enum', elements: ['academic', 'non_academic'], default: 'academic' },
            { key: 'assignedClasses', type: 'string', size: 500 },              // JSON array of class names
            { key: 'assignedSubjects', type: 'string', size: 500 },             // JSON array of subject IDs
            { key: 'formTeacherClass', type: 'string', size: 20 },              // class name if form teacher
            { key: 'canMarkStaffAttendance', type: 'boolean', default: false },
            { key: 'attendanceRole', type: 'enum', elements: ['none', 'officer'], default: 'none' },
            { key: 'attendanceAssignedBy', type: 'string', size: 36 },
            { key: 'attendanceAssignedAt', type: 'datetime' },
            { key: 'status', type: 'enum', elements: ['active', 'inactive'], default: 'active' },
        ],
        indexes: [
            { key: 'idx_school', type: 'key', attributes: ['schoolId'] },
            { key: 'idx_staffId', type: 'unique', attributes: ['schoolId', 'staffId'] },
            { key: 'idx_formTeacher', type: 'key', attributes: ['schoolId', 'formTeacherClass'] },
        ],
    },

    // ─── 5. ACADEMIC SESSIONS ─────────────────────────────────
    ACADEMIC_SESSIONS: {
        id: 'academic_sessions',
        name: 'Academic Sessions',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'session', type: 'string', size: 20, required: true },        // e.g. "2025/2026"
            { key: 'term', type: 'string', size: 20, required: true },           // "First Term", "Second Term", "Third Term"
            { key: 'startDate', type: 'string', size: 10 },
            { key: 'endDate', type: 'string', size: 10 },
            { key: 'isCurrent', type: 'boolean', default: false },
            { key: 'resultPublished', type: 'boolean', default: false },
        ],
        indexes: [
            { key: 'idx_school_session', type: 'key', attributes: ['schoolId', 'session'] },
            { key: 'idx_current', type: 'key', attributes: ['schoolId', 'isCurrent'] },
        ],
    },

    // ─── 6. CLASSES ───────────────────────────────────────────
    CLASSES: {
        id: 'classes',
        name: 'Classes',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'name', type: 'string', size: 50, required: true },           // e.g. "JSS1A"
            { key: 'level', type: 'string', size: 20 },                          // e.g. "JSS1", "SS2"
            { key: 'formTeacherId', type: 'string', size: 36 },                  // staff doc ID
            { key: 'studentCount', type: 'integer', default: 0 },
        ],
        indexes: [
            { key: 'idx_school', type: 'key', attributes: ['schoolId'] },
            { key: 'idx_name', type: 'unique', attributes: ['schoolId', 'name'] },
        ],
    },

    // ─── 7. SUBJECTS ──────────────────────────────────────────
    SUBJECTS: {
        id: 'subjects',
        name: 'Subjects',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'name', type: 'string', size: 100, required: true },
            { key: 'code', type: 'string', size: 10, required: true },
            { key: 'className', type: 'string', size: 20, required: true },
            { key: 'staffId', type: 'string', size: 36 },                       // assigned teacher
        ],
        indexes: [
            { key: 'idx_school_class', type: 'key', attributes: ['schoolId', 'className'] },
            { key: 'idx_code', type: 'unique', attributes: ['schoolId', 'code', 'className'] },
            { key: 'idx_staff', type: 'key', attributes: ['staffId'] },
        ],
    },

    // ─── 8. GRADING SCHEMES ───────────────────────────────────
    GRADING_SCHEMES: {
        id: 'grading_schemes',
        name: 'Grading Schemes',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'name', type: 'string', size: 100, required: true },
            { key: 'ranges', type: 'string', size: 2000 },                      // JSON: [{min,max,grade,remark}]
            { key: 'catWeight', type: 'float', default: 30 },                   // % weight for CAT
            { key: 'examWeight', type: 'float', default: 70 },                  // % weight for exam
            { key: 'scoreComponents', type: 'string', size: 5000 },             // JSON: [{id,name,weight}]
        ],
        indexes: [
            { key: 'idx_school', type: 'key', attributes: ['schoolId'] },
        ],
    },

    // ─── 9. RESULTS ───────────────────────────────────────────
    RESULTS: {
        id: 'results',
        name: 'Results',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'studentId', type: 'string', size: 36, required: true },
            { key: 'subjectId', type: 'string', size: 36, required: true },
            { key: 'className', type: 'string', size: 20, required: true },
            { key: 'term', type: 'string', size: 20, required: true },
            { key: 'session', type: 'string', size: 20, required: true },
            { key: 'catScore', type: 'float' },
            { key: 'examScore', type: 'float' },
            { key: 'totalScore', type: 'float' },
            { key: 'grade', type: 'string', size: 5 },
            { key: 'remark', type: 'string', size: 100 },
            { key: 'status', type: 'enum', elements: ['draft', 'submitted', 'approved'], default: 'draft' },
            { key: 'submittedBy', type: 'string', size: 36 },                   // staff userId
            { key: 'published', type: 'boolean', default: false },
            { key: 'isPublished', type: 'boolean', default: false },
            { key: 'isApproved', type: 'boolean', default: false },
            { key: 'publishedAt', type: 'datetime' },
            { key: 'publishedBy', type: 'string', size: 36 },
            { key: 'pinId', type: 'string', size: 36 },
        ],
        indexes: [
            { key: 'idx_student_term', type: 'key', attributes: ['studentId', 'term', 'session'] },
            { key: 'idx_school_status', type: 'key', attributes: ['schoolId', 'status'] },
            { key: 'idx_class_term', type: 'key', attributes: ['schoolId', 'className', 'term', 'session'] },
            { key: 'idx_published', type: 'key', attributes: ['schoolId', 'isPublished'] },
            { key: 'idx_unique_result', type: 'unique', attributes: ['studentId', 'subjectId', 'term', 'session'] },
        ],
    },

    // ─── 10. STUDENT ATTENDANCE ───────────────────────────────
    STUDENT_ATTENDANCE: {
        id: 'student_attendance',
        name: 'Student Attendance',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'studentId', type: 'string', size: 36, required: true },
            { key: 'className', type: 'string', size: 20, required: true },
            { key: 'date', type: 'string', size: 10, required: true },          // YYYY-MM-DD
            { key: 'status', type: 'enum', elements: ['present', 'absent', 'late', 'excused'], required: true },
            { key: 'markedBy', type: 'string', size: 36, required: true },       // form teacher userId
        ],
        indexes: [
            { key: 'idx_student_date', type: 'unique', attributes: ['studentId', 'date'] },
            { key: 'idx_school_date', type: 'key', attributes: ['schoolId', 'date'] },
            { key: 'idx_class_date', type: 'key', attributes: ['schoolId', 'className', 'date'] },
        ],
    },

    // ─── 11. STAFF ATTENDANCE ─────────────────────────────────
    STAFF_ATTENDANCE: {
        id: 'staff_attendance',
        name: 'Staff Attendance',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'staffDocId', type: 'string', size: 36, required: true },     // staff doc $id
            { key: 'date', type: 'string', size: 10, required: true },           // YYYY-MM-DD
            { key: 'checkIn', type: 'string', size: 8 },                        // HH:MM:SS
            { key: 'checkOut', type: 'string', size: 8 },                       // HH:MM:SS
            { key: 'status', type: 'enum', elements: ['present', 'absent', 'late', 'half_day'], default: 'present' },
            { key: 'markedBy', type: 'string', size: 36 },                      // admin or self
            { key: 'excuseReason', type: 'string', size: 500 },
            { key: 'excusedBy', type: 'string', size: 36 },
            { key: 'excusedAt', type: 'datetime' },
        ],
        indexes: [
            { key: 'idx_staff_date', type: 'unique', attributes: ['staffDocId', 'date'] },
            { key: 'idx_school_date', type: 'key', attributes: ['schoolId', 'date'] },
        ],
    },

    // ─── 12. PINS ─────────────────────────────────────────────
    PINS: {
        id: 'pins',
        name: 'PINs',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'code', type: 'string', size: 20, required: true },
            { key: 'studentId', type: 'string', size: 36 },
            { key: 'term', type: 'string', size: 20 },
            { key: 'session', type: 'string', size: 20 },
            { key: 'used', type: 'boolean', default: false },
            { key: 'paidBy', type: 'enum', elements: ['school', 'student'], default: 'school' },
            { key: 'price', type: 'float', default: 500 },                      // actual price charged
            { key: 'paymentRef', type: 'string', size: 100 },
            { key: 'expiresAt', type: 'datetime' },
            { key: 'createdAt', type: 'datetime' },
        ],
        indexes: [
            { key: 'idx_code', type: 'unique', attributes: ['code'] },
            { key: 'idx_school_used', type: 'key', attributes: ['schoolId', 'used'] },
            { key: 'idx_student', type: 'key', attributes: ['studentId'] },
        ],
    },

    // ─── 13. PAYMENTS ─────────────────────────────────────────
    PAYMENTS: {
        id: 'payments',
        name: 'Payments',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'reference', type: 'string', size: 100, required: true },
            { key: 'amount', type: 'float', required: true },
            { key: 'currency', type: 'string', size: 3, default: 'NGN' },
            { key: 'type', type: 'enum', elements: ['pin_purchase', 'withdrawal', 'student_pin_purchase', 'school_result_publish', 'student_result_access'], default: 'pin_purchase' },
            { key: 'status', type: 'enum', elements: ['pending', 'success', 'failed'], default: 'pending' },
            { key: 'provider', type: 'string', size: 20, default: 'squad' },
            { key: 'description', type: 'string', size: 500 },
            { key: 'studentId', type: 'string', size: 36 },                     // for student_pin_purchase
            { key: 'pinCount', type: 'integer' },                               // how many pins
            { key: 'metadata', type: 'string', size: 5000 },                    // JSON metadata
            { key: 'createdAt', type: 'datetime' },
        ],
        indexes: [
            { key: 'idx_reference', type: 'unique', attributes: ['reference'] },
            { key: 'idx_school_status', type: 'key', attributes: ['schoolId', 'status'] },
            { key: 'idx_school_type', type: 'key', attributes: ['schoolId', 'type'] },
        ],
    },

    // ─── 14. CHAT MESSAGES ────────────────────────────────────
    CHAT_MESSAGES: {
        id: 'chat_messages',
        name: 'Chat Messages',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'senderId', type: 'string', size: 36, required: true },
            { key: 'senderName', type: 'string', size: 200, required: true },
            { key: 'senderRole', type: 'string', size: 20 },
            { key: 'message', type: 'string', size: 5000, required: true },
            { key: 'channel', type: 'string', size: 50, default: 'general' },   // "general", "admin", or specific
            { key: 'createdAt', type: 'datetime' },
        ],
        indexes: [
            { key: 'idx_school_channel', type: 'key', attributes: ['schoolId', 'channel'] },
            { key: 'idx_created', type: 'key', attributes: ['createdAt'] },
        ],
    },

    EMAIL_SENDS: {
        id: 'email_sends',
        name: 'Email Sends',
        attributes: [
            { key: 'schoolId', type: 'string', size: 36, required: true },
            { key: 'recipients', type: 'string', size: 255, required: true, array: true },
            { key: 'subject', type: 'string', size: 255, required: true },
            { key: 'body', type: 'string', size: 20000, required: true },
            { key: 'status', type: 'enum', elements: ['pending', 'sent', 'failed'], default: 'pending' },
            { key: 'errorMessage', type: 'string', size: 1000 },
            { key: 'sentBy', type: 'string', size: 36 },
            { key: 'sentAt', type: 'datetime' },
            { key: 'createdAt', type: 'datetime', required: true },
        ],
        indexes: [
            { key: 'idx_school_created', type: 'key', attributes: ['schoolId', 'createdAt'] },
            { key: 'idx_school_status', type: 'key', attributes: ['schoolId', 'status'] },
        ],
    },
};

module.exports = { DATABASE_ID, BUCKET_ID, COLLECTIONS };
