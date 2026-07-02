import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Internship Management Portal',
  description: 'Internship Management, Collaboration & Mentorship Portal'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
