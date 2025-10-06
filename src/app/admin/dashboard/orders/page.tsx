'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    duration: string;
  }>;
  totals: {
    subtotal: number;
    total: number;
  };
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  deliveryType: string;
  notes?: string;
  paymentStatus: string;
}

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: ''
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadOrders = () => {
    try {
      // Load orders from localStorage (for now)
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      
      // Transform to match our interface
      const transformedOrders: Order[] = storedOrders.map((order: any) => ({
        ...order,
        orderNumber: order.id,
        totals: {
          subtotal: order.subtotal || order.total || 0,
          total: order.total || order.subtotal || 0
        },
        paymentStatus: order.status === 'completed' ? 'paid' : 'pending'
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateOrder = () => {
    if (!selectedOrder) return;

    try {
      // Update order in localStorage
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const updatedOrders = storedOrders.map((order: any) => {
        if (order.id === selectedOrder.id) {
          return {
            ...order,
            status: updateForm.status || order.status,
            notes: updateForm.notes || order.notes,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      });

      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: updateForm.status || order.status, notes: updateForm.notes || order.notes }
          : order
      ));

      setIsUpdateDialogOpen(false);
      setSelectedOrder(null);
      setUpdateForm({ status: '', notes: '' });
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // One-click order actions
  const handleConfirmOrder = (orderId: string) => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const updatedOrders = storedOrders.map((order: any) => 
        order.id === orderId 
          ? { ...order, status: 'completed', paymentStatus: 'paid', updatedAt: new Date().toISOString() }
          : order
      );
      
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'completed', paymentStatus: 'paid' }
          : order
      ));
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const updatedOrders = storedOrders.map((order: any) => 
        order.id === orderId 
          ? { ...order, status: 'cancelled', paymentStatus: 'failed', updatedAt: new Date().toISOString() }
          : order
      );
      
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled', paymentStatus: 'failed' }
          : order
      ));
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleProcessOrder = (orderId: string) => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const updatedOrders = storedOrders.map((order: any) => 
        order.id === orderId 
          ? { ...order, status: 'processing', updatedAt: new Date().toISOString() }
          : order
      );
      
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'processing' }
          : order
      ));
    } catch (error) {
      console.error('Error processing order:', error);
    }
  };

  const openUpdateDialog = (order: Order) => {
    setSelectedOrder(order);
    setUpdateForm({
      status: order.status,
      notes: order.notes || ''
    });
    setIsUpdateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by order number, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters or search query'
                  : 'No orders have been placed yet'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link 
                          href={`/admin/dashboard/orders/${order.id}`}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-sm text-gray-500">{order.customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(order.totals.total, order.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/dashboard/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-eye"></i>
                            </Button>
                          </Link>
                          
                          {/* One-click actions */}
                          {order.status === 'pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleProcessOrder(order.id)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Mark as Processing"
                              >
                                <i className="fas fa-clock"></i>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleConfirmOrder(order.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Confirm Order"
                              >
                                <i className="fas fa-check"></i>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Cancel Order"
                              >
                                <i className="fas fa-times"></i>
                              </Button>
                            </>
                          )}
                          
                          {order.status === 'processing' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleConfirmOrder(order.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Confirm Order"
                              >
                                <i className="fas fa-check"></i>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Cancel Order"
                              >
                                <i className="fas fa-times"></i>
                              </Button>
                            </>
                          )}
                          
                          {order.status === 'completed' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Cancel Order"
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          )}
                          
                          {order.status === 'cancelled' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleProcessOrder(order.id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Reopen Order"
                            >
                              <i className="fas fa-redo"></i>
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openUpdateDialog(order)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Order Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Order Status</Label>
                <Select 
                  value={updateForm.status} 
                  onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Order Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this order..."
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateOrder}>
                  Update Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}