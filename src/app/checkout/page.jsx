'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api, { endpoints } from '../../lib/api';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();

  // States
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Canada',
    type: 'SHIPPING',
    isDefault: false
  });

  // Load addresses on component mount
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push('/cart');
    }
  }, [items, loading, router]);

  const loadAddresses = async () => {
    try {
      const response = await api.get(endpoints.addresses.list);
      setAddresses(response.data);
      
      // Auto-select default addresses
      const defaultShipping = response.data.find(addr => 
        addr.type === 'SHIPPING' && addr.isDefault
      );
      const defaultBilling = response.data.find(addr => 
        addr.type === 'BILLING' && addr.isDefault
      );
      
      if (defaultShipping) setSelectedShippingAddress(defaultShipping.id);
      if (defaultBilling) setSelectedBillingAddress(defaultBilling.id);
      if (defaultShipping && !defaultBilling) {
        setSelectedBillingAddress(defaultShipping.id);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post(endpoints.addresses.create, newAddress);
      setAddresses([...addresses, response.data.address]);
      setShowAddressForm(false);
      setNewAddress({
        firstName: '',
        lastName: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Canada',
        type: 'SHIPPING',
        isDefault: false
      });
    } catch (error) {
      console.error('Failed to add address:', error);
      alert('Failed to add address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Check if user is authenticated
    if (!user) {
      alert('Please log in to place an order');
      router.push('/login');
      return;
    }

    if (!selectedShippingAddress) {
      alert('Please select a shipping address');
      return;
    }

    if (!useSameAddress && !selectedBillingAddress) {
      alert('Please select a billing address');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        shippingAddressId: selectedShippingAddress,
        billingAddressId: useSameAddress ? selectedShippingAddress : selectedBillingAddress,
        paymentMethod: paymentMethod
      };

      console.log('Creating order with data:', orderData);
      const response = await api.post(endpoints.orders.create, orderData);
      console.log('Order created successfully:', response.data);
      
      // Get order ID and redirect immediately using hard navigation
      const orderId = response.data.order?.id || response.data.id;
      console.log('Redirecting to order:', orderId);
      
      // Use window.location for immediate redirect
      window.location.href = `/orders/${orderId}`;
      
      // Clear cart after navigation has started
      setTimeout(() => {
        clearCart().catch(error => {
          console.error('Cart clearing failed (non-blocking):', error);
        });
      }, 100);
    } catch (error) {
      console.error('Failed to place order:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Your session has expired. Please log in again.');
        router.push('/login');
      } else {
        alert(`Failed to place order: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.05; // 5% tax
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 100 ? 0 : 15; // Free shipping over $100
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to checkout</h2>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Forms */}
              <div className="space-y-8">
                {/* Shipping Address */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add New Address
                    </button>
                  </div>

                  <div className="space-y-3">
                    {addresses
                      .filter(addr => addr.type === 'SHIPPING' || addr.type === 'BOTH')
                      .map(address => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedShippingAddress === address.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedShippingAddress(address.id)}
                        >
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="shippingAddress"
                              checked={selectedShippingAddress === address.id}
                              onChange={() => setSelectedShippingAddress(address.id)}
                              className="mt-1 mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {address.firstName} {address.lastName}
                              </p>
                              <p className="text-gray-900">{address.streetAddress}</p>
                              <p className="text-gray-900">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p className="text-gray-900">{address.country}</p>
                              {address.isDefault && (
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Billing Address</h2>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useSameAddress}
                        onChange={(e) => setUseSameAddress(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-gray-900">Same as shipping address</span>
                    </label>
                  </div>

                  {!useSameAddress && (
                    <div className="space-y-3">
                      {addresses
                        .filter(addr => addr.type === 'BILLING' || addr.type === 'BOTH')
                        .map(address => (
                          <div
                            key={address.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              selectedBillingAddress === address.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedBillingAddress(address.id)}
                          >
                            <div className="flex items-start">
                              <input
                                type="radio"
                                name="billingAddress"
                                checked={selectedBillingAddress === address.id}
                                onChange={() => setSelectedBillingAddress(address.id)}
                                className="mt-1 mr-3"
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {address.firstName} {address.lastName}
                                </p>
                                <p className="text-gray-900">{address.streetAddress}</p>
                                <p className="text-gray-900">
                                  {address.city}, {address.state} {address.postalCode}
                                </p>
                                <p className="text-gray-900">{address.country}</p>
                                {address.isDefault && (
                                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Payment Method</h2>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe"
                          checked={paymentMethod === 'stripe'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Credit/Debit Card</span>
                          <p className="text-sm text-gray-900">
                            Secure payment processed by Stripe
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div>
                <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Summary</h2>
                  
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.productVariantId || 'default'}`} className="flex items-center">
                        <div className="relative w-16 h-16 mr-4">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded-lg"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-900">Qty: {item.quantity}</p>
                          {item.isPreorder && (
                            <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                              Preorder
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-900">
                      <span>Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-900">
                      <span>Tax</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-900">
                      <span>Shipping</span>
                      <span>
                        {calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg text-gray-900">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || !selectedShippingAddress}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>

                  <p className="text-xs text-gray-800 text-center mt-3">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Address</h3>
              <button
                onClick={() => setShowAddressForm(false)}
                className="text-gray-700 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.firstName}
                    onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.lastName}
                    onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.streetAddress}
                  onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Province/State *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Country *
                  </label>
                  <select
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Canada">Canada</option>
                    <option value="United States">United States</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Address Type
                </label>
                <select
                  value={newAddress.type}
                  onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SHIPPING">Shipping</option>
                  <option value="BILLING">Billing</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">Set as default address</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Adding...' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
