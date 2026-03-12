/**
 * AcademicX - Auth Functions
 * School registration, user management, ID generation, profile updates.
 */
require('dotenv').config();
const { Client, Databases, Account, Users, ID, Query } = require('node-appwrite');
const { DATABASE_ID, COLLECTIONS } = require('../database/schema.js');

function getClient() {
    const client = new Client();
    client
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID || '')
        .setKey(process.env.APPWRITE_API_KEY || '');
    return client;
}

/**
 * Validate school code: 3-8 alphabetic characters only.
 */
function validateSchoolCode(code) {
    const regex = /^[a-zA-Z]{3,8}$/;
    if (!regex.test(code)) {
        return { valid: false, error: 'School code must be 3-8 alphabetic characters only.' };
    }
    return { valid: true, code: code.toUpperCase() };
}

/**
 * Generate a unique ID in the format: SCHOOLCODE/YEAR/NNNN
 * @param {string} schoolCode
 * @param {number} year - admission/employment year
 * @param {string} collectionId - 'students' or 'staff'
 * @param {string} schoolId - school document ID
 */
async function generateUniqueId(schoolCode, year, collectionId, schoolId) {
    const db = new Databases(getClient());
    const prefix = `${schoolCode}/${year}/`;

    // Count existing records for this school + year to determine next sequence
    const countField = collectionId === 'students' ? 'admissionYear' : 'employmentYear';

    try {
        const existing = await db.listDocuments(DATABASE_ID, collectionId, [
            Query.equal('schoolId', schoolId),
            Query.equal(countField, year),
            Query.limit(1),
            Query.orderDesc('$createdAt'),
        ]);

        let nextNum = 1;
        if (existing.total > 0) {
            // Extract sequence from last entry
            const lastId = collectionId === 'students'
                ? existing.documents[0].admissionNumber
                : existing.documents[0].staffId;
            const parts = lastId.split('/');
            if (parts.length === 3) {
                nextNum = parseInt(parts[2], 10) + 1;
            } else {
                nextNum = existing.total + 1;
            }
        }

        return `${prefix}${String(nextNum).padStart(4, '0')}`;
    } catch {
        return `${prefix}0001`;
    }
}

/**
 * Register a new school and create the first admin user.
 */
async function registerSchool({ schoolCode, schoolName, address, email, phone, adminFirstName, adminLastName, adminEmail, adminPassword }) {
    const validation = validateSchoolCode(schoolCode);
    if (!validation.valid) return { success: false, error: validation.error };

    const code = validation.code;
    const client = getClient();
    const db = new Databases(client);
    const users = new Users(client);

    // Check if school code already exists
    try {
        const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOLS.id, [
            Query.equal('schoolCode', code),
            Query.limit(1),
        ]);
        if (existing.total > 0) {
            return { success: false, error: 'School code already taken.' };
        }
    } catch (e) { /* collection may be empty */ }

    // Create Appwrite auth user for admin
    let authUser;
    try {
        authUser = await users.create(ID.unique(), adminEmail, undefined, adminPassword, `${adminFirstName} ${adminLastName}`);
    } catch (e) {
        return { success: false, error: `Failed to create admin user: ${e.message}` };
    }

    // Create school document
    const now = new Date().toISOString();
    const schoolDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, ID.unique(), {
        schoolCode: code,
        name: schoolName,
        address: address || '',
        email: email,
        phone: phone || '',
        status: 'active',
        paymentModel: 'school_pays',
        customPinPrice: 0,
        schoolBalance: 0,
        resultPublished: false,
        createdBy: authUser.$id,
        createdAt: now,
    });

    // Create user profile document
    await db.createDocument(DATABASE_ID, COLLECTIONS.USERS.id, ID.unique(), {
        schoolId: schoolDoc.$id,
        schoolCode: code,
        authId: authUser.$id,
        email: adminEmail,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'admin',
        status: 'active',
        createdAt: now,
    });

    return {
        success: true,
        data: {
            schoolId: schoolDoc.$id,
            schoolCode: code,
            userId: authUser.$id,
        },
    };
}

/**
 * Enroll a student with auto-generated admission number.
 */
