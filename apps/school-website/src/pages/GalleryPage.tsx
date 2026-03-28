import type { Models } from 'appwrite';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { galleryThumb } from '@/lib/media';

export function GalleryPage() {
    const { gallery } = useSchoolSite();

    return (
        <SchoolSubPage title="Gallery">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {gallery.map((g: Models.Document) => (
                    <figure key={g.$id} className="overflow-hidden rounded-xl">
                        <img src={galleryThumb(g)} alt={String(g.caption || '')} className="aspect-square w-full object-cover" />
                        {g.caption ? <figcaption className="mt-2 text-center text-sm text-school-text/70">{String(g.caption)}</figcaption> : null}
                    </figure>
                ))}
            </div>
            {gallery.length === 0 ? <p className="text-school-text/70">No gallery images yet.</p> : null}
        </SchoolSubPage>
    );
}
