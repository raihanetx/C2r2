'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/helpers';
import { SiteConfig } from '@/types';

interface PaymentData {
  transactionID: string;
  paymentMethod: string;
  paymentAmount: string;
  paymentFee: string;
  currency: string;
  status: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    // Get payment data from URL parameters
    const params: PaymentData = {
      transactionID: searchParams.get('transactionID') || '',
      paymentMethod: searchParams.get('paymentMethod') || '',
      paymentAmount: searchParams.get('paymentAmount') || '',
      paymentFee: searchParams.get('paymentFee') || '',
      currency: searchParams.get('currency') || '',
      status: searchParams.get('status') || ''
    };

    setPaymentData(params);

    // Fetch site config
    fetchSiteConfig();

    // Verify payment and get order details
    if (params.transactionID) {
      verifyPayment(params.transactionID);
    } else {
      setVerificationStatus('error');
      setIsVerifying(false);
    }
  }, [searchParams]);

  const fetchSiteConfig = async () => {
    try {
      // Load admin config from localStorage (same as home page)
      const adminConfig = JSON.parse(localStorage.getItem('adminConfig') || '{}');
      if (adminConfig && Object.keys(adminConfig).length > 0) {
        setSiteConfig(adminConfig);
      }
    } catch (error) {
      console.error('Failed to fetch site config:', error);
    }
  };

  const verifyPayment = async (transactionId: string) => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transactionId
        })
      });

      const result = await response.json();

      if (result.success && result.data.status === 'COMPLETED') {
        setVerificationStatus('success');
        setOrderDetails(result.data);

        // Update order status in localStorage
        const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const orderId = result.data.meta_data?.orderId;
        
        if (orderId) {
          const orderIndex = existingOrders.findIndex((order: any) => order.id === orderId);
          if (orderIndex !== -1) {
            existingOrders[orderIndex].status = 'completed';
            existingOrders[orderIndex].paymentDetails = {
              transactionId: result.data.transaction_id,
              paymentMethod: result.data.payment_method,
              paidAmount: result.data.amount,
              currency: result.data.currency
            };
            localStorage.setItem('orderHistory', JSON.stringify(existingOrders));
          }
        }

        // Auto redirect to home after 3 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setVerificationStatus('error');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <i className="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
            </div>
            <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'error' || !paymentData) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500"></i>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-4">We couldn't verify your payment. Please contact support.</p>
            <Link href="/order-history">
              <Button className="bg-purple-600 hover:bg-purple-700">
                View Order History
              </Button>
            </Link>
          </CardContent>
        </Card>
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
        </div>

        <div className="hidden md:flex items-center w-full gap-5">
          <Link href="/" className="logo flex-shrink-0 flex items-center text-gray-800 no-underline">
            <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-9" />
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="text-center mb-8">
          <div className="mb-6">
            <i className="fas fa-check-circle text-6xl text-green-500"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600 mb-4">Thank you for your purchase. Your payment has been confirmed.</p>
          
          {/* Auto redirect notification */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <i className="fas fa-check-circle"></i>
              <span className="text-sm">Payment verified! You will be redirected to homepage automatically in 3 seconds</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-credit-card text-purple-600"></i>
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium">{paymentData.transactionID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{paymentData.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-green-600">
                    {formatPrice(parseFloat(paymentData.paymentAmount), paymentData.currency as 'USD' | 'BDT', siteConfig?.usd_to_bdt_rate || 110)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Fee:</span>
                  <span className="font-medium">
                    {formatPrice(parseFloat(paymentData.paymentFee), paymentData.currency as 'USD' | 'BDT', siteConfig?.usd_to_bdt_rate || 110)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600 capitalize">{paymentData.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-shopping-bag text-purple-600"></i>
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderDetails ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{orderDetails.fullname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{orderDetails.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{orderDetails.meta_data?.orderId}</span>
                  </div>
                  <Separator />
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Digital Products:</h4>
                    <div className="space-y-2">
                      {orderDetails.meta_data?.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} ({item.duration})</span>
                          <span>×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Loading order details...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Digital Delivery Notice */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <i className="fas fa-download text-2xl text-purple-600"></i>
              <h3 className="text-lg font-semibold">Digital Delivery</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Your digital products and access details have been sent to your email address. 
              Please check your inbox (including spam folder) for delivery instructions.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <i className="fas fa-check-circle"></i>
                <span className="font-medium">Instant Delivery Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
              <i className="fas fa-home mr-2"></i>
              Continue Shopping
            </Button>
          </Link>
          <Link href="/order-history">
            <Button variant="outline" className="w-full sm:w-auto">
              <i className="fas fa-receipt mr-2"></i>
              View Order History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}