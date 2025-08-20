// client/src/components/Footer.jsx
"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Customer Service */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Customer Service</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link href="/help" className="hover:text-gray-900">
                Help & FAQs
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-gray-900">
                Shipping & Returns
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gray-900">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/order-tracking" className="hover:text-gray-900">
                Order Tracking
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link href="/about" className="hover:text-gray-900">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/careers" className="hover:text-gray-900">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/sustainability" className="hover:text-gray-900">
                Sustainability
              </Link>
            </li>
            <li>
              <Link href="/press" className="hover:text-gray-900">
                Press
              </Link>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Connect</h3>
          <ul className="flex space-x-4">
            <li>
              <Link href="https://instagram.com" target="_blank" className="text-gray-600 hover:text-gray-900">
                <span className="sr-only">Instagram</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Link>
            </li>
            <li>
              <Link href="https://facebook.com" target="_blank" className="text-gray-600 hover:text-gray-900">
                <span className="sr-only">Facebook</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.3 3h-1.9v7A10 10 0 0022 12" />
                </svg>
              </Link>
            </li>
            <li>
              <Link href="https://twitter.com" target="_blank" className="text-gray-600 hover:text-gray-900">
                <span className="sr-only">Twitter</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 19c7.5 0 11.6-6.2 11.6-11.6 0-.2 0-.4 0-.6A8.3 8.3 0 0022 5.6a8.2 8.2 0 01-2.4.7 4.1 4.1 0 001.8-2.3 8.2 8.2 0 01-2.6 1 4.1 4.1 0 00-7 3.7 11.6 11.6 0 01-8.4-4.2 4.1 4.1 0 001.3 5.5A4 4 0 012 9.8v.1a4.1 4.1 0 003.3 4 4.1 4.1 0 01-1.9.1 4.1 4.1 0 003.8 2.8A8.3 8.3 0 012 18.6a11.6 11.6 0 006.3 1.8" />
                </svg>
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Subscribe</h3>
          <form className="flex flex-col space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t text-center text-sm text-gray-600">
        <p>&copy; 2024 BamBosey. All rights reserved.</p>
      </div>
    </footer>
  );
}
