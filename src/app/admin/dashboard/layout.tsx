'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import adminService, { AdminUser } from '@/lib/admin';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const currentAdmin = adminService.getCurrentAdmin();
    if (!currentAdmin) {
      router.push('/admin/login');
      return;
    }
    setAdmin(currentAdmin);
  }, [router, mounted]);

  const handleLogout = () => {
    adminService.logout();
    router.push('/admin/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: 'fas fa-tachometer-alt',
      permission: 'dashboard.view'
    },
    {
      title: 'Orders',
      href: '/admin/dashboard/orders',
      icon: 'fas fa-shopping-cart',
      permission: 'orders.view'
    },
    {
      title: 'Products',
      href: '/admin/dashboard/products',
      icon: 'fas fa-box',
      permission: 'products.view'
    },
    {
      title: 'Categories',
      href: '/admin/dashboard/categories',
      icon: 'fas fa-folder',
      permission: 'categories.view'
    },
    {
      title: 'Hot Deals',
      href: '/admin/dashboard/hot-deals',
      icon: 'fas fa-fire',
      permission: 'hot_deals.view'
    },
    {
      title: 'Customers',
      href: '/admin/dashboard/customers',
      icon: 'fas fa-users',
      permission: 'customers.view'
    },
    {
      title: 'Analytics',
      href: '/admin/dashboard/analytics',
      icon: 'fas fa-chart-bar',
      permission: 'analytics.view'
    },
    {
      title: 'Settings',
      href: '/admin/dashboard/settings',
      icon: 'fas fa-cog',
      permission: 'settings.view'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    adminService.hasPermission(item.permission)
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                  <img 
                    src="https://i.postimg.cc/gJRL0cdG/1758261543098.png" 
                    alt="Submonth Admin" 
                    className="h-8"
                  />
                  <span className="text-xl font-bold text-gray-900">Admin</span>
                </Link>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {admin.role.replace('_', ' ').toUpperCase()}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-600 text-white">
                        {admin.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{admin.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {admin.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard/settings" className="cursor-pointer">
                      <i className="fas fa-cog mr-2 h-4 w-4"></i>
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <i className="fas fa-sign-out-alt mr-2 h-4 w-4"></i>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {filteredMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <i className={`${item.icon} mr-3 h-4 w-4`}></i>
                  {item.title}
                </Link>
              ))}
            </nav>

            {/* Sidebar footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-600 text-white">
                    {admin.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {admin.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {admin.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}