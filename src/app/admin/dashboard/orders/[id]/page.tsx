'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    productId: string;
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
  paymentId?: string;
  updatedAt?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: ''
  });
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  const loadOrder = (id: string) => {
    try {
      // Load orders from localStorage (for now)
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const foundOrder = storedOrders.find((order: any) => order.id === id);
      
      if (foundOrder) {
        // Transform to match our interface
        const transformedOrder: Order = {
          ...foundOrder,
          orderNumber: foundOrder.id,
          paymentStatus: foundOrder.status === 'completed' ? 'paid' : 'pending'
        };
        setOrder(transformedOrder);
        setUpdateForm({
          status: transformedOrder.status,
          notes: transformedOrder.notes || ''
        });
      } else {
        setUpdateMessage('Order not found');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setUpdateMessage('Error loading order');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string = 'USD'): string => {
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
    if (!order) return;

    try {
      // Update order in localStorage
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const updatedOrders = storedOrders.map((order: any) => {
        if (order.id === orderId) {
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
      setOrder(prev => prev ? {
        ...prev,
        status: updateForm.status || prev.status,
        notes: updateForm.notes || prev.notes,
        updatedAt: new Date().toISOString()
      } : null);

      setUpdateMessage('Order updated successfully!');
      setIsUpdateDialogOpen(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error updating order:', error);
      setUpdateMessage('Error updating order');
    }
  };

  const openUpdateDialog = () => {
    if (order) {
      setUpdateForm({
        status: order.status,
        notes: order.notes || ''
      });
      setIsUpdateDialogOpen(true);
    }
  };

  const sendStatusUpdateEmail = async () => {
    if (!order) return;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: order.customer.email,
          subject: `Order Status Update - ${order.orderNumber}`,
          template: 'order-status-update',
          data: {
            customerName: order.customer.name,
            orderNumber: order.orderNumber,
            status: order.status,
            orderDate: new Date(order.date).toLocaleDateString(),
            total: formatPrice(order.totals.total, order.currency)
          }
        })
      });

      if (response.ok) {
        setUpdateMessage('Status update email sent successfully!');
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        setUpdateMessage('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setUpdateMessage('Error sending email');
    }
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

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link href="/admin/dashboard/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Update Message */}
      {updateMessage && (
        <Alert className={updateMessage.includes('success') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={updateMessage.includes('success') ? 'text-green-800' : 'text-red-800'}>
            {updateMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/dashboard/orders">
              <Button variant="ghost" size="sm">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Orders
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600 mt-2">Order {order.orderNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
          <Button onClick={openUpdateDialog}>
            <i className="fas fa-edit mr-2"></i>
            Update Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Type</p>
                  <p className="font-medium capitalize">{order.deliveryType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {order.updatedAt 
                      ? new Date(order.updatedAt).toLocaleDateString()
                      : new Date(order.date).toLocaleDateString()
                    }
                  </p>
                </div>
              </div>

              {order.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Order Notes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Duration: {item.duration}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(item.price, order.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price * item.quantity, order.currency)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.totals.subtotal, order.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-purple-600">
                      {formatPrice(order.totals.total, order.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{order.customer.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={openUpdateDialog}
                className="w-full"
                variant="outline"
              >
                <i className="fas fa-edit mr-2"></i>
                Update Status
              </Button>
              
              <Button 
                onClick={sendStatusUpdateEmail}
                className="w-full"
                variant="outline"
              >
                <i className="fas fa-envelope mr-2"></i>
                Send Status Email
              </Button>

              {order.status === 'completed' && (
                <Button className="w-full" variant="outline">
                  <i className="fas fa-download mr-2"></i>
                  Download Invoice
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Order Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}