async function enrollStudent({ schoolId, schoolCode, firstName, lastName, className, gender, dateOfBirth, parentName, parentEmail, parentPhone, section }) {
    const db = new Databases(getClient());
    const year = new Date().getFullYear();
    const admissionNumber = await generateUniqueId(schoolCode, year, 'students', schoolId);
    const password = `${schoolCode.toLowerCase()}${admissionNumber.split('/').pop()}`;

    // Create auth account for student login
    const users = new Users(getClient());
    let authUser;
    const studentEmail = `${admissionNumber.replace(/\//g, '.')}@${schoolCode.toLowerCase()}.academicx.local`;

    try {
        authUser = await users.create(ID.unique(), studentEmail, undefined, password, `${firstName} ${lastName}`);
    } catch (e) {
        return { success: false, error: `Failed to create student user: ${e.message}` };
    }

    // Create user doc
    const now = new Date().toISOString();
    await db.createDocument(DATABASE_ID, COLLECTIONS.USERS.id, ID.unique(), {
        schoolId, schoolCode, authId: authUser.$id, email: studentEmail,
        firstName, lastName, role: 'student', status: 'active', createdAt: now,
    });

    // Create student doc
    const studentDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.STUDENTS.id, ID.unique(), {
        schoolId, userId: authUser.$id, admissionNumber, admissionYear: year,
        firstName, lastName, gender: gender || undefined, dateOfBirth: dateOfBirth || undefined,
        className, section: section || undefined,
        parentName: parentName || '', parentEmail: parentEmail || '', parentPhone: parentPhone || '',
        status: 'active',
    });

    return {
        success: true,
        data: {
            studentId: studentDoc.$id,
            admissionNumber,
            loginEmail: studentEmail,
            loginPassword: password,
        },
    };
}

/**
 * Add a staff member with auto-generated staff ID.
 */
async function addStaff({ schoolId, schoolCode, firstName, lastName, department, staffType, gender, email, password }) {
    const db = new Databases(getClient());
    const year = new Date().getFullYear();
    const staffIdStr = await generateUniqueId(schoolCode, year, 'staff', schoolId);

    const users = new Users(getClient());
    let authUser;
    try {
        authUser = await users.create(ID.unique(), email, undefined, password, `${firstName} ${lastName}`);
    } catch (e) {
        return { success: false, error: `Failed to create staff user: ${e.message}` };
    }

    const now = new Date().toISOString();
    await db.createDocument(DATABASE_ID, COLLECTIONS.USERS.id, ID.unique(), {
        schoolId, schoolCode, authId: authUser.$id, email,
        firstName, lastName, role: 'staff', status: 'active', createdAt: now,
    });

    const staffDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.STAFF.id, ID.unique(), {
        schoolId, userId: authUser.$id, staffId: staffIdStr, employmentYear: year,
        firstName, lastName, gender: gender || undefined,
        department: department || '', staffType: staffType || 'academic',
        status: 'active',
    });

    return {
        success: true,
        data: { staffDocId: staffDoc.$id, staffId: staffIdStr, email },
    };
}

/**
 * Update a user's profile (admin, staff, or student can edit their own).
 */
async function updateProfile(userId, updates) {
    const db = new Databases(getClient());

    // Fetch user doc
    const userDocs = await db.listDocuments(DATABASE_ID, COLLECTIONS.USERS.id, [
        Query.equal('authId', userId), Query.limit(1),
    ]);

    if (userDocs.total === 0) return { success: false, error: 'User not found.' };

    const userDoc = userDocs.documents[0];
    const allowedFields = ['firstName', 'lastName', 'phone', 'profileImage'];
    const filtered = {};
    for (const key of allowedFields) {
        if (updates[key] !== undefined) filtered[key] = updates[key];
    }

    await db.updateDocument(DATABASE_ID, COLLECTIONS.USERS.id, userDoc.$id, filtered);

    // Also update the corresponding student/staff document if applicable
    if (userDoc.role === 'student') {
        const studentDocs = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, [
            Query.equal('userId', userDoc.authId), Query.limit(1),
        ]);
        if (studentDocs.total > 0) {
            const studentUpdates = {};
            if (updates.firstName) studentUpdates.firstName = updates.firstName;
            if (updates.lastName) studentUpdates.lastName = updates.lastName;
            if (updates.parentName) studentUpdates.parentName = updates.parentName;
            if (updates.parentEmail) studentUpdates.parentEmail = updates.parentEmail;
            if (updates.parentPhone) studentUpdates.parentPhone = updates.parentPhone;
            if (updates.profileImage) studentUpdates.profileImage = updates.profileImage;
            if (updates.dateOfBirth) studentUpdates.dateOfBirth = updates.dateOfBirth;
            await db.updateDocument(DATABASE_ID, COLLECTIONS.STUDENTS.id, studentDocs.documents[0].$id, studentUpdates);
        }
    } else if (userDoc.role === 'staff') {
        const staffDocs = await db.listDocuments(DATABASE_ID, COLLECTIONS.STAFF.id, [
            Query.equal('userId', userDoc.authId), Query.limit(1),
        ]);
        if (staffDocs.total > 0) {
            const staffUpdates = {};
            if (updates.firstName) staffUpdates.firstName = updates.firstName;
            if (updates.lastName) staffUpdates.lastName = updates.lastName;
            if (updates.department) staffUpdates.department = updates.department;
            if (updates.profileImage) staffUpdates.profileImage = updates.profileImage;
            await db.updateDocument(DATABASE_ID, COLLECTIONS.STAFF.id, staffDocs.documents[0].$id, staffUpdates);
        }
    }

    return { success: true };
}

module.exports = {
    validateSchoolCode,
    generateUniqueId,
    registerSchool,
    enrollStudent,
    addStaff,
    updateProfile,
};
