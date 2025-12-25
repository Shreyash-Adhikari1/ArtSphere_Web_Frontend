import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brandPink: "#C974A6",
                brandRed: "#FF0000",
                postBg: "#FFF6ED",
                inputBg: "#F3E8EE", // The soft pink for your text boxes
            },
        },
    },
    plugins: [],
};
export default config;