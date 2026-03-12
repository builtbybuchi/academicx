/** Compute grade from a grading scheme */
export function computeGrade(score, gradingRanges) {
    if (!gradingRanges || !gradingRanges.length) return { grade: '-', remark: '' };
    for (const range of gradingRanges) {
        if (score >= range.min && score <= range.max) {
            return { grade: range.grade, remark: range.remark };
        }
    }
    return { grade: 'F', remark: 'Fail' };
}

/** Compute total score from CAT + Mock + Exam */
export function computeTotal(cat = 0, mock = 0, exam = 0) {
    return Number(cat) + Number(mock) + Number(exam);
}

/** Generate a unique PIN code (alphanumeric, uppercase) */
export function generatePIN(length = 10) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let pin = '';
    const arr = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(arr);
    } else {
        for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    for (let i = 0; i < length; i++) pin += chars[arr[i] % chars.length];
    return pin;
}

/** Format date to locale string */
export function formatDate(dateStr, options = {}) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric', ...options });
}

/** Format currency */
export function formatCurrency(amount, currency = 'NGN') {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
}

/** Generate a unique ID */
export function generateId(prefix = '') {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    return prefix ? `${prefix}_${ts}${rand}` : `${ts}${rand}`;
}

/** Validate email */
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Check if a PIN has expired */
export function isPINExpired(expiresAt) {
    return new Date(expiresAt) < new Date();
}

/** Debounce helper */
export function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/** Default grading scheme */
export const DEFAULT_GRADING = [
    { min: 70, max: 100, grade: 'A', remark: 'Excellent' },
    { min: 60, max: 69, grade: 'B', remark: 'Very Good' },
    { min: 50, max: 59, grade: 'C', remark: 'Good' },
    { min: 45, max: 49, grade: 'D', remark: 'Fair' },
    { min: 40, max: 44, grade: 'E', remark: 'Pass' },
    { min: 0, max: 39, grade: 'F', remark: 'Fail' },
];
