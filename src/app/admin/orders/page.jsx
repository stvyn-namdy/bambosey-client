// client/src/app/admin/orders/page.jsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/orders").then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-900">Order Management</h1>

      <div className="overflow-hidden bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: "Order ID",    align: "left" },
                { label: "Customer",    align: "left" },
                { label: "Date",        align: "left" },
                { label: "Total",       align: "right" },
                { label: "Status",      align: "center" },
                { label: "Actions",     align: "center" },
              ].map((col) => (
                <th
                  key={col.label}
                  scope="col"
                  className={`
                    px-6 py-3 text-${col.align} text-xs font-medium text-gray-500 uppercase tracking-wider
                  `}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((o, idx) => (
              <tr
                key={o.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {o.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {o.user}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {format(new Date(o.date), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  ${o.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`
                      inline-block px-2 py-1 text-xs font-medium rounded-full
                      ${
                        o.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                        : o.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                        : o.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }
                    `}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <button className="text-indigo-600 hover:text-indigo-900">
                    View
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
