// client/src/app/admin/users/page.jsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/users").then((res) => setUsers(res.data));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-3xl font-semibold text-gray-900">User Management</h1>

      {/* Table card */}
      <div className="overflow-hidden bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Head */}
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Username
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Admin
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u, idx) => (
              <tr
                key={u.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {u.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {u.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  {u.isAdmin ? (
                    <span className="text-green-600 font-semibold">✓</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-4">
                  <button className="text-indigo-600 hover:text-indigo-900">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
