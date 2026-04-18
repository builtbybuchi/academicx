export function BookLoader({ label = 'Loading school site...' }: { label?: string }) {
    return (
        <div className="site-book-loader" role="status" aria-live="polite" aria-label={label}>
            <div>
                <ul>
                    <li>
                        <svg viewBox="0 0 90 120" fill="currentColor">
                            <path d="M10 5h70v110H10z" />
                        </svg>
                    </li>
                    <li>
                        <svg viewBox="0 0 90 120" fill="currentColor">
                            <path d="M10 5h70v110H10z" />
                        </svg>
                    </li>
                    <li>
                        <svg viewBox="0 0 90 120" fill="currentColor">
                            <path d="M10 5h70v110H10z" />
                        </svg>
                    </li>
                    <li>
                        <svg viewBox="0 0 90 120" fill="currentColor">
                            <path d="M10 5h70v110H10z" />
                        </svg>
                    </li>
                    <li>
                        <svg viewBox="0 0 90 120" fill="currentColor">
                            <path d="M10 5h70v110H10z" />
                        </svg>
                    </li>
                </ul>
            </div>
            <span>{label}</span>
        </div>
    );
}

export function ButtonBarLoader() {
    return <span className="btn-bar-loader" aria-hidden="true" />;
}
