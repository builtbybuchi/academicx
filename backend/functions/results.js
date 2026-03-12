/**
 * AcademicX - Results Functions
 * Auto-grade computation, approval workflow, broadsheet generation, publishing.
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
 * Submit or update a result for a student on a subject.
 * Auto-computes totalScore and grade using the school's grading scheme.
 */
async function submitResult({ schoolId, studentId, subjectId, className, term, session, catScore, examScore, submittedBy }) {
    const db = new Databases(getClient());

    // 1. Get grading scheme for this school
    const schemes = await db.listDocuments(DATABASE_ID, COLLECTIONS.GRADING_SCHEMES.id, [
        Query.equal('schoolId', schoolId), Query.limit(1),
    ]);

    let gradingScheme = null;
    let catWeight = 30;
    let examWeight = 70;

    if (schemes.total > 0) {
        gradingScheme = schemes.documents[0];
        catWeight = gradingScheme.catWeight || 30;
        examWeight = gradingScheme.examWeight || 70;
    }

    // 2. Compute total score
    const weightedCat = (catScore || 0) * (catWeight / 100);
    const weightedExam = (examScore || 0) * (examWeight / 100);
    const totalScore = Math.round((weightedCat + weightedExam) * 100) / 100;

    // 3. Determine grade
    let grade = '-';
    let remark = '';
    if (gradingScheme && gradingScheme.ranges) {
        try {
            const ranges = JSON.parse(gradingScheme.ranges);
            for (const r of ranges) {
                if (totalScore >= r.min && totalScore <= r.max) {
                    grade = r.grade;
                    remark = r.remark || '';
                    break;
                }
            }
        } catch { /* invalid JSON, use defaults */ }
    }

    // 4. Check if result already exists (upsert)
    const existing = await db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, [
        Query.equal('studentId', studentId),
        Query.equal('subjectId', subjectId),
        Query.equal('term', term),
        Query.equal('session', session),
        Query.limit(1),
    ]);

    let resultDoc;
    if (existing.total > 0) {
        resultDoc = await db.updateDocument(DATABASE_ID, COLLECTIONS.RESULTS.id, existing.documents[0].$id, {
            catScore, examScore, totalScore, grade, remark,
            status: 'submitted', submittedBy,
        });
    } else {
        resultDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.RESULTS.id, ID.unique(), {
            schoolId, studentId, subjectId, className, term, session,
            catScore, examScore, totalScore, grade, remark,
            status: 'submitted', submittedBy,
        });
    }

    return { success: true, data: resultDoc };
}

/**
 * Approve results for a class/term/session (admin action).
 */
async function approveResults(schoolId, className, term, session) {
    const db = new Databases(getClient());

    const results = await db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, [
        Query.equal('schoolId', schoolId),
        Query.equal('className', className),
        Query.equal('term', term),
        Query.equal('session', session),
        Query.equal('status', 'submitted'),
        Query.limit(500),
    ]);

    let approved = 0;
    for (const doc of results.documents) {
        await db.updateDocument(DATABASE_ID, COLLECTIONS.RESULTS.id, doc.$id, { status: 'approved' });
        approved++;
    }

    return { success: true, data: { approved } };
}

/**
 * Generate broadsheet data for a class.
 * Returns an array of student rows with all subject scores.
 */
async function generateBroadsheet(schoolId, className, term, session) {
    const db = new Databases(getClient());

    // Get students in this class
    const students = await db.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS.id, [
        Query.equal('schoolId', schoolId),
        Query.equal('className', className),
        Query.equal('status', 'active'),
        Query.limit(100),
    ]);

    // Get subjects for this class
    const subjects = await db.listDocuments(DATABASE_ID, COLLECTIONS.SUBJECTS.id, [
        Query.equal('schoolId', schoolId),
        Query.equal('className', className),
        Query.limit(50),
    ]);

    // Get all approved results for this class/term
    const results = await db.listDocuments(DATABASE_ID, COLLECTIONS.RESULTS.id, [
        Query.equal('schoolId', schoolId),
        Query.equal('className', className),
        Query.equal('term', term),
        Query.equal('session', session),
        Query.equal('status', 'approved'),
        Query.limit(5000),
    ]);

    // Build mapping: studentId -> { subjectId -> result }
    const resultMap = {};
    for (const r of results.documents) {
        if (!resultMap[r.studentId]) resultMap[r.studentId] = {};
        resultMap[r.studentId][r.subjectId] = r;
    }

    // Build broadsheet rows
    const rows = students.documents.map(student => {
        const subjectScores = subjects.documents.map(sub => {
            const r = resultMap[student.$id]?.[sub.$id];
            return {
                subjectId: sub.$id,
                subjectName: sub.name,
                catScore: r?.catScore || 0,
                examScore: r?.examScore || 0,
                totalScore: r?.totalScore || 0,
                grade: r?.grade || '-',
            };
        });

        const totalAll = subjectScores.reduce((sum, s) => sum + s.totalScore, 0);
        const average = subjectScores.length > 0 ? Math.round((totalAll / subjectScores.length) * 100) / 100 : 0;

        return {
            studentId: student.$id,
            admissionNumber: student.admissionNumber,
            firstName: student.firstName,
            lastName: student.lastName,
            subjects: subjectScores,
            totalScore: totalAll,
            average,
        };
    });

    // Sort by average descending to determine position
    rows.sort((a, b) => b.average - a.average);
    rows.forEach((row, idx) => { row.position = idx + 1; });

    return {
        success: true,
        data: {
            className,
            term,
            session,
            subjects: subjects.documents.map(s => ({ id: s.$id, name: s.name, code: s.code })),
            students: rows,
        },
    };
}

module.exports = {
    submitResult,
    approveResults,
    generateBroadsheet,
};
