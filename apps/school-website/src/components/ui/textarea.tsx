import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
    <textarea
        className={cn(
            'flex min-h-[120px] w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-school-accent',
            className,
        )}
        ref={ref}
        {...props}
    />
));
Textarea.displayName = 'Textarea';

export { Textarea };
