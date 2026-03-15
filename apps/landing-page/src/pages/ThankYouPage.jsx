import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Download,
    ExternalLink,
    Play,
    ShieldAlert,
    Sparkles,
} from 'lucide-react';
import './download-experience.css';

export default function ThankYouPage() {
    const [downloadContext, setDownloadContext] = useState(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('downloadContext');
        if (!raw) {
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            setDownloadContext(parsed);
        } catch {
            setDownloadContext(null);
        }
    }, []);

    useEffect(() => {
        if (!downloadContext?.url) {
            return;
        }
        const timer = window.setTimeout(() => {
            window.open(downloadContext.url, '_blank', 'noopener,noreferrer');
        }, 700);
        return () => window.clearTimeout(timer);
    }, [downloadContext]);

    const manualUrl = useMemo(() => {
        if (!downloadContext?.url) {
            return '/downloads';
        }
        return downloadContext.url;
    }, [downloadContext]);

    const downloadedFile = downloadContext
        ? `${downloadContext.platformLabel || 'Installer'} ${downloadContext.format || ''}`.trim()
        : 'Installer package';

    return (
        <div className="download-shell" style={{ paddingTop: 80 }}>
            <section className="download-wrap thanks-header">
                <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--color-gray-900)' }}>Thanks for downloading! </h1> 

                <p>
                    Your download will begin automatically. If it didn&apos;t start,
                    {' '}
                    <a href={manualUrl} target="_blank" rel="noreferrer">click here to download manually</a>.
                </p>
            </section>

            <section className="download-wrap">
                <div className="warning-banner" role="status" aria-live="polite"style={{backgroundColor: 'hsla(225, 71%, 45%, 0.18)' }}>
                    <p style={{ color: 'var(--color-primary-light)' }}>
                        <strong>Note:</strong>
                        {' '}
                        Depending on your system settings, you might see an "Unrecognized app" or "Unsafe" warning.
                        {' '}
                        <Link to="/downloads/installation-guide" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                            Learn how to easily resolve this issue &amp; install safely <ArrowRight size={14} style={{ verticalAlign: 'text-top' }} />
                        </Link>
                    </p>
                </div>

                <div className="steps-grid" aria-label="Installation steps">
                    <article className="step-card" style={{ background: 'linear-gradient(180deg, #ffffff, #f8fbff)' }}>
                        <div className="step-art tint-open" aria-hidden="true"><Download size={24} color="var(--color-primary)" /></div>
                        <h3>Step 1: Open</h3>
                        <p>
                            Locate the downloaded file ({downloadedFile}) in your browser&apos;s download bar or Downloads folder, then open it.
                        </p>
                    </article>

                    <article className="step-card" style={{ background: 'linear-gradient(180deg, #ffffff, #fffaf0)' }}>
                        <div className="step-art tint-allow" aria-hidden="true"><ShieldAlert size={24} color="var(--color-primary)" /></div>
                        <h3>Step 2: Allow</h3>
                        <p>
                            If blocked from installing on Android or prompted by Windows SmartScreen or macOS Gatekeeper, click "More info" and then "Run anyway" or "Open anyway" to continue.
                        </p>
                    </article>

                    <article className="step-card" style={{ background: 'linear-gradient(180deg, #ffffff, #f0fdf9)' }}>
                        <div className="step-art tint-install" aria-hidden="true"><Play size={24} color="var(--color-primary)" /></div>
                        <h3>Step 3: Install</h3>
                        <p>
                            Wait for installation to complete, launch the app, and sign in with your school account.
                            {' '}
                            <Link to="/downloads/installation-guide">Need more help?</Link>
                        </p>
                    </article>
                </div>

                <div className="thanks-cta">
                    <Link className="btn-link" to="/downloads/installation-guide">Open Troubleshooting Guide</Link>
                    <Link className="btn-link" to="/downloads">Back to Downloads</Link>
                </div>
            </section>
        </div>
    );
}
