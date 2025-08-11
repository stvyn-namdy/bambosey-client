// client/src/context/ProductsContext.jsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api, { endpoints } from "../lib/api";

const ProductsContext = createContext({
  products: [],
  categories: [],
  colors: [],
  loading: true,
  searchProducts: async () => {},
  getProductById: async () => {},
  refreshProducts: async () => {},
});

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Only fetch products and colors since categories endpoint doesn't exist in backend
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
        console.warn('Failed to fetch products from backend, using fallback data:', productsRes.reason);
        // Use fallback data from local file
        const { products: fallbackProducts } = await import('../data/products');
        productsData = fallbackProducts;
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
        console.warn('Failed to fetch colors from backend, using fallback data:', colorsRes.reason);
        const { colors: fallbackColors } = await import('../data/products');
        colorsData = fallbackColors;
      }

      const transformedProducts = transformProducts(productsData, categoriesData, colorsData);
      setProducts(transformedProducts);
      setCategories(categoriesData);
      setColors(colorsData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Use fallback data as last resort
      try {
        const { products: fallbackProducts, categories: fallbackCategories, colors: fallbackColors } = await import('../data/products');
        setProducts(transformProducts(fallbackProducts, fallbackCategories, fallbackColors));
        setCategories(fallbackCategories);
        setColors(fallbackColors);
      } catch (fallbackError) {
        console.error('Failed to load fallback data:', fallbackError);
      }
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
      return [];
    }
  };

  const getProductById = async (id) => {
    try {
      const response = await api.get(endpoints.products.byId(id));
      const product = response.data;
      return transformProducts([product])[0];
    } catch (error) {
      console.error('Failed to get product:', error);
      return null;
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
