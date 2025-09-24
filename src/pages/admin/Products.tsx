import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, Edit, Trash2, Package, MoreHorizontal } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_1: number;
  price_10: number;
  price_50: number;
  price_100: number;
  category_id: string;
  categories?: { code: string; name: string };
}

interface Category {
  id: string;
  code: string;
  name: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price_1: '',
    price_10: '',
    price_50: '',
    price_100: '',
    category_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(*)')
          .order('code'),
        supabase
          .from('categories')
          .select('id, code, name')
          .order('code')
      ]);

      if (productsResult.error) {
        console.error('Supabase products error', productsResult.error);
        toast({ title: 'Failed to load products', description: (productsResult.error.message || String(productsResult.error)) });
        return;
      }
      if (categoriesResult.error) throw categoriesResult.error;

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateProductCode = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';

    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    return `${category.code}${(count || 0) + 1}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let code = '';
      if (!editingProduct) {
        code = await generateProductCode(formData.category_id);
      }

      const productData = {
        name: formData.name,
        description: formData.description || null,
        image_url: formData.image_url || null,
        price_1: parseFloat(formData.price_1),
        price_10: parseFloat(formData.price_10),
        price_50: parseFloat(formData.price_50),
        price_100: parseFloat(formData.price_100),
        category_id: formData.category_id,
        ...(code && { code })
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast({ title: "Success", description: "Product created successfully" });
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      image_url: product.image_url || '',
      price_1: product.price_1.toString(),
      price_10: product.price_10.toString(),
      price_50: product.price_50.toString(),
      price_100: product.price_100.toString(),
      category_id: product.category_id
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Product deleted successfully" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      price_1: '',
      price_10: '',
      price_50: '',
      price_100: '',
      category_id: ''
    });
    setEditingProduct(null);
  };

  const handleAddToCart = (product: Product) => {
    const savedCart = localStorage.getItem('wholesale-cart');
    let cart: any[] = savedCart ? JSON.parse(savedCart) : [];

    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ productId: product.id, quantity: 1, product });
    }

    localStorage.setItem('wholesale-cart', JSON.stringify(cart));
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Manage Products</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage products with tiered pricing
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category *</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.code} - {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Tiered Pricing *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="price_1" className="text-xs">1 piece</Label>
                      <Input
                        id="price_1"
                        type="number"
                        step="0.01"
                        value={formData.price_1}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_1: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_10" className="text-xs">10 pieces</Label>
                      <Input
                        id="price_10"
                        type="number"
                        step="0.01"
                        value={formData.price_10}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_10: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_50" className="text-xs">50 pieces</Label>
                      <Input
                        id="price_50"
                        type="number"
                        step="0.01"
                        value={formData.price_50}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_50: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_100" className="text-xs">100 pieces</Label>
                      <Input
                        id="price_100"
                        type="number"
                        step="0.01"
                        value={formData.price_100}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_100: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                  {editingProduct && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Products List */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Products ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-mono">
                              {product.code}
                            </span>
                            <h3 className="font-semibold">{product.name}</h3>
                            <span className="text-sm text-muted-foreground">
                              ({product.categories?.name})
                            </span>
                          </div>
                          {product.description && (
                            <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                          )}
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="text-center p-2 bg-accent/10 rounded">
                              <div className="font-semibold">1 pc</div>
                              <div>${product.price_1}</div>
                            </div>
                            <div className="text-center p-2 bg-accent/10 rounded">
                              <div className="font-semibold">10 pcs</div>
                              <div>${product.price_10}</div>
                            </div>
                            <div className="text-center p-2 bg-accent/10 rounded">
                              <div className="font-semibold">50 pcs</div>
                              <div>${product.price_50}</div>
                            </div>
                            <div className="text-center p-2 bg-accent/10 rounded">
                              <div className="font-semibold">100 pcs</div>
                              <div>${product.price_100}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleAddToCart(product)}>
                                Add to Cart
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/item/${product.id}`}>View Item Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(product)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(product.id)}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {products.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No products found. Create your first product to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;