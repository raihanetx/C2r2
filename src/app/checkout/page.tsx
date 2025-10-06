'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice, calculateOrderTotals } from '@/lib/helpers';
import { CartItem, Product, SiteConfig } from '@/types';

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');
  const [products, setProducts] = useState<Product[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Simplified form for digital products
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    // Load currency preference
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency === 'USD' || savedCurrency === 'BDT') {
      setCurrency(savedCurrency);
    }

    // Load admin-managed data from localStorage (same as home page)
    const loadData = async () => {
      try {
        const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        const adminConfig = JSON.parse(localStorage.getItem('adminConfig') || '{}');
        
        if (adminProducts.length > 0) {
          setProducts(adminProducts);
        } else {
          // Fallback to mock data if no admin data
          const { mockProducts } = await import('@/lib/data');
          setProducts(mockProducts);
        }
        
        if (adminConfig && Object.keys(adminConfig).length > 0) {
          setSiteConfig(adminConfig);
        } else {
          // Fallback to mock config if no admin data
          const { mockSiteConfig } = await import('@/lib/data');
          setSiteConfig(mockSiteConfig);
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
        // Fallback to mock data on error
        try {
          const { mockProducts, mockSiteConfig } = await import('@/lib/data');
          setProducts(mockProducts);
          setSiteConfig(mockSiteConfig);
        } catch (fallbackError) {
          console.error('Error loading fallback data:', fallbackError);
        }
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'BDT' : 'USD');
    localStorage.setItem('currency', currency);
  };

  // Calculate totals using the unified function
  const { subtotal, tax, shipping, total } = calculateOrderTotals(cart, products);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        alert('Please fill in all required fields.');
        setIsProcessing(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address.');
        setIsProcessing(false);
        return;
      }

      // Generate order number
      const orderNumber = 'ORD-' + Date.now().toString().slice(-8);
      
      // Prepare order items with correct pricing based on currency
      const orderItems = cart.map(item => {
        const product = Array.isArray(products) ? products.find(p => p.id === item.productId) : null;
        const basePrice = product?.pricing[0].price || 0;
        const finalPrice = currency === 'BDT' 
          ? basePrice * (siteConfig?.usd_to_bdt_rate || 110)
          : basePrice;
        
        return {
          productId: item.productId,
          name: product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: finalPrice,
          duration: product?.pricing[0].duration
        };
      });

      // Calculate totals in the selected currency for order record
      const convertedSubtotal = currency === 'BDT' 
        ? subtotal * (siteConfig?.usd_to_bdt_rate || 110)
        : subtotal;
      const convertedTotal = currency === 'BDT' 
        ? total * (siteConfig?.usd_to_bdt_rate || 110)
        : total;

      // Store order in localStorage first (pending status)
      const order = {
        id: orderNumber,
        date: new Date().toISOString(),
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone
        },
        items: orderItems,
        totals: { 
          subtotal: convertedSubtotal, 
          tax, 
          shipping, 
          total: convertedTotal 
        },
        currency,
        status: 'pending',
        deliveryType: 'digital',
        notes: formData.notes
      };

      // Save order to order history
      const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      existingOrders.push(order);
      localStorage.setItem('orderHistory', JSON.stringify(existingOrders));

      // Create payment with RupantorPay
      try {
        // Get the current origin for proper redirect
        const currentOrigin = window.location.origin;
        console.log('Checkout - Current origin:', currentOrigin);
        
        const paymentResponse = await fetch('/api/payment/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': currentOrigin
          },
          body: JSON.stringify({
            customerName: `${formData.firstName} ${formData.lastName}`,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            items: orderItems,
            totalAmount: currency === 'BDT' 
              ? (total * (siteConfig?.usd_to_bdt_rate || 110)).toFixed(0)
              : total.toFixed(2),
            currency: currency,
            orderId: orderNumber
          })
        });

        console.log('Checkout - Sending amount to RupantorPay:', {
          currency,
          originalTotal: total,
          convertedAmount: currency === 'BDT' 
            ? (total * (siteConfig?.usd_to_bdt_rate || 110)).toFixed(0)
            : total.toFixed(2),
          rate: siteConfig?.usd_to_bdt_rate || 110
        });

        const paymentResult = await paymentResponse.json();

        if (paymentResult.success && paymentResult.payment_url) {
          // Log the payment URL for debugging
          console.log('Redirecting to RupantorPay payment URL:', paymentResult.payment_url);
          
          // Add a small delay to ensure the order is saved
          setTimeout(() => {
            // Redirect to actual RupantorPay payment page
            window.location.href = paymentResult.payment_url;
          }, 500);
        } else {
          // Handle payment creation error
          console.error('Payment creation failed:', paymentResult.error);
          alert(`Payment initialization failed: ${paymentResult.error || 'Unknown error'}`);
          
          // Remove the pending order
          const updatedOrders = existingOrders.filter((o: any) => o.id !== orderNumber);
          localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
        }
      } catch (paymentError) {
        console.error('Payment service error:', paymentError);
        alert('Payment service is currently unavailable. Please try again later.');
        
        // Remove the pending order
        const updatedOrders = existingOrders.filter((o: any) => o.id !== orderNumber);
        localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      }

    } catch (error) {
      console.error('Order processing error:', error);
      alert('An error occurred while processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <div className="text-center py-12">
            <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some digital products to your cart before checkout.</p>
            <div className="space-y-4">
              <Link href="/">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Continue Shopping
                </Button>
              </Link>
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Add sample items to cart for testing
                    const sampleCart = [
                      { productId: '1', quantity: 1 },
                      { productId: '2', quantity: 1 }
                    ];
                    setCart(sampleCart);
                    localStorage.setItem('cart', JSON.stringify(sampleCart));
                  }}
                >
                  Add Sample Items (for testing)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <div className="text-center py-12">
            <div className="mb-6">
              <i className="fas fa-check-circle text-6xl text-green-500"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Complete!</h1>
            <p className="text-xl text-gray-600 mb-6">Thank you for your purchase.</p>
            <p className="text-gray-600 mb-4">Your digital products will be delivered to your email.</p>
            <p className="text-gray-600 mb-8">Order confirmation has been sent to {formData.email}</p>
            <div className="space-y-4">
              <Link href="/">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Continue Shopping
                </Button>
              </Link>
              <div>
                <Link href="/order-history" className="text-purple-600 hover:text-purple-700">
                  View Order History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout - Submonth</title>
      </Head>
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
              {cart.length > 0 && <span className="notification-badge">{cart.length}</span>}
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
              {cart.length > 0 && <span className="notification-badge">{cart.length}</span>}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Digital Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your digital product order below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-user text-purple-600"></i>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                    />
                    <p className="text-sm text-gray-500 mt-1">Digital products will be delivered to this email</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-sticky-note text-purple-600"></i>
                    Order Notes (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any special instructions or notes for your order..."
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-credit-card text-purple-600"></i>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-check-circle text-green-600"></i>
                        <span className="font-medium text-green-800">RupantorPay Payment System</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Secure payment processing via RupantorPay. 
                        You will be redirected to the payment gateway to complete your purchase.
                      </p>
                    </div>
                    <div className="text-center py-4">
                      <i className="fas fa-credit-card text-4xl text-purple-600 mb-2"></i>
                      <p className="text-gray-600">Secure Payment Processing</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <i className="fas fa-lock text-green-600"></i>
                        <span className="text-sm text-gray-500">SSL Encrypted Transaction</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="mt-8">
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock"></i>
                      Complete Payment with RupantorPay
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  <i className="fas fa-shield-alt mr-1"></i>
                  Secure payment processing via RupantorPay gateway
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-shopping-bag text-purple-600"></i>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cart.map(item => {
                    const product = Array.isArray(products) ? products.find(p => p.id === item.productId) : null;
                    if (!product) return null;
                    
                    return (
                      <div key={item.productId} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-cube text-gray-400 text-xl"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {product.pricing[0].duration} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(product.pricing[0].price * item.quantity, currency, siteConfig?.usd_to_bdt_rate || 110)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>{formatPrice(subtotal, currency, siteConfig?.usd_to_bdt_rate || 110)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Delivery</span>
                    <span>Instant (Digital)</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-purple-600">
                    {formatPrice(total, currency, siteConfig?.usd_to_bdt_rate || 110)}
                  </span>
                </div>

                <Button 
                  type="submit" 
                  form="checkout-form"
                  className="w-full bg-purple-600 hover:bg-purple-700 mt-6"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock mr-2"></i>
                      Pay with RupantorPay
                    </>
                  )}
                </Button>

                <div className="text-center mt-4">
                  <Link href="/cart" className="text-sm text-purple-600 hover:text-purple-700">
                    ← Back to Cart
                  </Link>
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <i className="fas fa-shield-alt"></i>
                    <span className="font-medium">Secure Digital Delivery</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Instant delivery to your email after purchase
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}