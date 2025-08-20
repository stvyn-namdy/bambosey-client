// client/src/components/CartDrawer.jsx
"use client";

import { Fragment } from "react";
import { useCart } from "../../context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CartDrawer({ open, onClose }) {
  const { items, updateQty, removeItem, total } = useCart();

  if (!open) return null;
  return (
    <Fragment>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Your Cart</h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="p-2 text-2xl text-gray-900 hover:text-black hover:bg-gray-200 rounded transition"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-gray-700">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="w-16 h-16 relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-gray-700 mb-2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <div className="flex items-center space-x-2">
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
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm ml-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t space-y-3">
          <Link
            href="/cart"
            onClick={onClose}
            className="block text-center border border-gray-300 text-gray-900 font-medium py-2 rounded hover:bg-gray-100 transition"
          >
            View Cart
          </Link>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total:</span>
            <span className="font-semibold text-gray-900">
              ${total.toFixed(2)}
            </span>
          </div>
          <Link
            href="/checkout"
            onClick={onClose}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 block text-center font-medium transition"
          >
            Checkout
          </Link>
        </div>
      </div>
    </Fragment>
  );
}
