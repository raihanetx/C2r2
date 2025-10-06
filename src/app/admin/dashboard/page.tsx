'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  activeCoupons: number;
  totalCoupons: number;
  recentOrders: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeCoupons: 0,
    totalCoupons: 0,
    recentOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load orders from PostgreSQL API
      const ordersResponse = await fetch('/api/admin/orders');
      let orders = [];
      
      if (ordersResponse.ok) {
        orders = await ordersResponse.json();
      } else {
        // Fallback to localStorage if API fails
        orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      }
      
      // Load coupons from API
      const couponsResponse = await fetch('/api/admin/coupons');
      let coupons = [];
      
      if (couponsResponse.ok) {
        coupons = await couponsResponse.json();
      }
      
      // Calculate stats
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
      const completedOrders = orders.filter((order: any) => order.status === 'completed').length;
      const activeCoupons = coupons.filter((coupon: any) => coupon.status === 'active').length;
      const totalCoupons = coupons.length;

      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
        .slice(0, 5);

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        activeCoupons,
        totalCoupons,
        recentOrders
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number | undefined, currency: string = 'USD'): string => {
    if (price === undefined || price === null) {
      return currency === 'USD' ? '$0.00' : '৳0';
    }
    if (currency === 'USD') {
      return `$${price.toFixed(2)}`;
    } else {
      return `৳${(price * 110).toFixed(0)}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <i className="fas fa-shopping-cart text-purple-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <i className="fas fa-dollar-sign text-green-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Coupons</CardTitle>
            <i className="fas fa-ticket-alt text-orange-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCoupons}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalCoupons} total coupons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            <i className="fas fa-clock text-yellow-600"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-gray-500 mt-1">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/dashboard/orders">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{order.id}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.customer.name} • {order.customer.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">
                        {formatPrice(order.total, order.currency)}
                      </p>
                      <Link href={`/admin/dashboard/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/dashboard/orders">
              <Button className="w-full justify-start" variant="outline">
                <i className="fas fa-shopping-cart mr-2"></i>
                Manage Orders
              </Button>
            </Link>
            <Link href="/admin/dashboard/products">
              <Button className="w-full justify-start" variant="outline">
                <i className="fas fa-box mr-2"></i>
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/dashboard/categories">
              <Button className="w-full justify-start" variant="outline">
                <i className="fas fa-folder mr-2"></i>
                Manage Categories
              </Button>
            </Link>
            <Link href="/admin/dashboard/coupons">
              <Button className="w-full justify-start" variant="outline">
                <i className="fas fa-ticket-alt mr-2"></i>
                Manage Coupons
              </Button>
            </Link>
            <Link href="/admin/dashboard/hot-deals">
              <Button className="w-full justify-start" variant="outline">
                <i className="fas fa-fire mr-2"></i>
                Manage Hot Deals
              </Button>
            </Link>
            <Link href="/admin/dashboard/analytics">
              <Button className="w-full justify-start" variant="outline">
                <i className="fas fa-chart-bar mr-2"></i>
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}