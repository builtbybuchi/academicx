/**
 * AcademicX - Notifications / Email Functions
 * Sends emails via Alibaba Cloud DirectMail SMTP (nodemailer).
 */
require('dotenv').config();
const nodemailer = require('nodemailer');
const { Client, Databases, Query } = require('node-appwrite');
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
 * Create the SMTP transporter for Alibaba Cloud DirectMail.
 */
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtpdm.aliyun.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: true,
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
        },
    });
}

/**
 * Send a single email.
 */
async function sendEmail({ to, subject, html, text }) {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'AcademicX <noreply@academicx.com>',
        to,
        subject,
        html: html || undefined,
        text: text || undefined,
    });

    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
}

/**
 * Send bulk emails to parents of students in a specific class.
 * Parent emails are loaded from the student profiles.
 *
 * @param {string} schoolId
 * @param {string} className - e.g. "JSS1" or "all" for entire school
 * @param {string} subject - email subject
 * @param {string} messageHtml - HTML body
 */
async function sendBulkEmailToParents(schoolId, className, subject, messageHtml) {
    const db = new Databases(getClient());

    // Build query
    const queries = [
        Query.equal('schoolId', schoolId),
        Query.equal('status', 'active'),
        Query.limit(500),
    ];
    if (className && className !== 'all') {
        queries.push(Query.equal('className', className));
    }

    const students = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, queries);

    // Filter students who have parent emails
    const recipientEmails = students.documents
        .filter(s => s.parentEmail && s.parentEmail.trim() !== '')
        .map(s => ({ email: s.parentEmail, studentName: `${s.firstName} ${s.lastName}`, className: s.className }));

    if (recipientEmails.length === 0) {
        return { success: false, error: 'No parent emails found for the selected class.' };
    }

    const results = [];
    const transporter = createTransporter();

    for (const recipient of recipientEmails) {
        try {
            // Personalize the email with student name
            const personalizedHtml = messageHtml
                .replace('{{studentName}}', recipient.studentName)
                .replace('{{className}}', recipient.className);

            await transporter.sendMail({
                from: process.env.SMTP_FROM || 'AcademicX <noreply@academicx.com>',
                to: recipient.email,
                subject,
                html: personalizedHtml,
            });

            results.push({ email: recipient.email, status: 'sent' });
        } catch (e) {
            results.push({ email: recipient.email, status: 'failed', error: e.message });
        }
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return {
        success: true,
        data: {
            totalRecipients: recipientEmails.length,
            sent,
            failed,
            details: results,
        },
    };
}

/**
 * Send announcement to all parents in a school.
 */
async function sendSchoolAnnouncement(schoolId, subject, messageHtml) {
    return sendBulkEmailToParents(schoolId, 'all', subject, messageHtml);
}

module.exports = {
    sendEmail,
    sendBulkEmailToParents,
    sendSchoolAnnouncement,
};
