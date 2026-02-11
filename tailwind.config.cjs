/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#01691a",
                secondary: "#eb8a44",
                accent: "#0a304c",
                darkGray: "#1F2937",
                mediumGray: "#6B7280",
                lightGray: "#F3F4F6",
            },
        },
    },
    plugins: [],
};
