'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import api, { endpoints } from '../../../lib/api';
import Image from 'next/image';

export default function OrderDetailsPage({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    if (user && id) {
      loadOrder();
    }
  }, [user, id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.orders.byId(id));
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to load order:', error);
      // If order not found or unauthorized, redirect
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSubtotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  };

  const calculateTax = () => {
    // Use order's stored tax amount if available, otherwise calculate 5% tax
    if (order?.taxAmount) {
      return parseFloat(order.taxAmount);
    }
    return calculateSubtotal() * 0.05;
  };

  const calculateShipping = () => {
    // Use order's stored shipping amount if available, otherwise calculate based on subtotal
    if (order?.shippingAmount !== undefined && order?.shippingAmount !== null) {
      return parseFloat(order.shippingAmount);
    }
    return calculateSubtotal() > 100 ? 0 : 15; // Free shipping over $100
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your orders</h2>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <button
            onClick={() => router.push('/orders')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message (if coming from checkout) */}
        {typeof window !== 'undefined' && window.location.search.includes('success=true') && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Order placed successfully!
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Thank you for your purchase. We'll send you shipping updates as your order progresses.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                <p className="text-gray-300">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="flex gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    Payment {order.paymentStatus}
                  </span>
                </div>
                <p className="text-2xl font-bold">${parseFloat(order.totalAmount).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Items */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Items</h2>
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center border-b pb-4">
                      <div className="relative w-20 h-20 mr-4">
                        <Image
                          src={item.product?.images?.[0] || '/images/placeholder.png'}
                          alt={item.product?.name || 'Product'}
                          fill
                          className="object-cover rounded-lg"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-black">{item.product?.name}</h3>
                        <p className="text-sm text-gray-900">
                          {item.productVariant?.color?.name && (
                            <span>Color: {item.productVariant.color.name} </span>
                          )}
                          {item.productVariant?.size?.name && (
                            <span>Size: {item.productVariant.size.name}</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-900">Quantity: {item.quantity}</p>
                        {item.isPreorder && (
                          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mt-1">
                            Preorder
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${parseFloat(item.price).toFixed(2)} each</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-gray-900">Order Summary</h3>
                  <div className="space-y-2">
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
                </div>
              </div>

              {/* Shipping & Billing Info */}
              <div className="space-y-6">
                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Shipping Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p className="text-gray-900">{order.shippingAddress.streetAddress}</p>
                      <p className="text-gray-900">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </p>
                      <p className="text-gray-900">{order.shippingAddress.country}</p>
                    </div>
                  </div>
                )}

                {/* Billing Address */}
                {order.billingAddress && (
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Billing Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900">
                        {order.billingAddress.firstName} {order.billingAddress.lastName}
                      </p>
                      <p className="text-gray-900">{order.billingAddress.streetAddress}</p>
                      <p className="text-gray-900">
                        {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                      </p>
                      <p className="text-gray-900">{order.billingAddress.country}</p>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Payment Method</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="capitalize text-gray-900">{order.paymentMethod}</p>
                    {order.paymentIntentId && (
                      <p className="text-sm text-gray-900 mt-1">
                        Payment ID: {order.paymentIntentId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tracking Information */}
                {order.trackingNumber && (
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Tracking Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900">Tracking Number:</p>
                      <p className="text-blue-600 font-mono">{order.trackingNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3">
            <button
              onClick={() => router.push('/orders')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              View All Orders
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </button>
            {order.status === 'DELIVERED' && (
              <button
                onClick={() => router.push(`/orders/${order.id}/review`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Leave Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
