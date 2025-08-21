// client/src/context/ProductsContext.jsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api, { endpoints } from "../lib/api";

const ProductsContext = createContext({
  products: [],
  categories: [],
  colors: [],
  loading: true,
  error: null,
  searchProducts: async () => {},
  getProductById: async () => {},
  refreshProducts: async () => {},
});

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products and colors from backend API
      const [productsRes, colorsRes] = await Promise.allSettled([
        api.get(endpoints.products.list),
        api.get(endpoints.colors.list),
      ]);

      // Handle products
      let productsData = [];
      if (productsRes.status === 'fulfilled') {
        const data = productsRes.value.data;
        productsData = Array.isArray(data) ? data : data.products || [];
      } else {
        console.error('Failed to fetch products from backend:', productsRes.reason);
        throw new Error('Failed to load products from server');
      }

      // Use hardcoded categories since backend doesn't have categories endpoint
      const categoriesData = [
        { id: 1, name: 'Men', description: 'Men\'s clothing and accessories' },
        { id: 2, name: 'Women', description: 'Women\'s fashion and apparel' },
        { id: 3, name: 'Kids', description: 'Children\'s clothing' },
        { id: 4, name: 'Accessories', description: 'Fashion accessories' },
      ];

      // Handle colors
      let colorsData = [];
      if (colorsRes.status === 'fulfilled') {
        colorsData = colorsRes.value.data || [];
      } else {
        console.warn('Failed to fetch colors from backend:', colorsRes.reason);
        // Colors are optional, so we can continue without them
        colorsData = [];
      }

      const transformedProducts = transformProducts(productsData, categoriesData, colorsData);
      setProducts(transformedProducts);
      setCategories(categoriesData);
      setColors(colorsData);

    } catch (error) {
      console.error('Failed to load initial data:', error);
      setError(error.message || 'Failed to load product data');
    } finally {
      setLoading(false);
    }
  };

  const transformProducts = (backendProducts, categoriesData = [], colorsData = []) => {
    return backendProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: `$${parseFloat(product.basePrice || product.priceNumber || 0).toFixed(2)}`,
      priceNumber: parseFloat(product.basePrice || product.priceNumber || 0),
      image: product.images?.[0] || product.image || '/images/placeholder.png',
      images: product.images || [product.image || '/images/placeholder.png'],
      category: product.category?.name?.toLowerCase() || getCategoryName(product.categoryId, categoriesData) || 'uncategorized',
      subcategory: product.subcategory || 'General',
      colors: product.variants?.map(variant => 
        colorsData.find(color => color.id === variant.colorId)?.name || 
        variant.color?.name
      ).filter(Boolean) || product.colors || [],
      sizes: product.variants?.map(variant => 
        variant.size?.name
      ).filter(Boolean) || product.sizes || [],
      variants: product.variants || [],
      stockStatus: product.stockStatus || 'IN_STOCK',
      allowPreorder: product.allowPreorder || false,
      isActive: product.isActive !== false,
      sku: product.sku,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  };

  const getCategoryName = (categoryId, categoriesData = []) => {
    if (!categoryId) return null;
    const category = categoriesData.find(cat => cat.id === categoryId);
    return category?.name.toLowerCase() || null;
  };

  const searchProducts = async (searchTerm, filters = {}) => {
    try {
      const params = {
        search: searchTerm,
        ...filters,
      };

      const response = await api.get(endpoints.products.search, { params });
      return transformProducts(response.data.products || response.data);
    } catch (error) {
      console.error('Failed to search products:', error);
      throw new Error('Failed to search products');
    }
  };

  const getProductById = async (id) => {
    try {
      const response = await api.get(endpoints.products.byId(id));
      const product = response.data;
      return transformProducts([product])[0];
    } catch (error) {
      console.error('Failed to get product:', error);
      throw new Error(`Failed to get product with ID: ${id}`);
    }
  };

  const refreshProducts = async () => {
    await loadInitialData();
  };

  // Filter products by category
  const getProductsByCategory = (categoryName) => {
    return products.filter(product => 
      product.category === categoryName.toLowerCase()
    );
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        colors,
        loading,
        error,
        searchProducts,
        getProductById,
        refreshProducts,
        getProductsByCategory,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}