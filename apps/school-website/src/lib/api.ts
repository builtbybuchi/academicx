/** Re-export Appwrite helpers from monorepo shared layer */
export {
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
    getSystemConfig,
} from 'shared/utils/api.js';
