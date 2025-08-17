// client/src/app/cart/page.jsx
"use client";

import { useCart } from "../../context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQty, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h1 className="text-3xl font-semibold mb-6">Your Cart</h1>
        <p className="text-gray-700 mb-8">Your cart is empty.</p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-16 space-y-8">
      <h1 className="text-3xl font-semibold text-white">Your Cart</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                Subtotal
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-4">
                  <div className="w-16 h-16 relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover rounded"
                    />
                  </div>
                  <span className="text-gray-900 font-medium">{item.name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                  ${parseFloat(item.price || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQty(item.id, Math.max(1, Number(e.target.value) || 1))
                      }
                      className="w-16 border border-gray-400 bg-gray-100 text-base text-gray-900 rounded px-2 py-1 text-center"
                    />
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                  ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center space-x-6">
        <span className="text-xl font-medium text-white">Total:</span>
        <span className="text-2xl font-semibold text-white">
          ${total.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-end">
        <Link
          href="/checkout"
          className="bg-black text-white px-8 py-3 rounded font-light hover:bg-gray-800 transition-colors text-lg inline-block"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
