// client/src/components/FilterDrawer.jsx
"use client";

import { Fragment } from "react";

export default function FilterDrawer({ open, onClose, groups }) {
  if (!open) return null;
  return (
    <Fragment>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 flex flex-col text-gray-900">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 tracking-wide">FILTERS & SORT</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>

        <div className="overflow-auto flex-1 px-6 py-4">
          {groups.map(({ title, items, selected, onChange }) => (
            <div key={title} className="border-b border-gray-200 last:border-b-0">
              <button className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-700">{title}</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div className="pb-4">
                <ul className="space-y-2 pl-4">
                  {items.map(({ key, label }) => (
                    <li key={String(key)}>
                      <label className="flex items-center space-x-3 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selected.includes(key)}
                          onChange={() => onChange(key)}
                          className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-gray-600">{label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
}
