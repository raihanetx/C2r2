'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteConfig } from '@/types';

interface PaymentData {
  transactionID: string;
  paymentMethod: string;
  paymentAmount: string;
  paymentFee: string;
  currency: string;
  status: string;
}

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
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

    // Auto redirect to home after 5 seconds
    const redirectTimer = setTimeout(() => {
      window.location.href = '/';
    }, 5000);

    return () => clearTimeout(redirectTimer);
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
            <i className="fas fa-times-circle text-6xl text-red-500"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
          <p className="text-xl text-gray-600 mb-4">Your payment has been cancelled. No charges were made.</p>
          
          {/* Auto redirect notification */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <i className="fas fa-info-circle"></i>
              <span className="text-sm">You will be redirected to homepage automatically in 5 seconds</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-credit-card text-red-600"></i>
                Cancelled Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentData?.transactionID ? (
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
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{paymentData.paymentAmount} {paymentData.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-red-600 capitalize">{paymentData.status}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No payment details available.</p>
              )}
            </CardContent>
          </Card>

          {/* Help Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-question-circle text-purple-600"></i>
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Why was my payment cancelled?</h4>
                  <p className="text-sm text-gray-600">
                    You may have cancelled the payment manually, or there was an issue with the payment process.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Was I charged?</h4>
                  <p className="text-sm text-gray-600">
                    No, since the payment was cancelled, no charges were made to your account.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Contact Support</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <i className="fas fa-phone mr-2"></i>
                      {siteConfig?.contact_info?.phone || '+880 1234-567890'}
                    </p>
                    <p className="text-gray-600">
                      <i className="fas fa-envelope mr-2"></i>
                      {siteConfig?.contact_info?.email || 'info@submonth.com'}
                    </p>
                    <p className="text-gray-600">
                      <i className="fab fa-whatsapp mr-2"></i>
                      {siteConfig?.contact_info?.whatsapp || '+880 1234-567890'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link href="/checkout">
            <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
              <i className="fas fa-redo mr-2"></i>
              Try Again
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" className="w-full sm:w-auto">
              <i className="fas fa-shopping-cart mr-2"></i>
              View Cart
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full sm:w-auto">
              <i className="fas fa-home mr-2"></i>
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Security Notice */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <i className="fas fa-shield-alt text-2xl text-green-600"></i>
              <h3 className="text-lg font-semibold">Your Security is Guaranteed</h3>
            </div>
            <p className="text-gray-600">
              Rest assured that your payment information is secure. Since the payment was cancelled, 
              no financial transactions were processed. Your cart items are still available for purchase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}