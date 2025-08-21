// client/src/components/NewArrivals.jsx
"use client";

import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductsContext";

export default function NewArrivals() {
  const { addItem } = useCart();
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl font-light mb-8 text-center">New Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
              <div className="w-full h-64 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const handleAddToCart = async (product) => {
    try {
      await addItem(product, 1);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert(error.message);
    }
  };

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-light mb-8 text-center">New Arrivals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-lg shadow overflow-hidden flex flex-col"
          >
            <Image
              src={p.image}
              alt={p.name}
              width={600}
              height={400}
              className="object-cover w-full h-64"
            />
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-black mb-2">{p.name}</h3>
              <p className="text-gray-900 font-medium mb-4">{p.price}</p>
              <button
                onClick={() => handleAddToCart(p)}
                className="mt-auto bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
