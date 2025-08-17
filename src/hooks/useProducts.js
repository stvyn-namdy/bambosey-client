// client/src/hooks/useProducts.js
"use client";

import { useState, useEffect } from 'react';
import api, { endpoints } from '../lib/api';

// Custom hook for fetching products with caching
export function useProductsData() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsRes, categoriesRes, colorsRes] = await Promise.allSettled([
        api.get(endpoints.products.list),
        api.get(endpoints.categories.list),
        api.get(endpoints.colors.list)
      ]);

      // Handle products
      if (productsRes.status === 'fulfilled') {
        const productsData = productsRes.value.data;
        setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);
      } else {
        console.error('Failed to fetch products:', productsRes.reason);
      }

      // Handle categories
      if (categoriesRes.status === 'fulfilled') {
        setCategories(categoriesRes.value.data || []);
      } else {
        console.error('Failed to fetch categories:', categoriesRes.reason);
      }

      // Handle colors
      if (colorsRes.status === 'fulfilled') {
        setColors(colorsRes.value.data || []);
      } else {
        console.error('Failed to fetch colors:', colorsRes.reason);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    categories,
    colors,
    loading,
    error,
    refetch: fetchProducts
  };
}
