// client/src/components/ProductGrid.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

export default function ProductGrid({ products }) {
  const { addItem } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleAddToCart = (e, product) => {
    e.preventDefault(); // Prevent navigation when clicking add to cart
    e.stopPropagation();
    
    addItem(
      {
        id: product.id.toString(),
        name: product.name,
        price: product.priceNumber,
        image: product.image,
      },
      1
    );
  };

  const handleToggleFavorite = (e, product) => {
    e.preventDefault(); // Prevent navigation when clicking favorite
    e.stopPropagation();
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/products/${p.id}`}
          className="bg-white rounded-lg shadow overflow-hidden flex flex-col relative hover:shadow-lg transition-shadow cursor-pointer group"
        >
          {/* Favorite button */}
          <button
            onClick={(e) => handleToggleFavorite(e, p)}
            className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white/90 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                isFavorite(p.id)
                  ? "fill-red-500 stroke-red-500"
                  : "fill-none stroke-gray-600"
              }`}
              viewBox="0 0 24 24"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          <div className="relative overflow-hidden">
            <Image
              src={p.image}
              alt={p.name}
              width={600}
              height={400}
              className="object-cover w-full h-64 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-medium mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
              {p.name}
            </h3>
            <p className="text-gray-700 mb-4 font-semibold">{p.price}</p>
            
            <div className="mt-auto space-y-2">
              <button
                onClick={(e) => handleAddToCart(e, p)}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors"
              >
                Add to Cart
              </button>
              
              <div className="text-center">
                <span className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  View Details
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
