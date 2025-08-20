// client/src/components/Header.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import CartDrawer from "./CartDrawer";
import FavoritesDrawer from "./FavoritesDrawer";
import VisualSearchModal from "./VisualSearchModal";

export default function Header() {
  const { user, logout } = useAuth();
  const { items, itemCount } = useCart();
  const { favorites } = useFavorites();
  const [cartOpen, setCartOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const pathname = usePathname() || "";
  const isActive = (path) => pathname.startsWith(path);

  const handleAdminDashboard = () => {
    // Get the current user's auth token
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    if (token) {
      // Pass the token to the admin dashboard for automatic authentication
      const adminUrl = `http://localhost:3002/admin/dashboard?auth_token=${encodeURIComponent(token)}`;
      window.open(adminUrl, '_blank');
    } else {
      // Fallback to login page if no token found
      window.open('http://localhost:3002/admin/access', '_blank');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Image 
              src="/images/logo.png" 
              alt="Logo" 
              width={120} 
              height={40} 
              priority 
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>

          {/* Main nav */}
          <nav className="flex space-x-8 text-sm font-light text-gray-700">
            {["women", "men", "kids", "accessories"].map((cat) => (
              <Link
                key={cat}
                href={`/${cat}`}
                className={`hover:text-black ${
                  isActive(`/${cat}`) ? "font-bold text-gray-900" : ""
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Link>
            ))}
            {user?.isAdmin && (
              <button
                onClick={handleAdminDashboard}
                className="ml-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                Admin Dashboard
              </button>
            )}
          </nav>

          {/* Utilities */}
          <div className="flex items-center space-x-4 text-gray-700">
            {/* Account / Login */}
            {user ? (
              <>
                <Link
                  href="/orders"
                  className="text-sm font-medium hover:text-black transition-colors"
                  aria-label="My Orders"
                >
                  Orders
                </Link>
                <Link
                  href="/account"
                  className="p-1 hover:text-black transition-colors"
                  aria-label="Account settings"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-.94 1.543.826 3.31 2.37 2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium hover:text-black"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`text-sm font-medium hover:text-black ${
                  isActive("/login") ? "font-bold text-gray-900" : ""
                }`}
              >
                Log In
              </Link>
            )}

            {/* Favorites icon */}
            <button
              onClick={() => setFavoritesOpen(true)}
              className="relative p-1 hover:text-black"
              aria-label="Open favorites"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 fill-none stroke-current"
                viewBox="0 0 24 24"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Cart icon */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-1 hover:text-black"
              aria-label="Open cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 fill-none stroke-current"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6m1.2-6L5 6m16 7v2a2 2 0 1 1-2 2h-4m4-4H7"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Visual search trigger (hidden when cart is open) */}
            {!cartOpen && <VisualSearchModal />}
          </div>
        </div>
      </header>

      {/* Drawers */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <FavoritesDrawer
        open={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
      />
    </>
  );
}
