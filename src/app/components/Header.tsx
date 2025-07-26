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
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between py-4 gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-center md:justify-start">
          <Link href="/" className="text-2xl font-bold text-teal-600 hover:text-teal-700 transition-colors duration-200">
            Dil2Deal
          </Link>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8 w-full md:w-auto justify-center md:justify-end">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                pathname === link.href 
                  ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 font-semibold' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 