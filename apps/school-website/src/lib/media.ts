import type { SchoolDataJson } from '@/types/school-data';
import { getSchoolMediaPreviewUrl } from '@/lib/api';

/** School.logo may be a storage file ID or an absolute URL. */
export function resolveSchoolLogoUrl(raw?: string | null): string {
    if (!raw) return '';
    const s = String(raw);
    if (s.startsWith('http')) return s;
    return getSchoolMediaPreviewUrl(s, 200, 200);
}

export function resolveHeroImage(data: SchoolDataJson): string {
    const h = data.hero;
    if (h.imageUrl?.startsWith('http')) return h.imageUrl;
    if (h.imageFileId) return getSchoolMediaPreviewUrl(h.imageFileId, 1920, 1080);
    return '';
}

export function resolveAboutImages(data: SchoolDataJson): string[] {
    const urls = [...(data.about.imageUrls || [])];
    const fromFiles = (data.about.imageFileIds || []).map((id) => getSchoolMediaPreviewUrl(id, 800, 600));
    return [...urls.filter((u) => u.startsWith('http')), ...fromFiles];
}

export function galleryThumb(doc: { imageUrl?: string; fileId?: string }): string {
    if (doc.imageUrl?.startsWith('http')) return doc.imageUrl;
    if (doc.fileId) return getSchoolMediaPreviewUrl(doc.fileId, 600, 450);
    return '';
}

export function eventImage(doc: { image?: string }): string {
    const i = doc.image;
    if (!i) return '';
    if (i.startsWith('http')) return i;
    return getSchoolMediaPreviewUrl(i, 800, 500);
}

export function newsImage(doc: { image?: string }): string {
    const i = doc.image;
    if (!i) return '';
    if (String(i).startsWith('http')) return String(i);
    return getSchoolMediaPreviewUrl(String(i), 600, 400);
}
