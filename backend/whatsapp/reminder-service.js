/**
 * AcademicX - WhatsApp Reminder Service
 * Handles bi-weekly reminders for unpaid school fees
 */

const { Client, Databases, Query, ID } = require('node-appwrite');
require('dotenv').config();

const DATABASE_ID = 'academicx_db';
const COLLECTIONS = {
    SCHOOLS: 'schools',
    STUDENTS: 'students',
    SCHOOL_FEES: 'school_fees',
    WHATSAPP_REMINDERS: 'whatsapp_reminders',
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

function nowIso() {
    return new Date().toISOString();
}

/**
 * Send WhatsApp message using your preferred WhatsApp API
 * This is a placeholder - integrate with your actual WhatsApp service
 */
async function sendWhatsAppMessage(phoneNumber, message) {
    try {
        // Replace with your actual WhatsApp API integration
        // Examples: Twilio WhatsApp, MessageBird, WhatsApp Business API, etc.
        
        console.log(`Sending WhatsApp to ${phoneNumber}: ${message}`);
        
        // Mock implementation for development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[MOCK] WhatsApp sent to ${phoneNumber}: ${message}`);
            return { success: true, messageId: 'mock_' + Date.now() };
        }
        
        // Actual implementation would go here
        // const response = await whatsappClient.messages.create({
        //     from: 'whatsapp:+14155238886',
        //     to: `whatsapp:${phoneNumber}`,
        //     body: message
        // });
        
        return { success: true, messageId: 'real_' + Date.now() };
    } catch (error) {
        console.error('WhatsApp send error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate fee reminder message
 */
function generateFeeReminderMessage(studentName, schoolName, term, session, amount, daysOverdue = 0) {
    const overdueText = daysOverdue > 0 
        ? `This payment is ${daysOverdue} days overdue.` 
        : 'Payment is due soon.';
    
    return `Dear Parent/Guardian,\n\n` +
        `This is a friendly reminder that the school fee for ${studentName} at ${schoolName} is still unpaid.\n\n` +
        `Term: ${term}\n` +
        `Session: ${session}\n` +
        `Amount: ₦${amount.toLocaleString()}\n` +
        `${overdueText}\n\n` +
        `Please make payment at your earliest convenience to avoid any disruption in your child's learning.\n\n` +
        `Thank you for your cooperation.\n\n` +
        `${schoolName}\n` +
        `AcademicX Fee Management System`;
}

/**
 * Generate payment confirmation message
 */
function generatePaymentConfirmationMessage(studentName, schoolName, term, session, amount, paymentDate) {
    return `Dear Parent/Guardian,\n\n` +
        `This is to confirm that we have received the school fee payment for ${studentName} at ${schoolName}.\n\n` +
        `Term: ${term}\n` +
        `Session: ${session}\n` +
        `Amount Paid: ₦${amount.toLocaleString()}\n` +
        `Payment Date: ${new Date(paymentDate).toLocaleDateString()}\n\n` +
        `Thank you for your prompt payment.\n\n` +
        `${schoolName}\n` +
        `AcademicX Fee Management System`;
}

/**
 * Create WhatsApp reminder record
 */
async function createReminderRecord(db, reminderData) {
    return await db.createDocument(DATABASE_ID, COLLECTIONS.WHATSAPP_REMINDERS.id, ID.unique(), {
        ...reminderData,
        status: 'pending',
        createdAt: nowIso(),
        nextRetryAt: nowIso(), // Send immediately
        retryCount: 0
    });
}

/**
 * Process pending WhatsApp reminders
 */
async function processPendingReminders() {
    const db = getDb();
    
    try {
        // Get pending reminders
        const pendingReminders = await db.listDocuments(DATABASE_ID, COLLECTIONS.WHATSAPP_REMINDERS.id, [
            Query.equal('status', 'pending'),
            Query.lessThanEqual('nextRetryAt', nowIso()),
            Query.limit(100)
        ]);

        console.log(`Processing ${pendingReminders.total} pending WhatsApp reminders`);

        for (const reminder of pendingReminders.documents) {
            try {
                // Send WhatsApp message
                const result = await sendWhatsAppMessage(reminder.parentPhone, reminder.message);
                
                if (result.success) {
                    // Mark as sent
                    await db.updateDocument(DATABASE_ID, COLLECTIONS.WHATSAPP_REMINDERS.id, reminder.$id, {
                        status: 'sent',
                        sentAt: nowIso()
                    });
                    
                    console.log(`WhatsApp reminder sent successfully to ${reminder.parentPhone}`);
                } else {
                    // Mark as failed and schedule retry
                    const retryCount = reminder.retryCount + 1;
                    const nextRetryAt = new Date(Date.now() + (retryCount * 60 * 60 * 1000)).toISOString(); // Retry in 1 hour * retry count
                    
                    await db.updateDocument(DATABASE_ID, COLLECTIONS.WHATSAPP_REMINDERS.id, reminder.$id, {
                        status: 'failed',
                        errorMessage: result.error,
                        retryCount,
                        nextRetryAt: retryCount >= 3 ? null : nextRetryAt // Stop retrying after 3 attempts
                    });
                    
                    console.error(`Failed to send WhatsApp to ${reminder.parentPhone}: ${result.error}`);
                }
            } catch (error) {
                console.error(`Error processing reminder ${reminder.$id}:`, error);
            }
        }
        
        return { success: true, processed: pendingReminders.total };
    } catch (error) {
        console.error('Error processing pending reminders:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate bi-weekly fee reminders for all schools
 */
async function generateBiWeeklyReminders() {
    const db = getDb();
    
    try {
        // Get all active schools
        const schools = await db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOLS.id, [
            Query.equal('status', 'active'),
            Query.limit(100)
        ]);

        console.log(`Generating reminders for ${schools.total} schools`);

        for (const school of schools.documents) {
            // Get current term and session
            const currentTerm = school.currentTerm || 'First Term';
            const currentSession = school.currentSession || '2024/2025';
            
            // Get unpaid fees for current term
            const unpaidFees = await db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, [
                Query.equal('schoolId', school.$id),
                Query.equal('term', currentTerm),
                Query.equal('session', currentSession),
                Query.equal('status', 'pending'),
                Query.limit(1000)
            ]);

            // Get student details
            const studentIds = unpaidFees.documents.map(fee => fee.studentId);
            const students = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, [
                Query.equal('schoolId', school.$id),
                Query.limit(1000)
            ]);

            const studentMap = students.documents.reduce((acc, student) => {
                acc[student.$id] = student;
                return acc;
            }, {});

            // Create reminders for each unpaid fee
            for (const fee of unpaidFees.documents) {
                const student = studentMap[fee.studentId];
                if (!student || !student.parentPhone) continue;

                // Check if reminder was sent in the last 14 days
                const recentReminders = await db.listDocuments(DATABASE_ID, COLLECTIONS.WHATSAPP_REMINDERS.id, [
                    Query.equal('studentId', fee.studentId),
                    Query.equal('term', currentTerm),
                    Query.equal('session', currentSession),
                    Query.equal('messageType', 'fee_reminder'),
                    Query.greaterThan('createdAt', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()),
                    Query.limit(1)
                ]);

                if (recentReminders.total > 0) {
                    continue; // Skip if reminder was sent recently
                }

                const message = generateFeeReminderMessage(
                    `${student.firstName} ${student.lastName}`,
                    school.name,
                    currentTerm,
                    currentSession,
                    fee.amount
                );

                await createReminderRecord(db, {
                    schoolId: school.$id,
                    studentId: fee.studentId,
                    parentPhone: student.parentPhone,
                    messageType: 'fee_reminder',
                    message,
                    term: currentTerm,
                    session: currentSession
                });
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error generating bi-weekly reminders:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Handle webhook for successful payments
 */
async function handlePaymentSuccess(paymentData) {
    const db = getDb();
    
    try {
        const { feeId, transactionRef } = paymentData.metadata || {};
        
        if (!feeId) {
            console.log('No fee ID in payment metadata');
            return { success: false, error: 'No fee ID found' };
        }

        // Update fee record
        await db.updateDocument(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, feeId, {
            status: 'paid',
            paidAt: nowIso(),
            paymentReference: transactionRef
        });

        // Get fee and student details
        const fee = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOL_FEES.id, feeId);
        const student = await db.getDocument(DATABASE_ID, COLLECTIONS.STUDENTS.id, fee.studentId);
        const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, fee.schoolId);

        if (student.parentPhone) {
            // Send payment confirmation
            const message = generatePaymentConfirmationMessage(
                `${student.firstName} ${student.lastName}`,
                school.name,
                fee.term,
                fee.session,
                fee.amount,
                nowIso()
            );

            await createReminderRecord(db, {
                schoolId: school.$id,
                studentId: fee.studentId,
                parentPhone: student.parentPhone,
                messageType: 'payment_confirmation',
                message,
                term: fee.term,
                session: fee.session
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error handling payment success:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    processPendingReminders,
    generateBiWeeklyReminders,
    handlePaymentSuccess,
    sendWhatsAppMessage
};
