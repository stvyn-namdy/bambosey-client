// client/src/app/[category]/page.jsx

"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { useProducts } from "../../context/ProductsContext";
import SearchBar from "../../components/SearchBar";
import ProductGrid from "../../components/ProductGrid";
import FilterDrawer from "../../components/FilterDrawer";

export default function CategoryPage({ params }) {
  const resolvedParams = use(params);
  const category = resolvedParams.category.toLowerCase();
  if (!["women","men","kids","accessories"].includes(category)) return notFound();

  const { products: allProducts, loading, colors: availableColors } = useProducts();
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState([]);

  // Filter products by category when products change
  useEffect(() => {
    if (allProducts.length > 0) {
      console.log('Debug - All products:', allProducts);
      console.log('Debug - Looking for category:', category);
      console.log('Debug - Product categories:', allProducts.map(p => p.category));
      
      const filtered = allProducts.filter((p) => p.category === category);
      console.log('Debug - Filtered products:', filtered);
      setCategoryProducts(filtered);
    }
  }, [allProducts, category]);

  if (loading) {
    return (
      <main className="px-4 py-12 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="w-full h-64 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Get unique values for filters (with fallbacks for empty products array)
  const subcategories = [...new Set(categoryProducts.map(p => p.subcategory))];
  const colors = [...new Set(categoryProducts.flatMap(p => p.colors))];
  const sizes = [...new Set(categoryProducts.flatMap(p => p.sizes))];
  const priceRanges = ["Under $25", "$25 - $50", "$50 - $100", "Over $100"];
  const brands = ["BamBosey", "Premium", "Classic", "Sport"]; // Mock brands
  const sortOptions = ["Price: Low to High", "Price: High to Low", "Newest First", "Popular"];

  // Apply filters
  const filtered = categoryProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesSubcategory = selectedSubcategories.length === 0 || selectedSubcategories.includes(p.subcategory);
    const matchesColor = selectedColors.length === 0 || selectedColors.some(color => p.colors.includes(color));
    const matchesSize = selectedSizes.length === 0 || selectedSizes.some(size => p.sizes.includes(size));
    
    // Price range filtering
    let matchesPrice = selectedPriceRanges.length === 0;
    if (selectedPriceRanges.length > 0) {
      matchesPrice = selectedPriceRanges.some(range => {
        switch (range) {
          case "Under $25": return p.priceNumber < 25;
          case "$25 - $50": return p.priceNumber >= 25 && p.priceNumber <= 50;
          case "$50 - $100": return p.priceNumber >= 50 && p.priceNumber <= 100;
          case "Over $100": return p.priceNumber > 100;
          default: return true;
        }
      });
    }
    
    return matchesSearch && matchesSubcategory && matchesColor && matchesSize && matchesPrice;
  });

  const toggleFilter = (type, value) => {
    switch (type) {
      case 'subcategory':
        setSelectedSubcategories(prev => 
          prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
        );
        break;
      case 'color':
        setSelectedColors(prev => 
          prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
        );
        break;
      case 'size':
        setSelectedSizes(prev => 
          prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
        );
        break;
      case 'price':
        setSelectedPriceRanges(prev => 
          prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
        );
        break;
      case 'brand':
        setSelectedBrands(prev => 
          prev.includes(value) ? prev.filter(b => b !== value) : [...prev, value]
        );
        break;
      case 'sort':
        setSortBy(prev => 
          prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
        );
        break;
    }
  };

  return (
    <main className="px-4 py-12 max-w-7xl mx-auto">
      <h1 className="text-3xl font-light mb-8 capitalize">{category}</h1>
      
      <div className="flex items-center mb-2">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
            />
          </svg>
          <span className="text-sm font-medium">FILTERS & SORT</span>
        </button>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="max-w-md w-full">
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </div>
      
      <div className="mt-8">
        <ProductGrid products={filtered} />
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        groups={[
          {
            title: "Product Type",
            items: subcategories.map(sub => ({ key: sub, label: sub })),
            selected: selectedSubcategories,
            onChange: (value) => toggleFilter('subcategory', value)
          },
          {
            title: "Color",
            items: colors.map(color => ({ key: color, label: color })),
            selected: selectedColors,
            onChange: (value) => toggleFilter('color', value)
          },
          {
            title: "Size",
            items: sizes.map(size => ({ key: size, label: size })),
            selected: selectedSizes,
            onChange: (value) => toggleFilter('size', value)
          },
          {
            title: "Price",
            items: priceRanges.map(range => ({ key: range, label: range })),
            selected: selectedPriceRanges,
            onChange: (value) => toggleFilter('price', value)
          },
          {
            title: "Brand",
            items: brands.map(brand => ({ key: brand, label: brand })),
            selected: selectedBrands,
            onChange: (value) => toggleFilter('brand', value)
          },
          {
            title: "Gender",
            items: [
              { key: "women", label: "Women" },
              { key: "men", label: "Men" },
              { key: "unisex", label: "Unisex" }
            ],
            selected: [],
            onChange: (value) => {} // Placeholder for gender filter
          },
          {
            title: "Sort by",
            items: sortOptions.map(option => ({ key: option, label: option })),
            selected: sortBy,
            onChange: (value) => toggleFilter('sort', value)
          }
        ]}
      />
    </main>
  );
}
