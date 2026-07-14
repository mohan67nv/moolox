import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Moolox — AI-Powered Digital Experience Operating System',
  description:
    'Build websites, landing pages, SaaS applications, dashboards, and more with AI-powered design and development tools.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
