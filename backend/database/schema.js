/**
 * AcademicX - Extracted Database Schema
 * Generated: 2026-03-28T16:18:30.801Z
 */

const DATABASE_ID = 'academicx_db';
const BUCKET_ID = 'school_media';

const COLLECTIONS = {
    // Schools
    SCHOOLS: {
        id: 'schools',
        name: 'Schools',
        attributes: [
        {
            key: 'schoolCode',
            required: true,
            type: 'string',
            size: 8,
        },
        {
            key: 'name',
            required: true,
            type: 'string',
            size: 255,
        },
        {
            key: 'address',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'email',
            required: true,
            type: 'string',
            size: 255,
        },
        {
            key: 'phone',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'logo',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["active","inactive","suspended"],
            default: 'active',
        },
        {
            key: 'paymentModel',
            required: false,
            type: 'enum',
            elements: ["school_pays","student_pays"],
            default: 'school_pays',
        },
        {
            key: 'customPinPrice',
            required: false,
            type: 'integer',
            default: 0,
        },
        {
            key: 'schoolBalance',
            required: false,
            type: 'float',
            default: 0,
        },
        {
            key: 'resultPublished',
            required: false,
            type: 'boolean',
            default: false,
        },
        {
            key: 'currentSession',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'currentTerm',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'createdBy',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'createdAt',
            required: false,
            type: 'datetime',
        },
        {
            key: 'templateId',
            required: false,
            type: 'string',
            size: 50,
            default: 'template1',
        },
        {
            key: 'websiteSlug',
            required: false,
            type: 'string',
            size: 100,
        },
        {
            key: 'data',
            required: false,
            type: 'string',
            size: 50000,
            default: '{}',
        }
        ],
        indexes: [
        { key: 'idx_schoolCode', type: 'unique', attributes: ["schoolCode"] },
        { key: 'idx_status', type: 'key', attributes: ["status"] },
        { key: 'idx_email', type: 'unique', attributes: ["email"] },
        { key: 'idx_websiteSlug', type: 'unique', attributes: ["websiteSlug"] }
        ],
    },

    // Users
    USERS: {
        id: 'users',
        name: 'Users',
        attributes: [
        {
            key: 'schoolId',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'schoolCode',
            required: false,
            type: 'string',
            size: 8,
        },
        {
            key: 'authId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'email',
            required: true,
            type: 'string',
            size: 255,
        },
        {
            key: 'firstName',
            required: true,
            type: 'string',
            size: 100,
        },
        {
            key: 'lastName',
            required: true,
            type: 'string',
            size: 100,
        },
        {
            key: 'phone',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'profileImage',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'role',
            required: true,
            type: 'enum',
            elements: ["super_admin","admin","staff","student"],
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["active","inactive"],
            default: 'active',
        },
        {
            key: 'createdAt',
            required: false,
            type: 'datetime',
        },
        {
            key: 'dateOfBirth',
            required: false,
            type: 'string',
            size: 10,
        }
        ],
        indexes: [
        { key: 'idx_school_role', type: 'key', attributes: ["schoolId","role"] },
        { key: 'idx_authId', type: 'unique', attributes: ["authId"] },
        { key: 'idx_email', type: 'unique', attributes: ["email"] }
        ],
    },

    // Students
    STUDENTS: {
        id: 'students',
        name: 'Students',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'userId',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'admissionNumber',
            required: true,
            type: 'string',
            size: 50,
        },
        {
            key: 'admissionYear',
            required: true,
            type: 'integer',
        },
        {
            key: 'firstName',
            required: true,
            type: 'string',
            size: 100,
        },
        {
            key: 'lastName',
            required: true,
            type: 'string',
            size: 100,
        },
        {
            key: 'gender',
            required: false,
            type: 'enum',
            elements: ["male","female"],
        },
        {
            key: 'dateOfBirth',
            required: false,
            type: 'string',
            size: 10,
        },
        {
            key: 'className',
            required: true,
            type: 'string',
            size: 20,
        },
        {
            key: 'section',
            required: false,
            type: 'string',
            size: 5,
        },
        {
            key: 'profileImage',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'parentName',
            required: false,
            type: 'string',
            size: 200,
        },
        {
            key: 'parentEmail',
            required: false,
            type: 'string',
            size: 255,
        },
        {
            key: 'parentPhone',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["active","graduated","withdrawn"],
            default: 'active',
        },
        {
            key: 'allergies',
            required: false,
            type: 'string',
            size: 500,
        }
        ],
        indexes: [
        { key: 'idx_school_class', type: 'key', attributes: ["schoolId","className"] },
        { key: 'idx_admission', type: 'unique', attributes: ["schoolId","admissionNumber"] },
        { key: 'idx_userId', type: 'key', attributes: ["userId"] }
        ],
    },

    // Staff
    STAFF: {
        id: 'staff',
        name: 'Staff',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'userId',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'staffId',
            required: true,
            type: 'string',
            size: 50,
        },
        {
            key: 'employmentYear',
            required: true,
            type: 'integer',
        },
        {
            key: 'firstName',
            required: true,
            type: 'string',
            size: 100,
        },
        {
            key: 'lastName',
            required: true,
            type: 'string',
            size: 100,
        },
        {
            key: 'gender',
            required: false,
            type: 'enum',
            elements: ["male","female"],
        },
        {
            key: 'profileImage',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'department',
            required: false,
            type: 'string',
            size: 100,
        },
        {
            key: 'staffType',
            required: false,
            type: 'enum',
            elements: ["academic","non_academic"],
            default: 'academic',
        },
        {
            key: 'assignedClasses',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'assignedSubjects',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'formTeacherClass',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["active","inactive"],
            default: 'active',
        },
        {
            key: 'dateOfBirth',
            required: false,
            type: 'string',
            size: 10,
        },
        {
            key: 'canMarkStaffAttendance',
            required: false,
            type: 'boolean',
            default: false,
        },
        {
            key: 'attendanceRole',
            required: false,
            type: 'enum',
            elements: ["none","officer"],
            default: 'none',
        },
        {
            key: 'attendanceAssignedBy',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'attendanceAssignedAt',
            required: false,
            type: 'datetime',
        },
        {
            key: 'formTeacherClasses',
            required: false,
            type: 'string',
            size: 2000,
        }
        ],
        indexes: [
        { key: 'idx_school', type: 'key', attributes: ["schoolId"] },
        { key: 'idx_staffId', type: 'unique', attributes: ["schoolId","staffId"] },
        { key: 'idx_formTeacher', type: 'key', attributes: ["schoolId","formTeacherClass"] }
        ],
    },

    // Academic Sessions
    ACADEMIC_SESSIONS: {
        id: 'academic_sessions',
        name: 'Academic Sessions',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'session',
            required: true,
            type: 'string',
            size: 20,
        },
        {
            key: 'term',
            required: true,
            type: 'string',
            size: 20,
        },
        {
            key: 'startDate',
            required: false,
            type: 'string',
            size: 10,
        },
        {
            key: 'endDate',
            required: false,
            type: 'string',
            size: 10,
        },
        {
            key: 'isCurrent',
            required: false,
            type: 'boolean',
            default: false,
        },
        {
            key: 'resultPublished',
            required: false,
            type: 'boolean',
            default: false,
        }
        ],
        indexes: [
        { key: 'idx_school_session', type: 'key', attributes: ["schoolId","session"] },
        { key: 'idx_current', type: 'key', attributes: ["schoolId","isCurrent"] }
        ],
    },

    // Classes
    CLASSES: {
        id: 'classes',
        name: 'Classes',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'name',
            required: true,
            type: 'string',
            size: 50,
        },
        {
            key: 'level',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'formTeacherId',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'studentCount',
            required: false,
            type: 'integer',
            default: 0,
        }
        ],
        indexes: [
        { key: 'idx_school', type: 'key', attributes: ["schoolId"] },
        { key: 'idx_name', type: 'unique', attributes: ["schoolId","name"] }
        ],
    },

    // Subjects
    SUBJECTS: {
        id: 'subjects',
        name: 'Subjects',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'name',
            required: true,
            type: 'string',
            size: 100,
        },
        {
            key: 'code',
            required: true,
            type: 'string',
            size: 10,
        },
        {
            key: 'className',
            required: true,
            type: 'string',
            size: 20,
        },
        {
            key: 'staffId',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'templateName',
            required: false,
            type: 'string',
            size: 100,
        }
        ],
        indexes: [
        { key: 'idx_school_class', type: 'key', attributes: ["schoolId","className"] },
        { key: 'idx_code', type: 'unique', attributes: ["schoolId","code","className"] },
        { key: 'idx_staff', type: 'key', attributes: ["staffId"] },
        { key: 'idx_template', type: 'key', attributes: ["schoolId","templateName"] }
        ],
    },

    // Grading Schemes
    GRADING_SCHEMES: {
        id: 'grading_schemes',
        name: 'Grading Schemes',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'name',
            required: true,
            type: 'string',
            size: 100,
        },
        {
            key: 'ranges',
            required: false,
            type: 'string',
            size: 2000,
        },
        {
            key: 'catWeight',
            required: false,
            type: 'float',
            default: 30,
        },
        {
            key: 'examWeight',
            required: false,
            type: 'float',
            default: 70,
        },
        {
            key: 'scoreComponents',
            required: false,
            type: 'string',
            size: 5000,
        }
        ],
        indexes: [
        { key: 'idx_school', type: 'key', attributes: ["schoolId"] }
        ],
    },

    // Results
    RESULTS: {
        id: 'results',
        name: 'Results',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'studentId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'subjectId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'catScore',
            required: false,
            type: 'float',
        },
        {
            key: 'examScore',
            required: false,
            type: 'float',
        },
        {
            key: 'totalScore',
            required: false,
            type: 'float',
        },
        {
            key: 'grade',
            required: false,
            type: 'string',
            size: 5,
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["draft","submitted","approved"],
            default: 'draft',
        },
        {
            key: 'className',
            required: true,
            type: 'string',
            size: 20,
        },
        {
            key: 'term',
            required: true,
            type: 'string',
            size: 20,
        },
        {
            key: 'session',
            required: true,
            type: 'string',
            size: 20,
        },
        {
            key: 'remark',
            required: false,
            type: 'string',
            size: 100,
        },
        {
            key: 'submittedBy',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'published',
            required: false,
            type: 'boolean',
            default: false,
        },
        {
            key: 'isPublished',
            required: false,
            type: 'boolean',
            default: false,
        },
        {
            key: 'isApproved',
            required: false,
            type: 'boolean',
            default: false,
        },
        {
            key: 'publishedAt',
            required: false,
            type: 'datetime',
        },
        {
            key: 'publishedBy',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'pinId',
            required: false,
            type: 'string',
            size: 36,
        }
        ],
        indexes: [
        { key: 'idx_school_status', type: 'key', attributes: ["schoolId","status"] },
        { key: 'idx_student_term', type: 'key', attributes: ["studentId","term","session"] },
        { key: 'idx_class_term', type: 'key', attributes: ["schoolId","className","term","session"] },
        { key: 'idx_unique_result', type: 'unique', attributes: ["studentId","subjectId","term","session"] },
        { key: 'idx_published', type: 'key', attributes: ["schoolId","isPublished"] }
        ],
    },

    // Student Attendance
    STUDENT_ATTENDANCE: {
        id: 'student_attendance',
        name: 'Student Attendance',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'studentId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'className',
            required: true,
            type: 'string',
            size: 20,
        },
        {
            key: 'date',
            required: true,
            type: 'string',
            size: 10,
        },
        {
            key: 'status',
            required: true,
            type: 'enum',
            elements: ["present","absent","late","excused"],
        },
        {
            key: 'markedBy',
            required: true,
            type: 'string',
            size: 36,
        }
        ],
        indexes: [
        { key: 'idx_student_date', type: 'unique', attributes: ["studentId","date"] },
        { key: 'idx_school_date', type: 'key', attributes: ["schoolId","date"] },
        { key: 'idx_class_date', type: 'key', attributes: ["schoolId","className","date"] }
        ],
    },

    // Staff Attendance
    STAFF_ATTENDANCE: {
        id: 'staff_attendance',
        name: 'Staff Attendance',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'staffDocId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'date',
            required: true,
            type: 'string',
            size: 10,
        },
        {
            key: 'checkIn',
            required: false,
            type: 'string',
            size: 8,
        },
        {
            key: 'checkOut',
            required: false,
            type: 'string',
            size: 8,
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["present","absent","late","half_day"],
            default: 'present',
        },
        {
            key: 'markedBy',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'excuseReason',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'excusedBy',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'excusedAt',
            required: false,
            type: 'datetime',
        }
        ],
        indexes: [
        { key: 'idx_staff_date', type: 'unique', attributes: ["staffDocId","date"] },
        { key: 'idx_school_date', type: 'key', attributes: ["schoolId","date"] }
        ],
    },

    // PINs
    PINS: {
        id: 'pins',
        name: 'PINs',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'code',
            required: true,
            type: 'string',
            size: 20,
        },
        {
            key: 'studentId',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'term',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'session',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'used',
            required: false,
            type: 'boolean',
            default: false,
        },
        {
            key: 'paidBy',
            required: false,
            type: 'enum',
            elements: ["school","student"],
            default: 'school',
        },
        {
            key: 'price',
            required: false,
            type: 'float',
            default: 500,
        },
        {
            key: 'paymentRef',
            required: false,
            type: 'string',
            size: 100,
        },
        {
            key: 'expiresAt',
            required: false,
            type: 'datetime',
        },
        {
            key: 'createdAt',
            required: false,
            type: 'datetime',
        }
        ],
        indexes: [
        { key: 'idx_code', type: 'unique', attributes: ["code"] },
        { key: 'idx_school_used', type: 'key', attributes: ["schoolId","used"] },
        { key: 'idx_student', type: 'key', attributes: ["studentId"] }
        ],
    },

    // Payments
    PAYMENTS: {
        id: 'payments',
        name: 'Payments',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'reference',
            required: true,
            type: 'string',
            size: 100,
        },
        {
            key: 'amount',
            required: true,
            type: 'float',
        },
        {
            key: 'currency',
            required: false,
            type: 'string',
            size: 3,
            default: 'NGN',
        },
        {
            key: 'type',
            required: false,
            type: 'enum',
            elements: ["pin_purchase","withdrawal","student_pin_purchase"],
            default: 'pin_purchase',
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["pending","success","failed"],
            default: 'pending',
        },
        {
            key: 'provider',
            required: false,
            type: 'string',
            size: 20,
            default: 'squad',
        },
        {
            key: 'description',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'studentId',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'pinCount',
            required: false,
            type: 'integer',
        },
        {
            key: 'createdAt',
            required: false,
            type: 'datetime',
        },
        {
            key: 'metadata',
            required: false,
            type: 'string',
            size: 5000,
        }
        ],
        indexes: [
        { key: 'idx_reference', type: 'unique', attributes: ["reference"] },
        { key: 'idx_school_status', type: 'key', attributes: ["schoolId","status"] },
        { key: 'idx_school_type', type: 'key', attributes: ["schoolId","type"] }
        ],
    },

    // Chat Messages
    CHAT_MESSAGES: {
        id: 'chat_messages',
        name: 'Chat Messages',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'senderId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'senderName',
            required: true,
            type: 'string',
            size: 200,
        },
        {
            key: 'senderRole',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'message',
            required: true,
            type: 'string',
            size: 5000,
        },
        {
            key: 'channel',
            required: false,
            type: 'string',
            size: 50,
            default: 'general',
        },
        {
            key: 'createdAt',
            required: false,
            type: 'datetime',
        }
        ],
        indexes: [
        { key: 'idx_school_channel', type: 'key', attributes: ["schoolId","channel"] },
        { key: 'idx_created', type: 'key', attributes: ["createdAt"] }
        ],
    },

    // Email Sends
    EMAIL_SENDS: {
        id: 'email_sends',
        name: 'Email Sends',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'recipients',
            required: true,
            type: 'string',
            size: 255,
            array: true,
        },
        {
            key: 'subject',
            required: true,
            type: 'string',
            size: 255,
        },
        {
            key: 'body',
            required: true,
            type: 'string',
            size: 20000,
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["pending","sent","failed"],
            default: 'pending',
        },
        {
            key: 'errorMessage',
            required: false,
            type: 'string',
            size: 1000,
        },
        {
            key: 'sentBy',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'sentAt',
            required: false,
            type: 'datetime',
        },
        {
            key: 'createdAt',
            required: true,
            type: 'datetime',
        }
        ],
        indexes: [
        { key: 'idx_school_created', type: 'key', attributes: ["schoolId","createdAt"] },
        { key: 'idx_school_status', type: 'key', attributes: ["schoolId","status"] }
        ],
    },

    // Events
    EVENTS: {
        id: 'events',
        name: 'Events',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'title',
            required: true,
            type: 'string',
            size: 200,
        },
        {
            key: 'date',
            required: false,
            type: 'string',
            size: 10,
        },
        {
            key: 'time',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'location',
            required: false,
            type: 'string',
            size: 200,
        },
        {
            key: 'description',
            required: false,
            type: 'string',
            size: 5000,
        },
        {
            key: 'image',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'summary',
            required: false,
            type: 'string',
            size: 2000,
        },
        {
            key: 'startsAt',
            required: false,
            type: 'datetime',
        },
        {
            key: 'endsAt',
            required: false,
            type: 'datetime',
        },
        {
            key: 'sortOrder',
            required: false,
            type: 'integer',
            default: 0,
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["draft","published"],
            default: 'published',
        },
        {
            key: 'createdAt',
            required: true,
            type: 'datetime',
        }
        ],
        indexes: [
        { key: 'idx_school_status_createdAt', type: 'key', attributes: ["schoolId","status","createdAt"] },
        { key: 'idx_school_date', type: 'key', attributes: ["schoolId","date"] },
        { key: 'idx_school_startsAt', type: 'key', attributes: ["schoolId","startsAt"] }
        ],
    },

    // News
    NEWS: {
        id: 'news',
        name: 'News',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'title',
            required: true,
            type: 'string',
            size: 200,
        },
        {
            key: 'summary',
            required: false,
            type: 'string',
            size: 2000,
        },
        {
            key: 'body',
            required: false,
            type: 'string',
            size: 20000,
        },
        {
            key: 'image',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'publishedAt',
            required: false,
            type: 'datetime',
        },
        {
            key: 'sortOrder',
            required: false,
            type: 'integer',
            default: 0,
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["draft","published"],
            default: 'published',
        },
        {
            key: 'createdAt',
            required: true,
            type: 'datetime',
        }
        ],
        indexes: [
        { key: 'idx_news_school_status', type: 'key', attributes: ["schoolId","status"] },
        { key: 'idx_news_school_published', type: 'key', attributes: ["schoolId","publishedAt"] }
        ],
    },

    // Gallery Images
    GALLERY_IMAGES: {
        id: 'gallery_images',
        name: 'Gallery Images',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'fileId',
            required: false,
            type: 'string',
            size: 36,
        },
        {
            key: 'imageUrl',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'caption',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'sortOrder',
            required: false,
            type: 'integer',
            default: 0,
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["hidden","visible"],
            default: 'visible',
        },
        {
            key: 'createdAt',
            required: true,
            type: 'datetime',
        }
        ],
        indexes: [
        { key: 'idx_gallery_school_sort', type: 'key', attributes: ["schoolId","sortOrder"] },
        { key: 'idx_gallery_school_created', type: 'key', attributes: ["schoolId","createdAt"] }
        ],
    },

    // Testimonials
    TESTIMONIALS: {
        id: 'testimonials',
        name: 'Testimonials',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'name',
            required: true,
            type: 'string',
            size: 150,
        },
        {
            key: 'role',
            required: false,
            type: 'string',
            size: 100,
        },
        {
            key: 'message',
            required: true,
            type: 'string',
            size: 5000,
        },
        {
            key: 'avatar',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'sortOrder',
            required: false,
            type: 'integer',
            default: 0,
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["draft","published"],
            default: 'published',
        },
        {
            key: 'createdAt',
            required: true,
            type: 'datetime',
        }
        ],
        indexes: [
        { key: 'idx_school_status_createdAt', type: 'key', attributes: ["schoolId","status","createdAt"] },
        { key: 'idx_testimonials_school_sort', type: 'key', attributes: ["schoolId","sortOrder"] }
        ],
    },

    // Accreditations & Partnerships
    ACCREDITATIONS: {
        id: 'accreditations',
        name: 'Accreditations & Partnerships',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'type',
            required: false,
            type: 'enum',
            elements: ["accreditation","partnership"],
            default: 'accreditation',
        },
        {
            key: 'name',
            required: true,
            type: 'string',
            size: 200,
        },
        {
            key: 'logo',
            required: false,
            type: 'string',
            size: 500,
        },
        {
            key: 'website',
            required: false,
            type: 'string',
            size: 255,
        },
        {
            key: 'sortOrder',
            required: false,
            type: 'integer',
            default: 0,
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["draft","published"],
            default: 'published',
        },
        {
            key: 'createdAt',
            required: true,
            type: 'datetime',
        }
        ],
        indexes: [
        { key: 'idx_school_status_createdAt', type: 'key', attributes: ["schoolId","status","createdAt"] },
        { key: 'idx_accredit_school_sort', type: 'key', attributes: ["schoolId","sortOrder"] }
        ],
    },

    // Contact Messages
    CONTACT_MESSAGES: {
        id: 'contact_messages',
        name: 'Contact Messages',
        attributes: [
        {
            key: 'schoolId',
            required: true,
            type: 'string',
            size: 36,
        },
        {
            key: 'name',
            required: true,
            type: 'string',
            size: 150,
        },
        {
            key: 'email',
            required: false,
            type: 'string',
            size: 255,
        },
        {
            key: 'phone',
            required: false,
            type: 'string',
            size: 20,
        },
        {
            key: 'subject',
            required: false,
            type: 'string',
            size: 200,
        },
        {
            key: 'message',
            required: true,
            type: 'string',
            size: 5000,
        },
        {
            key: 'readAt',
            required: false,
            type: 'datetime',
        },
        {
            key: 'status',
            required: false,
            type: 'enum',
            elements: ["new","read","archived"],
            default: 'new',
        },
        {
            key: 'createdAt',
            required: true,
            type: 'datetime',
        }
        ],
        indexes: [
        { key: 'idx_school_status_createdAt', type: 'key', attributes: ["schoolId","status","createdAt"] }
        ],
    },
};

module.exports = { DATABASE_ID, BUCKET_ID, COLLECTIONS };
