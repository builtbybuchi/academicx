import type { Models } from 'appwrite';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { galleryThumb } from '@/lib/media';

export function GalleryPage() {
    const { gallery } = useSchoolSite();

    return (
        <SchoolSubPage title="Visual Gallery" subtitle="A collection of moments that capture the spirit of our school.">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {gallery.map((g: Models.Document) => (
                    <figure key={g.$id} className="group relative aspect-square rounded-2xl overflow-hidden shadow-xl shadow-black/5 bg-slate-100">
                        <img 
                            src={galleryThumb(g as any)} 
                            alt={String((g as any).caption || '')} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        {(g as any).caption && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                <figcaption className="text-white text-sm font-medium translate-y-4 group-hover:translate-y-0 transition-transform">
                                    {String((g as any).caption)}
                                </figcaption>
                            </div>
                        )}
                    </figure>
                ))}
            </div>
            {gallery.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">The gallery is currently empty. Check back for photos of our campus life!</p>
                </div>
            ) : null}
        </SchoolSubPage>
    );
}
