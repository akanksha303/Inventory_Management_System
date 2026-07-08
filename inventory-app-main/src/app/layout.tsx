'use client';

import './globals.css';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>InventoryPro — Inventory Management System</title>
        <meta
          name="description"
          content="Cloud-connected inventory management for sales, purchases, and manufacturing workflows."
        />
        <meta name="theme-color" content="#1e40af" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body suppressHydrationWarning>
        {isLoginPage ? (
          children
        ) : (
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
        )}
      </body>
    </html>
  );
}
