'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Order {
  id: string;
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    duration: string;
  }[];
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  currency: 'USD' | 'BDT';
  status: 'pending' | 'completed' | 'cancelled';
  deliveryType: 'digital';
  notes?: string;
  paymentDetails?: {
    transactionId: string;
    paymentMethod: string;
    paidAmount: string;
    currency: string;
  };
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');

  useEffect(() => {
    // Load currency preference
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency === 'USD' || savedCurrency === 'BDT') {
      setCurrency(savedCurrency);
    }

    // Load orders from localStorage
    const savedOrders = localStorage.getItem('orderHistory');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      } catch (error) {
        console.error('Error parsing orders:', error);
      }
    }
  }, []);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'BDT' : 'USD');
    localStorage.setItem('currency', currency);
  };

  const formatPrice = (price: number, currency: string, rate: number): string => {
    if (currency === 'USD') {
      return `$${price.toFixed(2)}`;
    } else {
      return `৳${(price * rate).toFixed(0)}`;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <div className="text-center py-12">
            <i className="fas fa-receipt text-6xl text-gray-300 mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h1>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="header flex justify-between items-center px-4 bg-white shadow-md sticky top-0 z-40 h-16 md:h-20">
        <div className="flex items-center justify-between w-full md:hidden gap-2">
          <Link href="/" className="logo flex-shrink-0">
            <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-8" />
          </Link>
          <div className="flex items-center gap-3">
            <Button onClick={toggleCurrency} variant="ghost" size="sm" className="flex items-center gap-1">
              <i className="fas fa-dollar-sign"></i>
              <span className="text-sm">{currency}</span>
            </Button>
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-bag text-xl text-gray-600"></i>
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center w-full gap-5">
          <Link href="/" className="logo flex-shrink-0 flex items-center text-gray-800 no-underline">
            <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-9" />
          </Link>
          <div className="flex-shrink-0 flex items-center gap-5 ml-auto">
            <Button onClick={toggleCurrency} variant="ghost" className="flex items-center gap-2">
              <i className="fas fa-dollar-sign text-xl"></i>
              <span>{currency}</span>
            </Button>
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-bag text-xl text-gray-600"></i>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
          <p className="text-gray-600 mt-2">View and track your past orders</p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.id}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <p className="text-lg font-bold text-purple-600 mt-2">
                      {formatPrice(order.totals.total, currency, 110)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                  <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Order Items:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity} • {item.duration}</p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity, currency, 110)}
                      </p>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatPrice(order.totals.subtotal, currency, 110)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>{formatPrice(order.totals.tax, currency, 110)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span>{formatPrice(order.totals.shipping, currency, 110)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-lg text-purple-600">
                        {formatPrice(order.totals.total, currency, 110)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {order.status === 'completed' && (
                    <>
                      <Button variant="outline" size="sm">
                        Download Invoice
                      </Button>
                      {order.paymentDetails && (
                        <div className="text-xs text-gray-500 flex items-center">
                          <i className="fas fa-check-circle text-green-500 mr-1"></i>
                          Paid via {order.paymentDetails.paymentMethod}
                        </div>
                      )}
                    </>
                  )}
                  {order.status === 'pending' && (
                    <Button variant="outline" size="sm">
                      Complete Payment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}