// client/src/components/Categories.jsx
"use client";

import Link from "next/link";

const cats = [
  { 
    title: "Women", 
    href: "/women",
  },
  { 
    title: "Men", 
    href: "/men",
  },
  { 
    title: "Kids", 
    href: "/kids",
  },
  { 
    title: "Accessories", 
    href: "/accessories",
  },
];

export default function Categories() {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-light mb-12 text-center text-gray-100">
        Featured Categories
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cats.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className="group block"
          >
            <div className="bg-white border border-gray-200 rounded-lg h-64 flex flex-col items-center justify-center text-center p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300 relative">
              <h3 className="text-2xl font-light text-gray-900 group-hover:text-black transition-colors">
                {cat.title}
              </h3>
              <div className="absolute bottom-6">
                <span className="inline-block bg-black text-white px-6 py-2 text-sm font-light rounded hover:bg-gray-800 transition-colors group-hover:bg-gray-800">
                  Shop Now
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
