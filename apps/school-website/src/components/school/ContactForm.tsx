import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitContactMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

export function ContactForm({ schoolId, className }: { schoolId: string; className?: string }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
    const [err, setErr] = useState('');

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');
        setErr('');
        try {
            await submitContactMessage({
                schoolId,
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                subject: subject.trim(),
                message: message.trim(),
            });
            setStatus('ok');
            setMessage('');
            setSubject('');
        } catch (er) {
            setStatus('err');
            setErr(er instanceof Error ? er.message : 'Could not send message.');
        }
    }

    return (
        <form onSubmit={onSubmit} className={cn('space-y-4', className)}>
            <div className="grid gap-4 sm:grid-cols-2">
                <Input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <Textarea required placeholder="Your message" value={message} onChange={(e) => setMessage(e.target.value)} />
            {err ? <p className="text-sm text-red-600">{err}</p> : null}
            {status === 'ok' ? <p className="text-sm text-green-700">Thank you — your message was sent.</p> : null}
            <Button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending…' : 'Send message'}
            </Button>
        </form>
    );
}
