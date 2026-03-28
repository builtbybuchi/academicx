/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                school: {
                    primary: 'var(--school-primary)',
                    secondary: 'var(--school-secondary)',
                    accent: 'var(--school-accent)',
                    background: 'var(--school-background)',
                    foreground: 'var(--school-text)',
                },
            },
            fontFamily: {
                display: ['var(--school-font-display)', 'system-ui', 'sans-serif'],
                body: ['var(--school-font-body)', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
