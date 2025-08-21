// client/src/components/VisualSearchModal.jsx
"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";

export default function VisualSearchModal() {
  const { isCartOpen } = useCart();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);

  const handlePick = () => fileRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setError("");
    setResults([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/find-similar`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const { similar } = await res.json();
      setResults(similar || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  if (isCartOpen) return null;

  return (
    <>
      {/* header trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open visual search"
        className="group inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition"
        title="Search by photo"
      >
        {/* Camera icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-700 group-hover:text-black"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="14" r="4" />
        </svg>

        {/* Label shows on md+ so it’s explicit on bigger screens */}
        <span className="hidden md:inline text-sm font-medium text-gray-800">
          Visual search
        </span>
      </button>


      {open && (
        <>
          {/* backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />
          {/* responsive popup pinned to the right */}
          <div
            className="
              fixed z-50 top-3 right-3
              w-[92vw] sm:w-[28rem] lg:w-[32rem] 2xl:w-[36rem]
              bg-white rounded-2xl shadow-2xl border
              p-4 sm:p-5 flex flex-col
              max-h-[82vh]
            "
          >
            {/* header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-extrabold">Visual Style Search</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-xl p-1 rounded hover:bg-gray-100"
                aria-label="Close visual search"
              >
                ✕
              </button>
            </div>

            {/* choose file (nice button) */}
            <div className="mb-3 flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              <button
                onClick={handlePick}
                className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50"
              >
                Choose Image
              </button>
              <span className="text-xs sm:text-sm text-gray-600 truncate" title={fileName}>
                {fileName || "No file chosen"}
              </span>
            </div>

            <hr className="mb-3" />

            {/* content area — scrolls; card itself stays nicely sized */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {loading && <p className="text-gray-600 text-sm">Searching…</p>}
              {error && <p className="text-red-600 text-sm">Error: {error}</p>}

              {results.length > 0 && (
  <div className="grid grid-cols-1 gap-3 max-h-[45vh] overflow-y-auto">
    {results.map((item) => {
      const href = `/products/${item.id}`; // pick your route
      return (
        <Link
          key={item.id ?? item.sku}
          href={href}
          onClick={() => setOpen(false)}          // close modal on navigate
          className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50 transition"
        >
          <img
            src={item.image_url}
            alt={item.name}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="min-w-0">
            <p className="font-medium truncate">{item.name}</p>
            <p className="text-sm text-gray-700">
              ${Number(item.price ?? 0).toFixed(2)}
            </p>
          </div>
        </Link>
      );
    })}
  </div>
)}


              {!loading && !error && results.length === 0 && (
                <p className="text-gray-500 text-sm">Upload an image to get started.</p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
//test