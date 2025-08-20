    'use client'
    import { useState } from 'react'

    export default function VisualSearch() {
    const [results, setResults] = useState([])
    const [loading, setLoading]   = useState(false)
    const [error, setError]       = useState(null)

    async function handleFileChange(e) {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        setError(null)
        setResults([])

        try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/find-similar', {
            method: 'POST',
            body: formData,
        })

        if (!res.ok) throw new Error(`Server returned ${res.status}`)

        const data = await res.json()
        setResults(data.similar)
        } catch (err) {
        console.error(err)
        setError(err.message)
        } finally {
        setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Visual Style Search</h1>
        <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border p-2 mb-4"
        />

        {loading && <p className="text-gray-600">Searching...</p>}
        {error   && <p className="text-red-600">Error: {error}</p>}
        {!loading && !error && results.length===0 && (
            <p className="text-gray-500">Upload an image to get started.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {results.map(item => (
            <div key={item.id} className="border rounded-lg p-4 shadow">
                <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover mb-2 rounded"
                />
                <h2 className="font-semibold text-lg truncate">{item.name}</h2>
                <p className="text-sm text-gray-600 truncate">
                {item.tags?.join(', ')}
                </p>
                <p className="mt-1 font-bold">${item.price}</p>
            </div>
            ))}
        </div>
        </div>
    )
    }
