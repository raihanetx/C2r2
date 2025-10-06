'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatPrice, calculateOrderTotals } from '@/lib/helpers';
import { CartItem, Product, SiteConfig } from '@/types';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');
  const [products, setProducts] = useState<Product[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
    setTimeout(() => setIsUpdating(false), 300);
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.productId !== productId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem('cart', JSON.stringify([]));
  };

  const toggleCurrency = () => {
    const newCurrency = currency === 'USD' ? 'BDT' : 'USD';
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  // Calculate totals using the unified function
  const { subtotal, tax, shipping, total } = calculateOrderTotals(cart, products);

  if (cart.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
          <div className="text-center py-12">
            <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
            <p className="text-xl text-gray-500 mb-6">Your cart is empty</p>
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <div className="flex items-center gap-4">
            <Button onClick={toggleCurrency} variant="outline" className="flex items-center gap-2">
              <i className="fas fa-dollar-sign"></i>
              <span>{currency}</span>
            </Button>
            <Button onClick={clearCart} variant="outline" className="text-red-600 hover:text-red-700">
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.map((item) => {
                const product = Array.isArray(products) ? products.find(p => p.id === item.productId) : null;
                if (!product) return null;

                return (
                  <Card key={item.productId}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                              <p className="text-sm text-gray-600">{product.description}</p>
                              {product.stock_out && (
                                <Badge variant="destructive" className="mt-2">Out of Stock</Badge>
                              )}
                            </div>
                            <Button 
                              onClick={() => removeFromCart(item.productId)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Button 
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                              >
                                <i className="fas fa-minus"></i>
                              </Button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <Button 
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                              >
                                <i className="fas fa-plus"></i>
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Price</p>
                              <p className="font-semibold text-lg text-purple-600">
                                {formatPrice(product.pricing[0].price, currency, siteConfig?.usd_to_bdt_rate || 110)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-medium">
                    {formatPrice(subtotal, currency, siteConfig?.usd_to_bdt_rate || 110)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-purple-600">
                    {formatPrice(total, currency, siteConfig?.usd_to_bdt_rate || 110)}
                  </span>
                </div>
                <div className="space-y-2 pt-4">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => window.location.href = '/checkout'}
                  >
                    Proceed to Checkout
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}