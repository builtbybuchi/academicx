/**
 * @typedef {Object} School
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {string} email
 * @property {string} phone
 * @property {string} logo
 * @property {'active'|'inactive'|'suspended'} status
 * @property {string} subscriptionPlan
 * @property {string} createdAt
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} schoolId
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {'super_admin'|'admin'|'staff'|'student'|'parent'} role
 * @property {'active'|'inactive'} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Student
 * @property {string} id
 * @property {string} schoolId
 * @property {string} userId
 * @property {string} admissionNumber
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} className
 * @property {string} section
 * @property {string} parentId
 * @property {'active'|'graduated'|'withdrawn'} status
 */

/**
 * @typedef {Object} Staff
 * @property {string} id
 * @property {string} schoolId
 * @property {string} userId
 * @property {string} staffId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} department
 * @property {string[]} assignedClasses
 * @property {string[]} assignedSubjects
 * @property {'active'|'inactive'} status
 */

/**
 * @typedef {Object} Subject
 * @property {string} id
 * @property {string} schoolId
 * @property {string} name
 * @property {string} code
 * @property {string} className
 * @property {string} staffId
 */

/**
 * @typedef {Object} Result
 * @property {string} id
 * @property {string} schoolId
 * @property {string} studentId
 * @property {string} subjectId
 * @property {string} term
 * @property {string} session
 * @property {number} catScore
 * @property {number} mockScore
 * @property {number} examScore
 * @property {number} totalScore
 * @property {string} grade
 * @property {string} remark
 * @property {'draft'|'submitted'|'approved'} status
 */

/**
 * @typedef {Object} Attendance
 * @property {string} id
 * @property {string} schoolId
 * @property {string} studentId
 * @property {string} date
 * @property {'present'|'absent'|'late'|'excused'} status
 * @property {string} markedBy
 */

/**
 * @typedef {Object} PIN
 * @property {string} id
 * @property {string} schoolId
 * @property {string} code
 * @property {string} studentId
 * @property {string} term
 * @property {string} session
 * @property {boolean} used
 * @property {string} expiresAt
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} schoolId
 * @property {string} reference
 * @property {number} amount
 * @property {'NGN'|'USD'|'GBP'} currency
 * @property {'pending'|'success'|'failed'} status
 * @property {string} provider - 'squad'
 * @property {string} description
 * @property {string} createdAt
 */

/**
 * @typedef {Object} GradingScheme
 * @property {string} id
 * @property {string} schoolId
 * @property {string} name
 * @property {Array<{min: number, max: number, grade: string, remark: string}>} ranges
 */

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    STAFF: 'staff',
    STUDENT: 'student',
    PARENT: 'parent',
};

export const TERMS = ['First Term', 'Second Term', 'Third Term'];
export const ATTENDANCE_STATUS = ['present', 'absent', 'late', 'excused'];
