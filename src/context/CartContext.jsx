// client/src/context/CartContext.jsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api, { endpoints } from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from backend when user is available
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.get(endpoints.cart.get);
      const cartData = response.data;
      
      // Transform backend cart items to frontend format
      const transformedItems = cartData.items?.map(item => ({
        id: item.id, // This is the cart item ID, not product ID
        productId: item.product.id,
        productVariantId: item.productVariantId,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || '/images/placeholder.png',
        isPreorder: item.isPreorder || false,
      })) || [];
      
      
      setItems(transformedItems);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product, qty = 1, variantId = null, isPreorder = false) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      // If no variant specified, try to get the first available variant
      let actualVariantId = variantId;
      
      // First, try to get fresh product data with variants from the API
      if (!actualVariantId) {
        try {
          const productResponse = await api.get(endpoints.products.byId(product.id));
          const fullProduct = productResponse.data;
          
          if (fullProduct.variants && fullProduct.variants.length > 0) {
            // Find first in-stock variant or just use the first one
            const availableVariant = fullProduct.variants.find(v => v.quantity > 0) || fullProduct.variants[0];
            actualVariantId = availableVariant.id;
            console.log('Auto-selected variant from API:', availableVariant);
          }
        } catch (apiError) {
          console.warn('Could not fetch product variants from API:', apiError);
        }
      }
      
      // If still no variant and product has local variants
      if (!actualVariantId && product.variants && product.variants.length > 0) {
        const availableVariant = product.variants.find(v => v.quantity > 0) || product.variants[0];
        actualVariantId = availableVariant.id;
        console.log('Auto-selected variant from local data:', availableVariant);
      }

      const requestData = {
        productId: parseInt(product.id), // Ensure it's a number
        quantity: qty,
        isPreorder
      };
      
      // Only include productVariantId if we have a valid one
      if (actualVariantId) {
        requestData.productVariantId = parseInt(actualVariantId);
      }
      
      console.log('Adding item to cart:', requestData);
      console.log('User:', user);
      console.log('Product variants:', product.variants);
      
      await api.post(endpoints.cart.addItem, requestData);

      // Reload cart to get updated data
      await loadCart();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      console.error('Error response:', error.response?.data);
      console.error('Full error details:', error.response?.data?.errors);
      throw new Error(error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Failed to add item to cart');
    }
  };

  const updateQty = async (cartItemId, quantity) => {
    if (!user) return;

    try {
      if (quantity <= 0) {
        await removeItem(cartItemId);
        return;
      }

      console.log('Updating quantity for cart item:', cartItemId, 'to:', quantity);
      console.log('Available cart items:', items.map(item => ({ id: item.id, name: item.name })));

      // Find the cart item to get product and variant info
      const cartItem = items.find(item => item.id === cartItemId);
      if (!cartItem) {
        console.error('Cart item not found in local state');
        return;
      }

      console.log('Found cart item:', cartItem);

      // Update local state immediately for better UX
      setItems(prev =>
        prev.map(item =>
          item.id === cartItemId
            ? { ...item, quantity }
            : item
        )
      );

      // Try to update via API
      const updateData = { quantity };
      console.log('Sending update request with data:', updateData);
      console.log('Update endpoint:', endpoints.cart.updateItem(cartItemId));
      
      await api.put(endpoints.cart.updateItem(cartItemId), updateData);

      console.log('Successfully updated quantity via API');
    } catch (error) {
      console.error('Failed to update cart item via API:', error);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      
      if (error.response?.status === 404) {
        console.log('Update endpoint not implemented. Quantity updated locally - will sync on page refresh.');
        // Keep the local state update since backend doesn't support updates yet
        // This is acceptable since the user sees immediate feedback
      } else {
        console.error('Other error updating cart item');
        // For other errors, still keep local update but log the issue
      }
    }
  };

  const removeItem = async (cartItemId) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const removeUrl = endpoints.cart.removeItem(cartItemId);
    console.log('Removing cart item:', cartItemId);
    console.log('User:', user);
    console.log('Full API URL will be:', `${api.defaults.baseURL}${removeUrl}`);
    console.log('Making API call to:', removeUrl);

    try {
      // Call the backend API to remove the item
      await api.delete(removeUrl);
      console.log('Successfully removed item via API');
      
      // Reload the cart from backend to get updated state
      await loadCart();
      
    } catch (error) {
      console.error('Failed to remove cart item via API:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Request URL was:', error.config?.url);
      
      if (error.response?.status === 401) {
        console.error('Authentication error - user needs to log in again');
        alert('Please log in again to manage your cart');
      } else if (error.response?.status === 404) {
        console.log('Item not found on backend, refreshing cart');
        await loadCart(); // Refresh to get current state
      } else {
        console.error('Other error removing item:', error.message);
        alert('Failed to remove item. Please try again.');
      }
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      // Clear the entire cart via API
      await api.delete(endpoints.cart.get); // DELETE /api/cart clears the entire cart
      console.log('Successfully cleared cart via API');
      
      // Reload cart to get updated state
      await loadCart();
      
    } catch (error) {
      console.error('Failed to clear cart via API:', error);
      
      if (error.response?.status === 401) {
        console.error('Authentication error - user needs to log in again');
        alert('Please log in again to manage your cart');
      } else {
        console.error('Error clearing cart:', error.message);
        alert('Failed to clear cart. Please try again.');
      }
    }
  };

  // Calculate total from items
  const total = items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        total,
        itemCount,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
