/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  
  // CRITICAL: Safelist all dynamic color classes used in ChatLayout.js
  // This ensures Tailwind compiles them, fixing the universal color change.
  safelist: [
    // HEALING COLOR PALETTE (Used in ChatLayout.js)
    // Sidebar (700) and Main Background (50)
    'bg-teal-700', 'bg-teal-50', 'text-teal-600', 'hover:bg-teal-700',
    'bg-sky-700', 'bg-sky-50', 'text-sky-600', 'hover:bg-sky-700',
    'bg-violet-700', 'bg-violet-50', 'text-violet-600', 'hover:bg-violet-700',
    'bg-rose-700', 'bg-rose-50', 'text-rose-600', 'hover:bg-rose-700',
    'bg-gray-700', 'bg-gray-50', 'text-gray-600', 'hover:bg-gray-700',
    'bg-red-700', 'bg-red-50', 'text-red-600', 'hover:bg-red-700',
    
    // Priority Badges (500/600)
    'bg-teal-500', 
    'bg-orange-500', 
    'bg-red-600',
    
    // Common Login Colors
    'border-teal-600', 'focus:ring-teal-500',
    'border-sky-600', 'focus:ring-sky-500',
    'border-violet-600', 'focus:ring-violet-500',
  ],
};