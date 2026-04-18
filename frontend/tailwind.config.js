export default {
    content: ["./src/**/*.{html,ts}"],
    theme: {
    extend: {
        colors: {
        steam: {
            global: "var(--steam-global)",
            bg: "var(--steam-bg)",
            accent: "var(--steam-accent)",
            "accent-hover": "var(--steam-accent-hover)",
            border: "var(--steam-border)",
            text: "var(--steam-text)",
            muted: "var(--steam-muted)",
            panel: "var(--steam-panel)",
        },
        },
        fontFamily: {
        sans: ['"Motiva Sans"', "Arial", "Helvetica", "sans-serif"],
        },
    },
    },
};