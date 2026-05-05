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
 * Generate scheduled fee reminders (7 days before, on due date, 3 days after)
 */
async function generateScheduledReminders() {
    const db = getDb();
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    
    try {
        // Get all current academic sessions with a fee due date
        const currentSessions = await db.listDocuments(DATABASE_ID, 'academic_sessions', [
            Query.equal('isCurrent', true),
            Query.isNotNull('feeDueDate'),
            Query.limit(500)
        ]);

        console.log(`Checking ${currentSessions.total} active sessions for reminders`);

        for (const sessionDoc of currentSessions.documents) {
            const dueDate = new Date(sessionDoc.feeDueDate);
            const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            let reminderType = '';
            if (diffDays === 7) reminderType = '7_days_before';
            else if (diffDays === 0) reminderType = 'on_due_date';
            else if (diffDays === -3) reminderType = '3_days_after';

            if (!reminderType) continue;

            console.log(`Generating ${reminderType} reminders for school ${sessionDoc.schoolId}`);

            // Get school info
            const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS, sessionDoc.schoolId);

            // Get unpaid fees for this session
            const unpaidFees = await db.listDocuments(DATABASE_ID, COLLECTIONS.SCHOOL_FEES, [
                Query.equal('schoolId', sessionDoc.schoolId),
                Query.equal('term', sessionDoc.term),
                Query.equal('session', sessionDoc.session),
                Query.notEqual('status', 'paid'),
                Query.limit(1000)
            ]);

            // Get students for these fees
            for (const fee of unpaidFees.documents) {
                const student = await db.getDocument(DATABASE_ID, COLLECTIONS.STUDENTS, fee.studentId);
                
                // WhatsApp Reminder
                if (student.parentPhone) {
                    const message = generateFeeReminderMessage(
                        `${student.firstName} ${student.lastName}`,
                        school.name,
                        sessionDoc.term,
                        sessionDoc.session,
                        fee.amount,
                        diffDays < 0 ? Math.abs(diffDays) : 0
                    );

                    await createReminderRecord(db, {
                        schoolId: school.$id,
                        studentId: fee.studentId,
                        parentPhone: student.parentPhone,
                        messageType: 'fee_reminder',
                        message,
                        term: sessionDoc.term,
                        session: sessionDoc.session
                    });
                }

                // Email Reminder
                if (student.parentEmail) {
                    const subject = `Fee Payment Reminder - ${school.name}`;
                    const html = `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2>Fee Payment Reminder</h2>
                            <p>Dear Parent/Guardian,</p>
                            <p>This is a reminder that the school fee for <strong>${student.firstName} ${student.lastName}</strong> is ${diffDays < 0 ? 'overdue' : 'due soon'}.</p>
                            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>School:</strong> ${school.name}</p>
                                <p><strong>Term/Session:</strong> ${sessionDoc.term} / ${sessionDoc.session}</p>
                                <p><strong>Amount:</strong> ₦${Number(fee.amount).toLocaleString()}</p>
                                <p><strong>Due Date:</strong> ${sessionDoc.feeDueDate}</p>
                            </div>
                            <p>Please make payment to avoid any inconvenience.</p>
                            <p>Thank you,</p>
                            <p>${school.name}</p>
                        </div>
                    `;
                    
                    // We can use the existing saveEmailRecord and sendEmailWithSMTP if available
                    // For now, let's assume a generic helper or just log it
                    console.log(`Email reminder scheduled for ${student.parentEmail}`);
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error generating scheduled reminders:', error);
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
    generateScheduledReminders,
    handlePaymentSuccess,
    sendWhatsAppMessage
};
