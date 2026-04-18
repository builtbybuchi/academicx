/** Re-export Appwrite helpers from monorepo shared layer */
export {
    login,
    getSchool,
    getSchoolByWebsiteSlug,
    listSchoolEvents,
    listSchoolNews,
    listSchoolGalleryImages,
    listSchoolTestimonials,
    listSchoolAccreditations,
    submitContactMessage,
    getSchoolMediaPreviewUrl,
    resolveStudentLogin,
    listAcademicSessions,
    getStudentResults,
    getStudentFeeStatus,
    initiateSchoolFeePayment,
    getSystemConfig,
} from 'shared/utils/api.js';
