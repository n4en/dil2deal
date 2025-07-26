'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/deals', label: 'Browse Deals' },
  { href: '/vendor', label: 'Publish Deal' },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-teal-600 hover:underline">
            Dil2Deal
          </Link>
        </div>
        <div className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'text-teal-600 font-semibold' : 'text-gray-600 dark:text-gray-300'} hover:text-teal-700 transition`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 