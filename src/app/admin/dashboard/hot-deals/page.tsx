'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  category_slug: string;
  slug: string;
}

interface HotDeal {
  id: string;
  productId: string;
  customTitle?: string;
  customImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HotDealsManagementPage() {
  const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredHotDeals, setFilteredHotDeals] = useState<HotDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHotDeal, setSelectedHotDeal] = useState<HotDeal | null>(null);
  
  // Form states
  const [createForm, setCreateForm] = useState({
    productId: '',
    customTitle: '',
    customImage: '',
    isActive: true
  });

  const [editForm, setEditForm] = useState({
    productId: '',
    customTitle: '',
    customImage: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterHotDeals();
  }, [hotDeals, searchQuery, statusFilter]);

  const loadData = () => {
    try {
      // Load hot deals from localStorage
      const storedHotDeals = JSON.parse(localStorage.getItem('adminHotDeals') || '[]');
      
      // Load products from localStorage
      const storedProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      
      // If no hot deals exist, create some default ones
      if (storedHotDeals.length === 0) {
        const defaultHotDeals = [
          {
            id: '1',
            productId: '1',
            customTitle: 'Canva Pro - 50% Off',
            customImage: '',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            productId: '2',
            customTitle: '',
            customImage: '',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('adminHotDeals', JSON.stringify(defaultHotDeals));
        setHotDeals(defaultHotDeals);
      } else {
        setHotDeals(storedHotDeals);
      }

      setProducts(storedProducts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterHotDeals = () => {
    let filtered = hotDeals;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(hotDeal => {
        const product = products.find(p => p.id === hotDeal.productId);
        return product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               hotDeal.customTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(hotDeal => 
        statusFilter === 'active' ? hotDeal.isActive : !hotDeal.isActive
      );
    }

    setFilteredHotDeals(filtered);
  };

  const handleCreateHotDeal = () => {
    try {
      const newHotDeal: HotDeal = {
        id: Date.now().toString(),
        productId: createForm.productId,
        customTitle: createForm.customTitle || undefined,
        customImage: createForm.customImage || undefined,
        isActive: createForm.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedHotDeals = [...hotDeals, newHotDeal];
      setHotDeals(updatedHotDeals);
      localStorage.setItem('adminHotDeals', JSON.stringify(updatedHotDeals));

      // Reset form
      setCreateForm({
        productId: '',
        customTitle: '',
        customImage: '',
        isActive: true
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating hot deal:', error);
    }
  };

  const handleUpdateHotDeal = () => {
    if (!selectedHotDeal) return;

    try {
      const updatedHotDeal: HotDeal = {
        ...selectedHotDeal,
        productId: editForm.productId,
        customTitle: editForm.customTitle || undefined,
        customImage: editForm.customImage || undefined,
        isActive: editForm.isActive,
        updatedAt: new Date().toISOString()
      };

      const updatedHotDeals = hotDeals.map(hotDeal =>
        hotDeal.id === selectedHotDeal.id ? updatedHotDeal : hotDeal
      );
      setHotDeals(updatedHotDeals);
      localStorage.setItem('adminHotDeals', JSON.stringify(updatedHotDeals));

      setIsEditDialogOpen(false);
      setSelectedHotDeal(null);
    } catch (error) {
      console.error('Error updating hot deal:', error);
    }
  };

  const handleDeleteHotDeal = (hotDealId: string) => {
    if (confirm('Are you sure you want to delete this hot deal?')) {
      try {
        const updatedHotDeals = hotDeals.filter(hotDeal => hotDeal.id !== hotDealId);
        setHotDeals(updatedHotDeals);
        localStorage.setItem('adminHotDeals', JSON.stringify(updatedHotDeals));
      } catch (error) {
        console.error('Error deleting hot deal:', error);
      }
    }
  };

  const handleToggleStatus = (hotDealId: string) => {
    try {
      const updatedHotDeals = hotDeals.map(hotDeal =>
        hotDeal.id === hotDealId 
          ? { ...hotDeal, isActive: !hotDeal.isActive, updatedAt: new Date().toISOString() }
          : hotDeal
      );
      setHotDeals(updatedHotDeals);
      localStorage.setItem('adminHotDeals', JSON.stringify(updatedHotDeals));
    } catch (error) {
      console.error('Error toggling hot deal status:', error);
    }
  };

  const openEditDialog = (hotDeal: HotDeal) => {
    setSelectedHotDeal(hotDeal);
    setEditForm({
      productId: hotDeal.productId,
      customTitle: hotDeal.customTitle || '',
      customImage: hotDeal.customImage || '',
      isActive: hotDeal.isActive
    });
    setIsEditDialogOpen(true);
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const getProductImage = (productId: string, customImage?: string) => {
    if (customImage) return customImage;
    const product = products.find(p => p.id === productId);
    return product?.image || 'https://via.placeholder.com/60x60.png?text=No+Image';
  };

  const getDisplayTitle = (productId: string, customTitle?: string) => {
    if (customTitle) return customTitle;
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hot Deals Management</h1>
          <p className="text-gray-600 mt-2">Manage featured hot deals on homepage</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredHotDeals.length} {filteredHotDeals.length === 1 ? 'Hot Deal' : 'Hot Deals'}
          </Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Add Hot Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Hot Deal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Select value={createForm.productId} onValueChange={(value) => setCreateForm(prev => ({ ...prev, productId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customTitle">Custom Title (Optional)</Label>
                  <Input
                    id="customTitle"
                    value={createForm.customTitle}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, customTitle: e.target.value }))}
                    placeholder="Leave empty to use product name"
                  />
                </div>

                <div>
                  <Label htmlFor="customImage">Custom Image URL (Optional)</Label>
                  <Input
                    id="customImage"
                    value={createForm.customImage}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, customImage: e.target.value }))}
                    placeholder="Leave empty to use product image"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={createForm.isActive}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateHotDeal} className="flex-1">
                    Create Hot Deal
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search hot deals..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hot Deals Table */}
      <Card>
        <CardContent className="p-6">
          {filteredHotDeals.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-fire text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-gray-500 mb-2">No hot deals found</p>
              <p className="text-gray-400">Get started by adding your first hot deal</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hot Deal</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Custom Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHotDeals.map((hotDeal) => (
                    <TableRow key={hotDeal.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={getProductImage(hotDeal.productId, hotDeal.customImage)} 
                            alt={getDisplayTitle(hotDeal.productId, hotDeal.customTitle)}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="font-medium">
                            {getDisplayTitle(hotDeal.productId, hotDeal.customTitle)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getProductName(hotDeal.productId)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {hotDeal.customTitle || (
                            <span className="text-gray-400">Using product name</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(hotDeal.id)}
                          className={`${
                            hotDeal.isActive 
                              ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                              : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Badge className={hotDeal.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {hotDeal.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(hotDeal.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(hotDeal)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHotDeal(hotDeal.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <i className="fas fa-trash"></i>
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

      {/* Edit Hot Deal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Hot Deal</DialogTitle>
          </DialogHeader>
          {selectedHotDeal && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-product">Product</Label>
                <Select value={editForm.productId} onValueChange={(value) => setEditForm(prev => ({ ...prev, productId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-customTitle">Custom Title (Optional)</Label>
                <Input
                  id="edit-customTitle"
                  value={editForm.customTitle}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customTitle: e.target.value }))}
                  placeholder="Leave empty to use product name"
                />
              </div>

              <div>
                <Label htmlFor="edit-customImage">Custom Image URL (Optional)</Label>
                <Input
                  id="edit-customImage"
                  value={editForm.customImage}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customImage: e.target.value }))}
                  placeholder="Leave empty to use product image"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateHotDeal} className="flex-1">
                  Update Hot Deal
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}