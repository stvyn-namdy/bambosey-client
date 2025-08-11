// client/src/components/FavoritesDrawer.jsx
"use client";

import { Fragment } from "react";
import Image from "next/image";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";

export default function FavoritesDrawer({ open, onClose }) {
  const { favorites, removeFromFavorites } = useFavorites();
  const { addItem } = useCart();

  if (!open) return null;

  const handleAddToCart = (product) => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.priceNumber,
      image: product.image,
    });
  };

  return (
    <Fragment>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Favorites</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded text-gray-800 hover:text-black"
            aria-label="Close favorites"
          >
            ✕
          </button>
        </div>

        <div className="overflow-auto flex-1 p-6">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <p className="text-gray-500 text-sm">Your wishlist is empty</p>
              <p className="text-gray-400 text-xs mt-1">
                Start adding products you love!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{item.price}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromFavorites(item.id)}
                        className="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {favorites.length > 0 && (
          <div className="border-t p-6">
            <p className="text-sm text-gray-600 text-center">
              {favorites.length} item{favorites.length !== 1 ? 's' : ''} in your wishlist
            </p>
          </div>
        )}
      </div>
    </Fragment>
  );
}
