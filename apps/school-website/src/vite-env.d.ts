/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APPWRITE_ENDPOINT?: string;
    readonly VITE_APPWRITE_PROJECT_ID?: string;
    readonly VITE_APPWRITE_FUNCTION_URL?: string;
    readonly VITE_DEV_SCHOOL_SLUG?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
