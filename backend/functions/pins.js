/**
 * AcademicX - PIN Functions
 * PIN generation with payment integration.
 *
 * Payment model:
 *   School-paid: ₦500/student — school buys PINs in bulk
 *   Student-paid: ₦600/student base + optional school markup
 *     The school keeps anything above the ₦600 base.
 *
 * After a PIN is used to access results, the results become permanently accessible.
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

/**
 * Generate a random PIN code string (10 chars).
 */
function generatePinCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I,O,0,1 for clarity
    let code = '';
    for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * School buys PINs in bulk for students.
 * Cost: ₦500 per student.
 *
 * @param {string} schoolId
 * @param {string} term
 * @param {string} session
 * @param {number} count - number of PINs to generate
 * @param {string} paymentRef - Squad payment reference (already verified)
 */
async function generateSchoolPins(schoolId, term, session, count, paymentRef) {
    const db = new Databases(getClient());
    const now = new Date().toISOString();
    const pins = [];

    // Record the payment
    await db.createDocument(DATABASE_ID, COLLECTIONS.PAYMENTS.id, ID.unique(), {
        schoolId,
        reference: paymentRef,
        amount: count * 500,
        currency: 'NGN',
        type: 'pin_purchase',
        status: 'success',
        provider: 'squad',
        description: `Bulk PIN purchase: ${count} PINs at ₦500/each`,
        pinCount: count,
        createdAt: now,
    });

    for (let i = 0; i < count; i++) {
        const code = generatePinCode();
        try {
            const pin = await db.createDocument(DATABASE_ID, COLLECTIONS.PINS.id, ID.unique(), {
                schoolId,
                code,
                term,
                session,
                used: false,
                paidBy: 'school',
                price: 500,
                paymentRef,
                createdAt: now,
            });
            pins.push({ code: pin.code, id: pin.$id });
        } catch (e) {
            // Code collision — retry with new code
            const retryCode = generatePinCode();
            const pin = await db.createDocument(DATABASE_ID, COLLECTIONS.PINS.id, ID.unique(), {
                schoolId, code: retryCode, term, session,
                used: false, paidBy: 'school', price: 500, paymentRef, createdAt: now,
            });
            pins.push({ code: pin.code, id: pin.$id });
        }
    }

    return { success: true, data: { generated: pins.length, pins } };
}

/**
 * Student purchases a single PIN for themselves.
 * Cost: ₦600 base + school's customPinPrice markup.
 * The school keeps: (600 + markup) - 600 = markup
 */
async function purchaseStudentPin(schoolId, studentId, term, session, paymentRef) {
    const db = new Databases(getClient());

    // Get school's custom price
    const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, schoolId);
    const markup = school.customPinPrice || 0;
    const totalPrice = 600 + markup;

    const now = new Date().toISOString();

    // Record payment
    await db.createDocument(DATABASE_ID, COLLECTIONS.PAYMENTS.id, ID.unique(), {
        schoolId,
        reference: paymentRef,
        amount: totalPrice,
        currency: 'NGN',
        type: 'student_pin_purchase',
        status: 'success',
        provider: 'squad',
        description: `Student PIN purchase: ₦${totalPrice} (₦600 base + ₦${markup} markup)`,
        studentId,
        pinCount: 1,
        createdAt: now,
    });

    // Credit school balance with the markup
    if (markup > 0) {
        await db.updateDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, schoolId, {
            schoolBalance: (school.schoolBalance || 0) + markup,
        });
    }

    // Generate the PIN
    const code = generatePinCode();
    const pin = await db.createDocument(DATABASE_ID, COLLECTIONS.PINS.id, ID.unique(), {
        schoolId, code, studentId, term, session,
        used: false, paidBy: 'student', price: totalPrice, paymentRef, createdAt: now,
    });

    return { success: true, data: { code: pin.code, price: totalPrice } };
}

/**
 * Verify a PIN code and unlock results.
 * Once used, results are permanently accessible for that student/term/session.
 */
async function verifyPin(code, studentId) {
    const db = new Databases(getClient());

    const pins = await db.listDocuments(DATABASE_ID, COLLECTIONS.PINS.id, [
        Query.equal('code', code),
        Query.limit(1),
    ]);

    if (pins.total === 0) {
        return { success: false, error: 'Invalid PIN code.' };
    }

    const pin = pins.documents[0];

    if (pin.used) {
        // Check if already used by this student — allow re-access
        if (pin.studentId === studentId) {
            return { success: true, data: { alreadyUsed: true, term: pin.term, session: pin.session } };
        }
        return { success: false, error: 'This PIN has already been used by another student.' };
    }

    // Mark as used and assign to student
    await db.updateDocument(DATABASE_ID, COLLECTIONS.PINS.id, pin.$id, {
        used: true,
        studentId,
    });

    return {
        success: true,
        data: { term: pin.term, session: pin.session, justUnlocked: true },
    };
}

/**
 * Check if a student has already used a PIN for a given term/session.
 * If yes, they can view results without another PIN.
 */
async function checkStudentAccess(studentId, term, session) {
    const db = new Databases(getClient());

    const pins = await db.listDocuments(DATABASE_ID, COLLECTIONS.PINS.id, [
        Query.equal('studentId', studentId),
        Query.equal('term', term),
        Query.equal('session', session),
        Query.equal('used', true),
        Query.limit(1),
    ]);

    return { hasAccess: pins.total > 0 };
}

module.exports = {
    generatePinCode,
    generateSchoolPins,
    purchaseStudentPin,
    verifyPin,
    checkStudentAccess,
};
