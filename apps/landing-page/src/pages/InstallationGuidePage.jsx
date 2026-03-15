import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Monitor, Apple, Smartphone, AlertCircle, Info, Settings, Mail, Phone } from 'lucide-react';

export default function InstallationGuidePage() {
    const [expandedPlatform, setExpandedPlatform] = useState(null);

    const togglePlatform = (platform) => {
        setExpandedPlatform(expandedPlatform === platform ? null : platform);
    };

    const PlatformSection = ({ platform, icon: Icon, title, steps, warnings }) => (
        <div style={{
            marginBottom: 24,
            border: '1px solid var(--color-gray-200)',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#fff'
        }}>
            <button
                onClick={() => togglePlatform(platform)}
                style={{
                    width: '100%',
                    padding: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    background: expandedPlatform === platform ? 'var(--color-primary-50)' : '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 18,
                    fontWeight: 700,
                    transition: 'all 0.3s ease'
                }}
            >
                <Icon size={32} color="var(--color-primary)" />
                <span style={{ flex: 1, textAlign: 'left', color: 'var(--color-gray-900)' }}>{title}</span>
                {expandedPlatform === platform ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>

            {expandedPlatform === platform && (
                <div style={{ padding: '24px', borderTop: '1px solid var(--color-gray-100)' }}>
                    {/* Warnings */}
                    {warnings && (
                        <div style={{
                            padding: 16,
                            background: '#FEF3C7',
                            border: '1px solid #FCD34D',
                            borderRadius: 8,
                            marginBottom: 24
                        }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <AlertCircle size={14} />
                                Important Notes:
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
                                {warnings.map((w, i) => (
                                    <li key={i} style={{ fontSize: 14, color: '#92400E', marginBottom: 4 }}>{w}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Steps */}
                    <div>
                        {steps.map((step, i) => (
                            <div key={i} style={{ marginBottom: 24 }}>
                                <div style={{
                                    display: 'flex',
                                    gap: 16,
                                    alignItems: 'flex-start'
                                }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        background: 'var(--color-primary)',
                                        color: '#fff',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        flexShrink: 0
                                    }}>
                                        {i + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 8 }}>
                                            {step.title}
                                        </h4>
                                        <p style={{ fontSize: 15, color: 'var(--color-gray-700)', marginBottom: 12, lineHeight: 1.6 }}>
                                            {step.description}
                                        </p>
                                        {step.code && (
                                            <div style={{
                                                background: '#1F2937',
                                                color: '#E5E7EB',
                                                padding: 12,
                                                borderRadius: 8,
                                                fontSize: 13,
                                                fontFamily: 'monospace',
                                                marginBottom: 12,
                                                overflow: 'auto'
                                            }}>
                                                {step.code}
                                            </div>
                                        )}
                                        {step.substeps && (
                                            <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
                                                {step.substeps.map((sub, j) => (
                                                    <li key={j} style={{ fontSize: 14, color: 'var(--color-gray-600)', marginBottom: 6 }}>
                                                        {sub}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const windowsSteps = [
        {
            title: 'Download the installer',
            description: 'Go to the Downloads page and select your role and school, then download the Windows version.'
        },
        {
            title: 'Locate the installer',
            description: 'Find the downloaded .exe file in your Downloads folder. It should be named something like "academicx-admin-setup.exe".'
        },
        {
            title: 'Disable Windows Defender warning',
            description: 'When you double-click the installer, Windows Defender SmartScreen may appear with a warning.',
            substeps: [
                'Click "More info" in the warning dialog',
                'Click "Run anyway" button',
                'Wait for the installation process to complete'
            ]
        },
        {
            title: 'Complete the installation',
            description: 'Follow the installation wizard steps and choose your installation location.',
            substeps: [
                'Accept the license agreement',
                'Choose installation folder (default is fine)',
                'Click "Install" to proceed',
                'Wait for the installation to complete'
            ]
        },
        {
            title: 'Launch the application',
            description: 'Once installed, click "Finish" to launch academicX automatically, or find it in your Start Menu.',
            substeps: [
                'The app may take a moment to launch on first run',
                'Log in with your school credentials',
                'You\'re ready to go!'
            ]
        }
    ];

    const macosSteps = [
        {
            title: 'Download the installer',
            description: 'Go to the Downloads page and select your role and school, then download the macOS version.'
        },
        {
            title: 'Locate the downloaded file',
            description: 'Find the downloaded .dmg file in your Downloads folder and double-click it to open it.'
        },
        {
            title: 'Handle macOS security warning',
            description: 'macOS may prevent opening the app with a security warning because it\'s not yet notarized.',
            substeps: [
                'Click "Cancel" on the initial warning',
                'Open System Preferences or System Settings (depending on your macOS version)',
                'Go to Security & Privacy (or just "Security" in newer versions)',
                'Click the lock icon to make changes if needed',
                'Find "academicX" in the list and click "Open Anyway"'
            ]
        },
        {
            title: 'Confirm and trust',
            description: 'After clicking "Open Anyway", you may see another prompt. Click "Open" to confirm.',
            substeps: [
                'The app will now launch',
                'academicX will be added to your trusted applications'
            ]
        },
        {
            title: 'Log in and start using',
            description: 'Once the app opens, log in with your school credentials and start managing your school operations.',
            substeps: [
                'For future launches, the app will open normally without warnings',
                'You can also move the app to your Applications folder for easier access'
            ]
        }
    ];

    const androidSteps = [
        {
            title: 'Download the APK',
            description: 'Go to the Downloads page and select your role and school, then download the Android version.'
        },
        {
            title: 'Enable installation from unknown sources',
            description: 'Since the app is not on Google Play Store, you need to allow your phone to install from unknown sources.',
            substeps: [
                'Go to Settings → Apps & notifications (or Security on older Android)',
                'Look for "Install unknown apps" or "Unknown sources"',
                'Enable it for your browser or file manager app',
                'This setting may vary depending on your Android version and device'
            ]
        },
        {
            title: 'Handle Google Play Protect warning',
            description: 'Google Play Protect may warn that the app is unrecognized. This is normal.',
            substeps: [
                'When the warning appears, tap "Install anyway"',
                'If you don\'t see this option, you can:',
                'Temporarily turn off Google Play Protect (Settings → Google → Manage account → Security)',
                'Install the app',
                'Re-enable Google Play Protect after installation'
            ]
        },
        {
            title: 'Complete installation',
            description: 'Wait for the installation to complete. This may take a minute or two.',
            substeps: [
                'Once installed, tap "Open" to launch the app',
                'Log in with your school credentials',
                'Grant any necessary permissions (camera, contacts, etc.) when prompted'
            ]
        },
        {
            title: 'Start using academicX',
            description: 'You\'re all set! academicX is now installed and ready to use on your Android device.',
            substeps: [
                'The app will be in your app drawer',
                'You can create a home screen shortcut by long-pressing the app icon',
                'Future updates will notify you when available'
            ]
        }
    ];

    return (
        <div style={{ minHeight: '100vh', paddingTop: 80, background: '#FFFFFF', padding: '40px' }}>
            {/* Header */}
            <section style={{
                maxWidth: 900,
                margin: '0 auto 40px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: 48,
                    fontWeight: 900,
                    marginBottom: 16,
                    color: 'var(--color-gray-900)',
                    letterSpacing: '-0.02em'
                }}>
                    Installation Guide
                </h1>
                <p style={{
                    fontSize: 18,
                    color: 'var(--color-gray-600)',
                    marginBottom: 24
                }}>
                    Step-by-step instructions for installing academicX on your device. Select your platform below to get started.
                </p>
            </section>

            {/* Platform selection */}
            <section style={{ maxWidth: 900, margin: '0 auto' }}>
                <PlatformSection
                    platform="windows"
                    icon={Monitor}
                    title="Windows Installation"
                    warnings={[
                        'The .exe file may be flagged as an unrecognized application',
                        'This is normal for unsigned applications',
                        'Click "More info" then "Run anyway" to proceed'
                    ]}
                    steps={windowsSteps}
                />

                <PlatformSection
                    platform="macos"
                    icon={Apple}
                    title="macOS Installation"
                    warnings={[
                        'macOS may prevent opening the app with a security warning',
                        'You\'ll need to explicitly allow it through System Preferences',
                        'This is a one-time process; future launches will be normal'
                    ]}
                    steps={macosSteps}
                />

                <PlatformSection
                    platform="android"
                    icon={Smartphone}
                    title="Android Installation"
                    warnings={[
                        'Google Play Protect may warn that the app is unrecognized',
                        'You need to enable "Install from unknown sources" first',
                        'Both warnings are expected and normal for unsigned apps'
                    ]}
                    steps={androidSteps}
                />
            </section>

            {/* Troubleshooting */}
            <section style={{
                maxWidth: 900,
                margin: '60px auto',
                padding: 32,
                background: 'var(--color-gray-50)',
                borderRadius: 16
            }}>
                <h2 style={{
                    fontSize: 28,
                    fontWeight: 700,
                    marginBottom: 24,
                    color: 'var(--color-gray-900)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <Settings size={24} />
                    Troubleshooting
                </h2>

                <div style={{ display: 'grid', gap: 24 }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 8 }}>
                            The app crashes on startup
                        </h3>
                        <p style={{ color: 'var(--color-gray-700)', marginBottom: 8 }}>
                            Try these steps:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
                            <li style={{ color: 'var(--color-gray-600)', marginBottom: 4 }}>Uninstall the app completely</li>
                            <li style={{ color: 'var(--color-gray-600)', marginBottom: 4 }}>Restart your device</li>
                            <li style={{ color: 'var(--color-gray-600)' }}>Download and reinstall the latest version</li>
                        </ul>
                    </div>

                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 8 }}>
                            I'm stuck on the login screen
                        </h3>
                        <p style={{ color: 'var(--color-gray-700)' }}>
                            Make sure you're using the correct credentials for your role and school. If you've forgotten your password, contact your school administrator or use the password reset feature on the login screen.
                        </p>
                    </div>

                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 8 }}>
                            The installer won't download
                        </h3>
                        <p style={{ color: 'var(--color-gray-700)', marginBottom: 8 }}>
                            Try these solutions:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
                            <li style={{ color: 'var(--color-gray-600)', marginBottom: 4 }}>Check your internet connection</li>
                            <li style={{ color: 'var(--color-gray-600)', marginBottom: 4 }}>Try a different browser</li>
                            <li style={{ color: 'var(--color-gray-600)', marginBottom: 4 }}>Clear your browser cache and cookies</li>
                            <li style={{ color: 'var(--color-gray-600)' }}>Try downloading again from the Downloads page</li>
                        </ul>
                    </div>

                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 8 }}>
                            I still need help!
                        </h3>
                        <p style={{ color: 'var(--color-gray-700)', marginBottom: 12 }}>
                            We are ready to assist you:
                        </p>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <a href="mailto:contact@academicx.ng" style={{
                                padding: '10px 16px',
                                background: 'var(--color-primary)',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: 6,
                                fontSize: 14,
                                fontWeight: 600,
                                transition: 'all 0.3s ease',
                                display: 'inline-block'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-600)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-primary)'}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <Mail size={14} />
                                    Email: contact@academicx.ng
                                </span>
                            </a>
                            <a href="tel:+2348077264273" style={{
                                padding: '10px 16px',
                                background: 'var(--color-primary)',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: 6,
                                fontSize: 14,
                                fontWeight: 600,
                                transition: 'all 0.3s ease',
                                display: 'inline-block'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-600)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-primary)'}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <Phone size={14} />
                                    Call: +234 807 726 4273
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
