// client/src/components/SearchBar.jsx
"use client";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="max-w-md mx-auto mb-4">
      <input
        type="text"
        placeholder="Search products…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
    </div>
  );
}
