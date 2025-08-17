// client/src/app/admin/layout.jsx
"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect non-admins away
  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <p className="p-8 text-center text-gray-900">Loading…</p>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar panel */}
      <nav className="w-64 bg-white p-6 space-y-6 border-r-2 border-gray-300 shadow-md">
        <h2 className="text-2xl font-semibold text-gray-900">Admin</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/admin/users"
              className="block text-gray-800 hover:text-black"
            >
              Users
            </Link>
          </li>
          <li>
            <Link
              href="/admin/orders"
              className="block text-gray-800 hover:text-black"
            >
              Orders
            </Link>
          </li>
          <li>
            <Link
              href="/admin/analytics"
              className="block text-gray-800 hover:text-black"
            >
              Analytics
            </Link>
          </li>
        </ul>
        <button
          onClick={() => router.replace("/")}
          className="mt-8 block text-sm text-red-600 hover:underline"
        >
          Back to Store
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-8 bg-white text-gray-900">
        {children}
      </main>
    </div>
  );
}
