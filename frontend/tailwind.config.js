/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            container: { center: true, padding: "2rem" },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
