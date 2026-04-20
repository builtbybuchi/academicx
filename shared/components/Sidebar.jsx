import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';

// For mobile tabs, we flatten the menuGroups into a single array
const getFlatItems = (groups) => {
    return groups.reduce((acc, curr) => [...acc, ...curr.items], []);
};

export default function Sidebar({
    menuGroups = [],
    activeId,
    onNavigate,
    onUserClick,
    onSignOut,
    appName = 'AcademicX',
    userName = 'User',
    userRole = '',
}) {
    const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [moreOpen, setMoreOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const flatItems = getFlatItems(menuGroups);
    const mobilePrimaryItems = flatItems.slice(0, 4);
    const mobileOverflowItems = flatItems.slice(4);

    return (
        <>
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="desktop-sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <img
                            src="/logo.png"
                            alt={appName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
                            onError={(event) => {
                                event.currentTarget.style.display = 'none';
                                const fallback = event.currentTarget.nextSibling;
                                if (fallback) fallback.style.display = 'flex';
                            }}
                        />
                        <span className="sidebar-logo-fallback">A</span>
                    </div>
                    <span className="sidebar-logo-text">{appName}</span>
                </div>

                <nav className="sidebar-nav">
                    {menuGroups.map((group, gi) => (
                        <div key={gi} className="sidebar-section">
                            {group.section && <div className="sidebar-section-title">{group.section}</div>}
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    className={`sidebar-nav-item ${activeId === item.id ? 'active' : ''}`}
                                    onClick={() => onNavigate(item.id)}
                                >
                                    <span className="sidebar-nav-icon">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        type="button"
                        className="sidebar-user-info"
                        style={{ cursor: onUserClick ? 'pointer' : 'default' }}
                        onClick={() => onUserClick && onUserClick()}
                    >
                        <div className="sidebar-avatar">{initials}</div>
                        <div style={{ textAlign: 'left' }}>
                            <div className="sidebar-username">{userName}</div>
                            <div className="sidebar-role">{userRole}</div>
                        </div>
                        {onSignOut && (
                            <span
                                className="sidebar-inline-signout"
                                title="Sign out"
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onSignOut();
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onSignOut();
                                    }
                                }}
                            >
                                <LogOut size={14} />
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Tab Navigation */}
            <nav className="mobile-bottom-tabs">
                {mobilePrimaryItems.map((item) => (
                    <button
                        key={item.id}
                        className={`mobile-tab-item ${activeId === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                    >
                        <div className="mobile-tab-icon">{item.icon}</div>
                        <span className="mobile-tab-label">{item.label}</span>
                    </button>
                ))}
                {mobileOverflowItems.length > 0 && (
                    <button
                        className={`mobile-tab-item ${mobileOverflowItems.some((item) => item.id === activeId) ? 'active' : ''}`}
                        onClick={() => setMoreOpen((current) => !current)}
                    >
                        <div className="mobile-tab-icon">...</div>
                        <span className="mobile-tab-label">More</span>
                    </button>
                )}
            </nav>

            {moreOpen && (
                <div className="mobile-more-overlay" onClick={() => setMoreOpen(false)}>
                    <div className="mobile-more-sheet" onClick={(event) => event.stopPropagation()}>
                        <div className="mobile-more-header">More Pages</div>
                        <div className="mobile-more-list">
                            {mobileOverflowItems.map((item) => (
                                <button
                                    key={item.id}
                                    className={`mobile-more-item ${activeId === item.id ? 'active' : ''}`}
                                    onClick={() => {
                                        onNavigate(item.id);
                                        setMoreOpen(false);
                                    }}
                                >
                                    <span className="mobile-more-icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                            {onSignOut && (
                                <button
                                    className="mobile-more-item danger"
                                    onClick={() => {
                                        onSignOut();
                                        setMoreOpen(false);
                                    }}
                                >
                                    <span className="mobile-more-icon"><LogOut size={16} /></span>
                                    <span>Sign Out</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* Desktop Sidebar Styles (White Theme) */
                .desktop-sidebar {
                    position: fixed;
                    top: 0; left: 0; bottom: 0;
                    width: var(--sidebar-width);
                    background: var(--color-white);
                    border-right: 1px solid var(--color-gray-200);
                    display: flex;
                    flex-direction: column;
                    z-index: 100;
                }
                .sidebar-logo {
                    padding: 24px 20px;
                    border-bottom: 1px solid var(--color-gray-100);
                    display: flex; align-items: center; gap: 12px;
                }
                .sidebar-logo-icon {
                    width: 36px; height: 36px; border-radius: 12px;
                    background: var(--color-primary);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 18px; font-weight: 800; color: #fff; flex-shrink: 0;
                    position: relative;
                    overflow: hidden;
                }
                .sidebar-logo-fallback {
                    display: none;
                    position: absolute;
                    inset: 0;
                    align-items: center;
                    justify-content: center;
                }
                .sidebar-logo-text { font-family: var(--font-heading); font-size: 18px; font-weight: 800; color: var(--color-gray-900); }
                
                .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
                .sidebar-section { margin-bottom: 16px; }
                .sidebar-section-title {
                    font-size: 11px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.05em; color: var(--color-gray-400);
                    padding: 8px 12px 6px; font-family: var(--font-heading);
                }
                .sidebar-nav-item {
                    display: flex; align-items: center; gap: 12px;
                    padding: 10px 12px; border-radius: 10px; cursor: pointer;
                    font-size: 14px; font-weight: 500; color: var(--color-gray-600);
                    transition: all 0.2s; border: none; background: transparent;
                    width: 100%; text-align: left; font-family: var(--font-body);
                }
                .sidebar-nav-item:hover { background: var(--color-gray-50); color: var(--color-gray-900); }
                .sidebar-nav-item.active { background: var(--color-primary-50); color: var(--color-primary-700); font-weight: 600; }
                .sidebar-nav-icon { width: 22px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
                
                .sidebar-footer { padding: 16px 20px; border-top: 1px solid var(--color-gray-100); }
                .sidebar-user-info {
                    width: 100%;
                    border: none;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 6px 8px;
                    border-radius: 12px;
                    justify-content: flex-start;
                }
                .sidebar-user-info:hover {
                    background: var(--color-gray-50);
                }
                .sidebar-inline-signout {
                    margin-left: auto;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #FEE2E2;
                    color: #B91C1C;
                }
                .sidebar-avatar {
                    width: 36px; height: 36px; border-radius: 50%;
                    background: var(--color-primary-100); color: var(--color-primary);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 13px; font-weight: 700; flex-shrink: 0;
                }
                .sidebar-username { font-size: 13px; font-weight: 600; color: var(--color-gray-900); font-family: var(--font-heading); }
                .sidebar-role { font-size: 12px; color: var(--color-gray-500); }

                /* Mobile Bottom Tabs */
                .mobile-bottom-tabs {
                    display: none;
                    position: fixed;
                    bottom: 0; left: 0; right: 0;
                    height: var(--bottom-tab-height);
                    background: var(--color-white);
                    border-top: 1px solid var(--color-gray-200);
                    box-shadow: 0 -4px 12px rgba(0,0,0,0.03);
                    z-index: 1000;
                    padding-bottom: env(safe-area-inset-bottom); /* iOS support */
                    overflow-x: auto;
                    overflow-y: hidden;
                    white-space: nowrap;
                }
                .mobile-tab-item {
                    min-width: 72px;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    background: transparent; border: none; padding: 6px; cursor: pointer;
                    color: var(--color-gray-400); transition: color 0.2s;
                }
                .mobile-tab-item:active { background: rgba(0,0,0,0.02); }
                .mobile-tab-item.active { color: var(--color-primary); }
                .mobile-tab-icon { font-size: 20px; margin-bottom: 4px; transition: transform 0.2s; }
                .mobile-tab-item.active .mobile-tab-icon { transform: translateY(-2px); }
                .mobile-tab-label { font-size: 10px; font-weight: 600; font-family: var(--font-heading); }

                .mobile-more-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 1100;
                    background: rgba(15, 23, 42, 0.25);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                }
                .mobile-more-sheet {
                    width: min(96vw, 460px);
                    background: #fff;
                    border: 1px solid var(--color-gray-200);
                    border-bottom: none;
                    border-radius: 16px 16px 0 0;
                    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.12);
                    padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
                    max-height: 72vh;
                    overflow: auto;
                }
                .mobile-more-header {
                    font-family: var(--font-heading);
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--color-gray-500);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    padding: 8px 10px;
                }
                .mobile-more-list {
                    display: grid;
                    gap: 6px;
                }
                .mobile-more-item {
                    border: 1px solid var(--color-gray-200);
                    background: #fff;
                    border-radius: 10px;
                    padding: 10px 12px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-gray-700);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-align: left;
                }
                .mobile-more-item.active {
                    border-color: var(--color-primary-300);
                    background: var(--color-primary-50);
                    color: var(--color-primary-700);
                }
                .mobile-more-item.danger {
                    border-color: #FECACA;
                    background: #FEF2F2;
                    color: #B91C1C;
                }
                .mobile-more-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                @media (max-width: 1024px) {
                    .desktop-sidebar { display: none; }
                    .mobile-bottom-tabs { display: flex; }
                }
            `}</style>
        </>
    );
}
