// client/src/components/Hero.jsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-[80vh]">
      <Image
        src="/images/hero.png"
        alt="Hero banner"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-white text-4xl md:text-6xl font-light mb-4">
          Discover Our New Collection
        </h1>
        <Link
          href="/women"
          className="bg-black text-white py-2 px-6 text-lg hover:bg-gray-800 transition ring-2 ring-transparent focus:ring-white/60"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
