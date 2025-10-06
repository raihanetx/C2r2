'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/helpers';
import { Product, CartItem, Modal, HotDeal, Category, SiteConfig } from '@/types';

export default function Home() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allProductsFlat, setAllProductsFlat] = useState<Product[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
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
  const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<Modal>({
    visible: false,
    type: 'info',
    title: '',
    message: ''
  });
  
  // For product detail view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  // For hero slider
  const [heroSlides, setHeroSlides] = useState({
    activeSlide: 0,
    hasImages: false,
    slides: [
      { url: '', text: 'Welcome to Submonth', bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-600' },
      { url: '', text: 'Premium Digital Subscriptions', bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-600' },
      { url: '', text: 'Affordable Prices', bgColor: 'bg-gradient-to-r from-green-500 to-teal-600' }
    ]
  });
  
  // Refs
  const categoryScrollerRef = useRef<HTMLDivElement>(null);
  const heroSliderRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const infoContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize data - run only once after component mounts
  useEffect(() => {
    // Load cart and currency from localStorage
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
    
    // Fetch data from APIs
    const fetchData = async () => {
      try {
        const [categoriesResponse, productsResponse, configResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
          fetch('/api/config')
        ]);
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setAllCategories(categoriesData.categories || []);
        }
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setAllProductsFlat(productsData);
        }
        
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
          message: 'Failed to load data. Please refresh the page.'
        });
      }
    };
    
    fetchData();
  }, []); // Empty dependency array - run only once

  // Group products by category whenever products change
  useEffect(() => {
    const grouped: Record<string, Product[]> = {};
    allProductsFlat.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    setProductsByCategory(grouped);
  }, [allProductsFlat]);
  
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
  
  // Hero slider auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlides(prev => ({
        ...prev,
        activeSlide: (prev.activeSlide + 1) % prev.slides.length
      }));
    }, siteConfig.hero_slider_interval);
    
    return () => clearInterval(interval);
  }, [siteConfig.hero_slider_interval]);
  
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
    const product = allProductsFlat.find(p => p.id === productId);
    setModal({
      visible: true,
      type: 'success',
      title: 'Added to Cart',
      message: `${product?.name} has been added to your cart.`
    });
  };

  const addToCartAndGoToCheckout = (productId: string, quantity: number) => {
    addToCart(productId, quantity);
    // Navigate to checkout after a short delay to show the success message
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 1000);
  };
  
  const closeModal = () => {
    setModal(prev => ({ ...prev, visible: false }));
  };
  
  const scrollCategories = (direction: number) => {
    if (categoryScrollerRef.current) {
      const scrollAmount = 200;
      categoryScrollerRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Prepare hot deals for rendering
  const hotDealsToRender = hotDeals.map(deal => {
    const product = allProductsFlat.find(p => p.id === deal.productId);
    if (!product) return null;
    
    return {
      href: `/${product.category_slug}/${product.slug}`,
      click_event: () => setSelectedProduct(product),
      image: product.image || 'https://via.placeholder.com/120x120.png?text=No+Image',
      name: deal.customTitle || product.name
    };
  }).filter(Boolean);
  
  // Duplicated deals for continuous scrolling
  const duplicatedDeals = [...hotDealsToRender, ...hotDealsToRender];
  
  // Calculate selected price
  const selectedPrice = selectedProduct ? selectedProduct.pricing[selectedDurationIndex].price : 0;
  const selectedPriceFormatted = formatPrice(selectedPrice, currency, siteConfig.usd_to_bdt_rate);
  
  // Format long description with line breaks
  const formattedLongDescription = selectedProduct?.long_description?.replace(/\n/g, '<br />') || '';
  
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

      {/* Side Menu */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setIsSideMenuOpen(false)} className="fixed inset-0 bg-black bg-opacity-50"></div>
          <div className="relative w-72 max-w-xs bg-white h-full shadow-xl p-6">
            <Button onClick={() => setIsSideMenuOpen(false)} variant="ghost" className="absolute top-4 right-4">
              <i className="fas fa-times text-xl"></i>
            </Button>
            <h2 className="text-2xl font-bold text-purple-600 mb-8">Menu</h2>
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-lg text-gray-700 hover:text-purple-600">Home</Link>
              <Link href="/about-us" className="text-lg text-gray-700 hover:text-purple-600">About Us</Link>
              <Link href="/privacy-policy" className="text-lg text-gray-700 hover:text-purple-600">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="text-lg text-gray-700 hover:text-purple-600">Terms & Conditions</Link>
              <Link href="/refund-policy" className="text-lg text-gray-700 hover:text-purple-600">Refund Policy</Link>
            </nav>
            <Separator className="my-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Categories</h3>
            <nav className="flex flex-col space-y-3">
              {allCategories.map(category => (
                <Link 
                  key={category.slug}
                  href={`/products/category/${category.slug}`} 
                  className="text-gray-600 hover:text-purple-600"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
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
            <Input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..." 
              className="w-full h-9 text-sm" 
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
            <Button onClick={() => setIsSideMenuOpen(true)} variant="ghost" size="sm">
              <i className="fas fa-bars text-xl"></i>
            </Button>
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
            <Input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for premium subscriptions, courses, and more..." 
              className="w-full"
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
            <Button onClick={() => setIsSideMenuOpen(true)} variant="ghost">
              <i className="fas fa-bars text-xl"></i>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="hero-section aspect-[2/1] md:aspect-[5/2] rounded-lg overflow-hidden" ref={heroSliderRef}>
          <div className="relative w-full h-full">
            {heroSlides.slides.map((slide, index) => (
              <div key={index} style={{ display: heroSlides.activeSlide === index ? 'flex' : 'none' }} className={`absolute inset-0 flex items-center justify-center h-full w-full ${slide.bgColor}`}>
                <span className="text-2xl md:text-4xl font-bold text-white/80 tracking-wider">{slide.text}</span>
              </div>
            ))}
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {heroSlides.slides.map((slide, index) => (
              <button 
                key={index}
                onClick={() => setHeroSlides(prev => ({ ...prev, activeSlide: index }))} 
                className={`w-2.5 h-2.5 rounded-full transition ${heroSlides.activeSlide === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </section>
        
        <section className="relative">
          <div className="text-center mt-6 mb-6 md:mt-8 md:mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Product Categories</h2>
          </div>
          <div className="max-w-7xl mx-auto">
            <div className="relative flex items-center justify-center gap-2 md:px-0">
              <button onClick={() => scrollCategories(-1)} className="hidden md:flex p-2 flex-shrink-0 z-10 items-center justify-center">
                <i className="fas fa-chevron-left text-2xl text-gray-500 hover:text-purple-600 transition-colors"></i>
              </button>
              <div className="overflow-hidden">
                <div className="horizontal-scroll smooth-scroll" ref={categoryScrollerRef}>
                  <div className="category-scroll-container">
                    {allCategories.length === 0 ? (
                      // Loading skeleton for categories
                      Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="flex flex-col items-center p-6 bg-gray-200 rounded-lg min-w-[100px]">
                            <div className="w-8 h-8 bg-gray-300 rounded-full mb-2"></div>
                            <div className="w-16 h-4 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      allCategories.map(category => (
                        <Link 
                          key={category.slug}
                          href={`/products/category/${category.slug}`} 
                          className="category-icon"
                        >
                          <i className={category.icon}></i>
                          <span>{category.name}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => scrollCategories(1)} className="hidden md:flex p-2 flex-shrink-0 z-10 items-center justify-center">
                <i className="fas fa-chevron-right text-2xl text-gray-500 hover:text-purple-600 transition-colors"></i>
              </button>
            </div>
          </div>
        </section>
        
        {/* Hot Deals Section */}
        {hotDealsToRender.length > 0 && (
          <section className="py-6 md:py-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl font-bold">Hot Deals</h2>
            </div>
            <div className="hot-deals-container">
              <div className="hot-deals-scroller" style={{ animationDuration: `${siteConfig.hot_deals_speed}s` }}>
                {duplicatedDeals.map((item, index) => (
                  <Link 
                    key={index}
                    href={item.href} 
                    className="hot-deal-card"
                    onClick={(e) => {
                      e.preventDefault();
                      item.click_event();
                    }}
                  >
                    <div className="hot-deal-image-container">
                      <img src={item.image} alt={item.name} className="hot-deal-image" />
                    </div>
                    <span className="hot-deal-title">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {Object.entries(productsByCategory).length === 0 ? (
          // Loading skeleton for products
          <section className="py-6">
            <div className="px-4 md:px-6">
              <h2 className="text-2xl font-bold mb-4">Loading Products...</h2>
              <div className="horizontal-scroll smooth-scroll">
                <div className="product-scroll-container">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-white rounded-lg shadow-sm w-[280px] flex-shrink-0">
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                        <div className="p-4">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                          <div className="h-6 bg-gray-200 rounded mb-2 w-1/2"></div>
                          <div className="h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          Object.entries(productsByCategory).map(([categoryName, products]) => (
            <section key={categoryName} className="py-6">
              <div className="flex justify-between items-center mb-4 px-4 md:px-6">
                <h2 className="text-2xl font-bold">{categoryName}</h2>
                <Link 
                  href={`/products/category/${products[0].category_slug}`} 
                  className="text-purple-600 font-bold hover:text-purple-700 flex items-center text-lg"
                >
                  View all <span className="ml-2 text-2xl font-bold">&raquo;</span>
                </Link>
              </div>
              <div className="horizontal-scroll smooth-scroll">
                <div className="product-scroll-container">
                  {products.map(product => (
                    <div key={product.id} className="product-card" onClick={() => setSelectedProduct(product)}>
                      <Link href={`/${product.category_slug}/${product.slug}`} className="contents">
                        <div className="product-card-image-container relative">
                          <img src={product.image || 'https://via.placeholder.com/400x300.png?text=No+Image'} alt={product.name} className="product-image" />
                          {product.stock_out && (
                            <div className="absolute top-2 right-2 bg-white text-red-600 text-xs font-bold px-3 py-1 rounded-full shadow-md">Stock Out</div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-1">{product.name}</h3>
                          <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2 preserve-whitespace">{product.description}</p>
                          <div className="text-purple-600 font-bold text-lg mb-2 mt-auto">{formatPrice(product.pricing[0].price, currency, siteConfig.usd_to_bdt_rate)}</div>
                          <button className="w-full text-purple-600 bg-transparent hover:bg-purple-50 font-semibold py-1 px-2 rounded-lg transition md:py-1 md:text-base text-sm flex items-center justify-center gap-2 border-2 border-purple-600">
                            View Details <i className="fas fa-arrow-up-right-from-square text-xs"></i>
                          </button>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))
        )}

        <section className="why-choose-us px-4 py-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
            <div className="feature-card bg-white p-4 rounded-xl text-center flex flex-col justify-center md:aspect-square border border-gray-200 shadow-sm">
              <div className="icon bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-dollar-sign text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-bold mb-1">Affordable Price</h3>
              <p className="text-sm text-gray-600 mt-2 md:text-center text-left">Get top-tier content without breaking the bank. Quality education for everyone.</p>
            </div>
            <div className="feature-card bg-white p-4 rounded-xl text-center flex flex-col justify-center md:aspect-square border border-gray-200 shadow-sm">
              <div className="icon bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-award text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-bold mb-1">Premium Quality</h3>
              <p className="text-sm text-gray-600 mt-2 md:text-center text-left">Expert-curated content to ensure the best learning experience and outcomes.</p>
            </div>
            <div className="feature-card bg-white p-4 rounded-xl text-center flex flex-col justify-center md:aspect-square border border-gray-200 shadow-sm">
              <div className="icon bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-shield-alt text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-bold mb-1">Trusted</h3>
              <p className="text-sm text-gray-600 mt-2 md:text-center text-left">Join thousands of satisfied learners on our platform, building skills and careers.</p>
            </div>
            <div className="feature-card bg-white p-4 rounded-xl text-center flex flex-col justify-center md:aspect-square border border-gray-200 shadow-sm">
              <div className="icon bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-lock text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-bold mb-1">Secure Payment</h3>
              <p className="text-sm text-gray-600 mt-2 md:text-center text-left">Your transactions are protected with encrypted payment gateways for peace of mind.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="product-detail-image-container rounded-lg overflow-hidden border">
                {isImageLoading && (
                  <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                )}
                <img 
                  src={selectedProduct.image || 'https://via.placeholder.com/400x400.png?text=No+Image'} 
                  alt={selectedProduct.name} 
                  onLoad={() => setIsImageLoading(false)} 
                  onError={() => setIsImageLoading(false)}
                  className={`w-full h-auto object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : ''}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-purple-600">{formatPrice(selectedProduct.pricing[selectedDurationIndex].price, currency, siteConfig.usd_to_bdt_rate)}</span>
                  {!selectedProduct.stock_out && (
                    <span className="text-sm font-semibold text-green-600">[In Stock]</span>
                  )}
                  {selectedProduct.stock_out && (
                    <span className="text-sm font-semibold text-red-600">[Stock Out]</span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                
                {selectedProduct.pricing.length > 1 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Duration</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.pricing.map((p, index) => (
                        <Button
                          key={index}
                          variant={selectedDurationIndex === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedDurationIndex(index)}
                        >
                          {p.duration}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => addToCart(selectedProduct.id, 1)} 
                    variant="outline"
                    className="flex-1"
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    onClick={() => addToCartAndGoToCheckout(selectedProduct.id, 1)} 
                    disabled={selectedProduct.stock_out}
                    className="flex-1"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'description' | 'reviews')}>
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <div 
                  className={`text-gray-700 leading-relaxed text-justify preserve-whitespace ${
                    !isDescriptionExpanded ? 'line-clamp-4' : ''
                  }`} 
                  dangerouslySetInnerHTML={{ __html: formattedLongDescription }}
                />
                {selectedProduct.long_description && selectedProduct.long_description.length > 300 && (
                  <Button 
                    variant="link" 
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-2 p-0"
                  >
                    {!isDescriptionExpanded ? 'See More' : 'See Less'}
                  </Button>
                )}
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-user-circle text-4xl mb-4"></i>
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
      
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
        
        .horizontal-scroll {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        .horizontal-scroll::-webkit-scrollbar {
          height: 6px;
        }
        
        .horizontal-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .horizontal-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        .horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .smooth-scroll {
          scroll-behavior: smooth;
        }
        
        .category-scroll-container {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          min-width: max-content;
        }
        
        .category-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
          text-decoration: none;
          color: inherit;
          min-width: 100px;
        }
        
        .category-icon:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .category-icon i {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #7c3aed;
        }
        
        .category-icon span {
          font-size: 0.875rem;
          font-weight: 500;
          text-align: center;
        }
        
        .product-scroll-container {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          min-width: max-content;
        }
        
        .product-card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
          cursor: pointer;
          width: 280px;
          flex-shrink: 0;
        }
        
        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .product-card-image-container {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
          border-radius: 0.75rem 0.75rem 0 0;
        }
        
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
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
        
        .hot-deals-container {
          overflow: hidden;
          position: relative;
        }
        
        .hot-deals-scroller {
          display: flex;
          gap: 1rem;
          animation: scroll-left 40s linear infinite;
        }
        
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .hot-deal-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
          text-decoration: none;
          color: inherit;
          min-width: 120px;
          flex-shrink: 0;
        }
        
        .hot-deal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .hot-deal-image-container {
          width: 80px;
          height: 80px;
          border-radius: 0.5rem;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .hot-deal-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .hot-deal-title {
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
          line-height: 1.2;
        }
        
        .product-detail-image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
        }
        
        .product-detail-title {
          font-size: 1.5rem;
          line-height: 1.2;
        }
        
        .duration-button-selected {
          background-color: #7c3aed !important;
          color: white !important;
          border-color: #7c3aed !important;
        }
      `}</style>
    </div>
  );
}