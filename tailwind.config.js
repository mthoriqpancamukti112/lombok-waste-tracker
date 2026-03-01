import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.tsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Google Sans"', ...defaultTheme.fontFamily.sans],
                poppins: ['"Poppins"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // ── Design System: Content ──
                'ds': {
                    // Primary (Lime)
                    'primary': '#9AE630',
                    'primary-hover': '#7CCF35',
                    'primary-pressed': '#5EA529',
                    'primary-subtle': '#F7FEE7',
                    // Mono (Gray)
                    'mono': '#6A7982',
                    'mono-bold': '#101828',
                    'inverse': '#FFFFFF',
                    // Disabled
                    'disabled': '#D0D5DC',
                    'disabled-bg': '#F3F4F6',
                    // Negative (Red)
                    'negative': '#FE2C36',
                    'negative-hover': '#E71B08',
                    'negative-pressed': '#C11007',
                    'negative-subtle': '#FEF2F2',
                    // Positive (Green)
                    'positive': '#31C950',
                    'positive-hover': '#2AA63E',
                    'positive-pressed': '#17B236',
                    'positive-subtle': '#F0FDF4',
                    // Notice (Yellow)
                    'notice': '#F0B138',
                    'notice-hover': '#D0872E',
                    'notice-pressed': '#A65F1B',
                    'notice-subtle': '#FEFCE8',
                    // Info (Blue)
                    'info': '#2B7FFF',
                    'info-hover': '#155DFC',
                    'info-pressed': '#144716',
                    'info-subtle': '#EFF6FF',
                    // Background
                    'bg': '#F9FAFB',
                    'bg-inverse': '#101828',
                    // Border
                    'border': '#E9E7EB',
                    'border-bold': '#4A5666',
                    'border-focus': '#7CCF35',
                },
            },
        },
    },

    plugins: [require("@tailwindcss/forms")],
};
