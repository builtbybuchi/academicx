/**
 * AcademicX - Sample Data
 * Use this data for development and testing.
 */

export const sampleSchools = [
    { id: 'sc1', name: 'Greenfield Academy', address: '15 Victoria Island, Lagos', email: 'info@greenfield.edu.ng', phone: '+2348012345678', status: 'active', subscriptionPlan: 'enterprise' },
    { id: 'sc2', name: 'Royal Hills College', address: '23 Wuse Zone 5, Abuja', email: 'admin@royalhills.edu.ng', phone: '+2349087654321', status: 'active', subscriptionPlan: 'professional' },
];

export const sampleStaff = [
    { id: 'st1', schoolId: 'sc1', staffId: 'STF/001', firstName: 'Ngozi', lastName: 'Okonkwo', department: 'English', assignedClasses: ['JSS1A', 'JSS1B'], status: 'active' },
    { id: 'st2', schoolId: 'sc1', staffId: 'STF/002', firstName: 'Ahmed', lastName: 'Bello', department: 'Mathematics', assignedClasses: ['JSS1A', 'SS1A', 'SS2B'], status: 'active' },
    { id: 'st3', schoolId: 'sc1', staffId: 'STF/003', firstName: 'Grace', lastName: 'Eze', department: 'Sciences', assignedClasses: ['SS1A', 'SS2A'], status: 'active' },
];

export const sampleStudents = [
    { id: 's1', schoolId: 'sc1', admissionNumber: 'ADM/2025/001', firstName: 'Adebayo', lastName: 'Oluwaseun', className: 'JSS1', section: 'A', status: 'active' },
    { id: 's2', schoolId: 'sc1', admissionNumber: 'ADM/2025/002', firstName: 'Chidinma', lastName: 'Okafor', className: 'JSS1', section: 'B', status: 'active' },
    { id: 's3', schoolId: 'sc1', admissionNumber: 'ADM/2025/003', firstName: 'Musa', lastName: 'Ibrahim', className: 'SS1', section: 'A', status: 'active' },
    { id: 's4', schoolId: 'sc1', admissionNumber: 'ADM/2024/045', firstName: 'Fatima', lastName: 'Abubakar', className: 'SS2', section: 'A', status: 'active' },
    { id: 's5', schoolId: 'sc1', admissionNumber: 'ADM/2024/046', firstName: 'Oluwole', lastName: 'Adeyemi', className: 'SS3', section: 'B', status: 'active' },
];

export const sampleSubjects = [
    { id: 'sb1', schoolId: 'sc1', name: 'Mathematics', code: 'MTH', className: 'SS1', staffId: 'st2' },
    { id: 'sb2', schoolId: 'sc1', name: 'English Language', code: 'ENG', className: 'SS1', staffId: 'st1' },
    { id: 'sb3', schoolId: 'sc1', name: 'Physics', code: 'PHY', className: 'SS2', staffId: 'st3' },
    { id: 'sb4', schoolId: 'sc1', name: 'Biology', code: 'BIO', className: 'SS2', staffId: 'st3' },
    { id: 'sb5', schoolId: 'sc1', name: 'Chemistry', code: 'CHM', className: 'SS1', staffId: 'st3' },
];

export const sampleResults = [
    { id: 'r1', schoolId: 'sc1', studentId: 's1', subjectId: 'sb1', term: 'First Term', session: '2025/2026', catScore: 18, mockScore: 16, examScore: 52, totalScore: 86, grade: 'A', remark: 'Excellent', status: 'approved' },
    { id: 'r2', schoolId: 'sc1', studentId: 's2', subjectId: 'sb2', term: 'First Term', session: '2025/2026', catScore: 15, mockScore: 14, examScore: 45, totalScore: 74, grade: 'A', remark: 'Excellent', status: 'pending' },
    { id: 'r3', schoolId: 'sc1', studentId: 's3', subjectId: 'sb3', term: 'First Term', session: '2025/2026', catScore: 12, mockScore: 10, examScore: 38, totalScore: 60, grade: 'B', remark: 'Very Good', status: 'pending' },
];

export const samplePins = [
    { id: 'p1', schoolId: 'sc1', code: 'AX7K9M2NP4', studentId: 's1', term: 'First Term', session: '2025/2026', used: false, expiresAt: '2026-04-30T00:00:00Z' },
    { id: 'p2', schoolId: 'sc1', code: 'BQ3W8R5TY6', studentId: 's2', term: 'First Term', session: '2025/2026', used: true, expiresAt: '2026-04-30T00:00:00Z' },
];
