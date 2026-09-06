// src/app/layout.js - COMPLETE CODE (Final Cleanup)

import './globals.css';

// REMOVED SAFELISTING HERE: It must be done in tailwind.config.js

export const metadata = {
  title: 'MANSI AI - Wellness Portal',
  description: 'Confidential AI and Psychologist Support System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}