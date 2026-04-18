/**
 * AcademicX - Squad Payment Integration (v2)
 * Real API calls to Squad (GTBank) payment gateway.
 */
require('dotenv').config();
const crypto = require('crypto');
const { Client, Databases, Query } = require('node-appwrite');
const { DATABASE_ID, COLLECTIONS } = require('./database-schema.js');

const SQUAD_BASE_URL = 'https://api.squadco.com';
const SQUAD_SANDBOX_URL = 'https://sandbox-api-d.squadco.com';

function getConfig() {
    return {
        secretKey: process.env.SQUAD_SECRET_KEY || '',
        publicKey: process.env.SQUAD_PUBLIC_KEY || '',
        useSandbox: process.env.SQUAD_USE_SANDBOX === 'true',
    };
}

function getBaseUrl() {
    return getConfig().useSandbox ? SQUAD_SANDBOX_URL : SQUAD_BASE_URL;
}

/**
 * Initialize a payment transaction via Squad.
 */
async function initiateTransaction({ email, amount, currency = 'NGN', callbackUrl, metadata = {} }) {
    const config = getConfig();
    const baseUrl = getBaseUrl();

    if (!config.secretKey) {
        return { success: false, error: 'Squad secret key is not configured on the backend.' };
    }
    if (!email) {
        return { success: false, error: 'Payment email is required.' };
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return { success: false, error: 'Payment amount must be greater than zero.' };
    }
    if (!callbackUrl || !/^https?:\/\//i.test(String(callbackUrl))) {
        return { success: false, error: 'A valid callback URL is required to initiate payment.' };
    }

    let response;
    let data = null;
    try {
        response = await fetch(`${baseUrl}/transaction/initiate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                amount: Number(amount) * 100, // Squad expects kobo
                currency,
                callback_url: callbackUrl,
                metadata,
                initiate_type: 'inline',
            }),
        });
        data = await response.json().catch(() => null);
    } catch (err) {
        return { success: false, error: err?.message || 'Could not reach Squad payment gateway.' };
    }

    if (!response.ok || !data.status) {
        const providerError = data?.message || data?.data?.message || `Squad payment initiation failed with status ${response.status}.`;
        return { success: false, error: providerError };
    }

    return {
        success: true,
        data: {
            transactionRef: data.data.transaction_ref,
            checkoutUrl: data.data.checkout_url,
            amount,
            currency,
        },
    };
}

/**
 * Verify a completed transaction.
 */
async function verifyTransaction(transactionRef) {
    const config = getConfig();
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/transaction/verify/${transactionRef}`, {
        headers: { 'Authorization': `Bearer ${config.secretKey}` },
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
        return { success: false, error: data.message || 'Verification failed' };
    }

    return {
        success: true,
        data: {
            status: data.data.transaction_status,
            reference: transactionRef,
            amount: data.data.transaction_amount / 100, // Convert back from kobo
            currency: data.data.transaction_currency_id,
            paidAt: data.data.transaction_date,
        },
    };
}

/**
 * Handle Squad webhook notification.
 */
function handleWebhook(payload, squadSignature, secretKey) {
    const sk = secretKey || getConfig().secretKey;
    const hash = crypto.createHmac('sha512', sk).update(JSON.stringify(payload)).digest('hex');
    const valid = hash.toUpperCase() === (squadSignature || '').toUpperCase();

    return {
        valid,
        event: payload?.Event || 'charge_successful',
        data: payload?.Body || {},
    };
}

/**
 * Initiate school PIN purchase.
 * @param {string} schoolId
 * @param {number} studentCount
 * @param {string} adminEmail
 * @param {string} callbackUrl
 */
async function initiateSchoolPinPurchase(schoolId, studentCount, adminEmail, callbackUrl) {
    const amount = studentCount * 500;

    const result = await initiateTransaction({
        email: adminEmail,
        amount,
        callbackUrl,
        metadata: {
            type: 'school_pin_purchase',
            schoolId,
            studentCount,
            pricePerStudent: 500,
        },
    });

    return result;
}

/**
 * Initiate student PIN purchase.
 * @param {string} schoolId
 * @param {string} studentId
 * @param {string} studentEmail
 * @param {string} callbackUrl
 */
async function initiateStudentPinPurchase(schoolId, studentId, studentEmail, callbackUrl) {
    const client = new Client();
    client.setEndpoint(process.env.APPWRITE_ENDPOINT).setProject(process.env.APPWRITE_PROJECT_ID).setKey(process.env.APPWRITE_API_KEY);
    const db = new Databases(client);

    // Get school's custom price
    const school = await db.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS.id, schoolId);
    const markup = school.customPinPrice || 0;
    const totalPrice = 600 + markup;

    const result = await initiateTransaction({
        email: studentEmail,
        amount: totalPrice,
        callbackUrl,
        metadata: {
            type: 'student_pin_purchase',
            schoolId,
            studentId,
            baseFee: 600,
            markup,
        },
    });

    return result;
}

/**
 * Squad inline checkout config for frontend use.
 */
function getSquadModalConfig(params) {
    const config = getConfig();
    return {
        onClose: () => console.log('Squad modal closed'),
        onLoad: () => console.log('Squad modal loaded'),
        onSuccess: params.onSuccess || (() => { }),
        key: config.publicKey,
        email: params.email,
        amount: params.amount * 100, // kobo
        currency_code: params.currency || 'NGN',
        customer_name: params.customerName || '',
        callback_url: params.callbackUrl || '',
        metadata: params.metadata || {},
    };
}

/**
 * Handle school fee payment webhook
 */
async function handleSchoolFeeWebhook(payload) {
    const { event, data } = payload;
    
    if (event === 'charge_successful' && data.metadata?.type === 'school_fee') {
        const { feeId, studentId, schoolId } = data.metadata;
        const { Client, Databases, Query } = require('node-appwrite');
        
        const client = new Client();
        client.setEndpoint(process.env.APPWRITE_ENDPOINT).setProject(process.env.APPWRITE_PROJECT_ID).setKey(process.env.APPWRITE_API_KEY);
        const db = new Databases(client);
        
        try {
            // Update fee record
            await db.updateDocument('academicx_db', 'school_fees', feeId, {
                status: 'paid',
                paidAt: new Date().toISOString(),
                paymentReference: data.transaction_ref
            });
            
            // Get student and school details for WhatsApp notification
            const student = await db.getDocument('academicx_db', 'students', studentId);
            const school = await db.getDocument('academicx_db', 'schools', schoolId);
            
            // Send WhatsApp confirmation
            if (student.parentPhone) {
                const reminderService = require('../whatsapp/reminder-service');
                await reminderService.handlePaymentSuccess({
                    feeId,
                    transactionRef: data.transaction_ref,
                    metadata: data.metadata
                });
            }
            
            return { success: true };
        } catch (error) {
            console.error('School fee webhook error:', error);
            return { success: false, error: error.message };
        }
    }
    
    return { success: true }; // Acknowledge other events
}

module.exports = {
    initiateTransaction,
    verifyTransaction,
    handleWebhook,
    handleSchoolFeeWebhook,
    initiateSchoolPinPurchase,
    initiateStudentPinPurchase,
    getSquadModalConfig,
};
