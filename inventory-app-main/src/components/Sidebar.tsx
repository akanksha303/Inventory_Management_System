'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Factory,
  History,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';

const navItems = [
  {
    section: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'D' },
    ],
  },
  {
    section: 'Inventory',
    items: [
      { href: '/products', label: 'Products', icon: Package, shortcut: 'P' },
    ],
  },
  {
    section: 'Orders',
    items: [
      { href: '/sales', label: 'Sales Orders', icon: ShoppingCart, shortcut: 'S' },
      { href: '/purchases', label: 'Purchase Orders', icon: Truck, shortcut: 'U' },
    ],
  },
  {
    section: 'Manufacturing',
    items: [
      { href: '/manufacturing', label: 'Manufacturing (WIP)', icon: Factory, shortcut: 'M' },
    ],
  },
  {
    section: 'Reports',
    items: [
      { href: '/history', label: 'Order History', icon: History, shortcut: 'H' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  // Keyboard shortcuts: Alt + key to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const allItems = navItems.flatMap((s) => s.items);
        const matched = allItems.find(
          (item) => item.shortcut.toLowerCase() === e.key.toLowerCase()
        );
        if (matched) {
          e.preventDefault();
          router.push(matched.href);
        }
        // Alt + T for theme toggle
        if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          toggleTheme();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="sidebar" id="sidebar-nav">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">IP</div>
        <div>
          <div className="sidebar-brand-text">InventoryPro</div>
          <div className="sidebar-brand-sub">Management System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  id={`nav-${item.href.replace('/', '') || 'dashboard'}`}
                >
                  <item.icon />
                  {item.label}
                  <span className="kbd">{item.shortcut}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer with theme toggle + logout */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-row">
          <button className="sidebar-link sidebar-logout" onClick={handleLogout} id="btn-logout">
            <LogOut />
            Sign Out
          </button>
          <button className="theme-toggle" onClick={toggleTheme} id="btn-theme-toggle" title="Toggle dark mode (Alt+T)">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
