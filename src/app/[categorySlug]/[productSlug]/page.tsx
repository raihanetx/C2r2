'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/helpers';
import { Product, CartItem, Modal, SiteConfig } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { categorySlug, productSlug } = params as { categorySlug: string; productSlug: string };
  
  const [product, setProduct] = useState<Product | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    hero_banner: [],
    favicon: '',
    contact_info: {
      phone: '+880 1234-567890',
      whatsapp: '+880 1234-567890',
      email: 'info@submonth.com'
    },
    admin_password: 'password123',
    usd_to_bdt_rate: 110,
    site_logo: '',
    hero_slider_interval: 5000,
    hot_deals_speed: 40
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');
  const [modal, setModal] = useState<Modal>({
    visible: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Load cart and currency from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency === 'USD' || savedCurrency === 'BDT') {
        setCurrency(savedCurrency);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);
  
  // Fetch product and config data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all products and find the matching one
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const foundProduct = productsData.find((p: Product) => 
            p.category_slug === categorySlug && p.slug === productSlug
          );
          
          if (foundProduct) {
            setProduct(foundProduct);
          } else {
            setNotFound(true);
          }
        }
        
        // Fetch config
        const configResponse = await fetch('/api/config');
        if (configResponse.ok) {
          const configData = await configResponse.json();
          setSiteConfig(configData);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to load product. Please try again.'
        });
      }
    };
    
    if (categorySlug && productSlug) {
      fetchData();
    }
  }, [categorySlug, productSlug]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);
  
  // Save currency preference
  useEffect(() => {
    try {
      localStorage.setItem('currency', currency);
    } catch (error) {
      console.error('Error saving currency to localStorage:', error);
    }
  }, [currency]);
  
  // Functions
  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'BDT' : 'USD');
  };
  
  const addToCart = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { productId, quantity }];
      }
    });
    
    // Show success modal
    if (product) {
      setModal({
        visible: true,
        type: 'success',
        title: 'Added to Cart',
        message: `${product.name} has been added to your cart.`
      });
    }
  };

  const addToCartAndGoToCheckout = (productId: string, quantity: number) => {
    addToCart(productId, quantity);
    // Navigate to checkout after a short delay to show the success message
    setTimeout(() => {
      router.push('/checkout');
    }, 1000);
  };
  
  const closeModal = () => {
    setModal(prev => ({ ...prev, visible: false }));
  };
  
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate selected price
  const selectedPrice = product ? product.pricing[selectedDurationIndex].price : 0;
  const selectedPriceFormatted = formatPrice(selectedPrice, currency, siteConfig.usd_to_bdt_rate);
  
  // Format long description with line breaks
  const formattedLongDescription = product?.long_description?.replace(/\n/g, '<br />') || '';
  
  // If product not found, show 404 page
  if (notFound) {
    return (
      <div className="bg-gray-50 flex flex-col min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
            <p className="text-xl text-gray-500 mb-6">Product not found</p>
            <Link href="/" className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // NO LOADING STATE - Always render the page, data will load in place
  
  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      {/* Custom Modal Popup */}
      {modal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-sm text-center p-6">
            <div className="mb-4">
              <i className={`fas text-5xl ${
                modal.type === 'success' ? 'fa-check-circle text-green-500' :
                modal.type === 'error' ? 'fa-exclamation-circle text-red-500' :
                'fa-info-circle text-blue-500'
              }`}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{modal.title}</h3>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <Button onClick={closeModal} className="w-full">
              OK
            </Button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="header flex justify-between items-center px-4 bg-white shadow-md sticky top-0 z-40 h-16 md:h-20">
        {/* Mobile Header View */}
        <div className="flex items-center justify-between w-full md:hidden gap-2">
          <Link href="/" className="logo flex-shrink-0">
            {siteConfig.site_logo ? (
              <img src={siteConfig.site_logo} alt="Submonth Logo" className="h-8" />
            ) : (
              <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-8" />
            )}
          </Link>
          <div className="relative flex-1 min-w-0">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full h-9 text-sm border border-gray-300 rounded-md px-3" 
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={toggleCurrency} variant="ghost" size="sm" className="flex items-center gap-1">
              <i className="fas fa-dollar-sign"></i>
              <span className="text-sm">{currency}</span>
            </Button>
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-bag text-xl text-gray-600"></i>
              {cartCount > 0 && <span className="notification-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* Desktop Header View */}
        <div className="hidden md:flex items-center w-full gap-5">
          <Link href="/" className="logo flex-shrink-0 flex items-center text-gray-800 no-underline">
            {siteConfig.site_logo ? (
              <img src={siteConfig.site_logo} alt="Submonth Logo" className="h-9" />
            ) : (
              <img src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" alt="Submonth Logo" className="h-9" />
            )}
          </Link>
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search for premium subscriptions, courses, and more..." 
              className="w-full border border-gray-300 rounded-md px-4 py-2.5"
            />
          </div>
          <div className="flex-shrink-0 flex items-center gap-5">
            <Button onClick={toggleCurrency} variant="ghost" className="flex items-center gap-2">
              <i className="fas fa-dollar-sign text-xl"></i>
              <span>{currency}</span>
            </Button>
            <Link href="/products">
              <i className="fas fa-box-open text-xl text-gray-600"></i>
            </Link>
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-bag text-xl text-gray-600"></i>
              {cartCount > 0 && <span className="notification-badge">{cartCount}</span>}
            </Link>
            <Link href="/order-history">
              <i className="fas fa-receipt text-xl text-gray-600"></i>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-purple-600">Home</Link>
              <span className="text-gray-400">/</span>
              {product ? (
                <Link href={`/products/category/${product.category_slug}`} className="text-gray-500 hover:text-purple-600">
                  {product.category}
                </Link>
              ) : (
                <span className="text-gray-400">Loading...</span>
              )}
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">
                {product ? product.name : productSlug || 'Loading...'}
              </span>
            </nav>
          </div>
        </div>
        
        {/* Product Detail */}
        <div className="bg-white min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="product-detail-image-container rounded-lg overflow-hidden border">
                  {isImageLoading && (
                    <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                  )}
                  {product ? (
                    <img 
                      src={product.image || 'https://via.placeholder.com/400x400.png?text=No+Image'} 
                      alt={product.name} 
                      onLoad={() => setIsImageLoading(false)} 
                      onError={() => setIsImageLoading(false)}
                      className={`w-full h-auto object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : ''}`}
                    />
                  ) : (
                    <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">Loading image...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Product Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                      {product ? product.name : productSlug || 'Loading...'}
                    </h1>
                    {product && !product.stock_out && (
                      <span className="text-sm font-semibold text-green-600">[In Stock]</span>
                    )}
                    {product && product.stock_out && (
                      <span className="text-sm font-semibold text-red-600">[Stock Out]</span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {product ? product.description : 'Loading product description...'}
                  </p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-purple-600">
                      {product ? selectedPriceFormatted : 'Loading...'}
                    </span>
                  </div>
                  
                  {product && product.pricing.length > 1 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Select Duration</label>
                      <div className="flex flex-wrap gap-3">
                        {product.pricing.map((p, index) => (
                          <Button
                            key={index}
                            variant={selectedDurationIndex === index ? "default" : "outline"}
                            onClick={() => setSelectedDurationIndex(index)}
                          >
                            {p.duration}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 mb-6">
                    <Button 
                      onClick={() => product && addToCart(product.id, 1)} 
                      variant="outline"
                      className="flex-1"
                      disabled={!product}
                    >
                      <i className="fas fa-shopping-cart mr-2"></i>
                      Add to Cart
                    </Button>
                    <Button 
                      onClick={() => product && addToCartAndGoToCheckout(product.id, 1)} 
                      disabled={!product || (product && product.stock_out)}
                      className="flex-1"
                    >
                      <i className="fas fa-bolt mr-2"></i>
                      Buy Now
                    </Button>
                  </div>
                  
                  {/* Product Features */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Instant delivery after purchase
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        24/7 customer support
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Secure payment processing
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Money-back guarantee
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Product Details Tabs */}
              <div className="mt-12">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'description' | 'reviews')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-6">
                    <div className="prose max-w-none">
                      {product ? (
                        <>
                          <div 
                            className={`text-gray-700 leading-relaxed text-justify preserve-whitespace ${
                              !isDescriptionExpanded ? 'line-clamp-4' : ''
                            }`} 
                            dangerouslySetInnerHTML={{ __html: formattedLongDescription }}
                          />
                          {product.long_description && product.long_description.length > 300 && (
                            <Button 
                              variant="link" 
                              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                              className="mt-2 p-0"
                            >
                              {!isDescriptionExpanded ? 'See More' : 'See Less'}
                            </Button>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                          <p className="text-gray-500">Loading description...</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="reviews" className="mt-6">
                    <div className="text-center py-12 text-gray-500">
                      <i className="fas fa-user-circle text-6xl mb-4"></i>
                      <p className="text-xl mb-2">No reviews yet</p>
                      <p>Be the first to review this product!</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <style jsx>{`
        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #dc2626;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }
        
        .product-detail-image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
        }
        
        .line-clamp-4 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
        }
        
        .preserve-whitespace {
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}