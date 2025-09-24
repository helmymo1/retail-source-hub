import { useEffect, useState, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Plus,
  Settings,
  LogOut
} from 'lucide-react';

interface DashboardStats {
  totalShops: number;
  totalProducts: number;
  pendingOrders: number;
  totalCategories: number;
}

const Dashboard = () => {
  const { user, signOut, isAdmin, isBusinessOwner } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalShops: 0,
    totalProducts: 0,
    pendingOrders: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    } else if (isBusinessOwner) {
      fetchBusinessStats();
    } else {
      setLoading(false);
    }
  }, [isAdmin, isBusinessOwner, fetchAdminStats, fetchBusinessStats]);

  const fetchAdminStats = useCallback(async () => {
    try {
      const [shopsResult, productsResult, ordersResult, categoriesResult] = await Promise.all([
        supabase.from('shops').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('categories').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalShops: shopsResult.count || 0,
        totalProducts: productsResult.count || 0,
        pendingOrders: ordersResult.count || 0,
        totalCategories: categoriesResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBusinessStats = useCallback(async () => {
    try {
      // Get business owner's shop
      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (shop) {
        const [productsResult, ordersResult] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('shop_id', shop.id)
        ]);

        setStats({
          totalShops: 1,
          totalProducts: productsResult.count || 0,
          pendingOrders: ordersResult.count || 0,
          totalCategories: 0
        });
      }
    } catch (error) {
      console.error('Error fetching business stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin && !isBusinessOwner) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isAdmin ? 'Admin Dashboard' : 'Business Dashboard'}
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/"><Settings className="w-4 h-4 mr-2" />Settings</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalShops}</div>
                <p className="text-xs text-muted-foreground">Registered businesses</p>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Available products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? 'Pending Orders' : 'My Orders'}
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? 'Awaiting approval' : 'Total orders placed'}
              </p>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCategories}</div>
                <p className="text-xs text-muted-foreground">Product categories</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isAdmin ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-start">
                    <Link to="/admin/shops">
                      <Building className="w-4 h-4 mr-2" />
                      Manage Shops
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/categories">
                      <Package className="w-4 h-4 mr-2" />
                      Manage Categories
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/products">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Manage Products
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/orders">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Manage Orders
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-start">
                    <Link to="/register">
                      <Plus className="w-4 h-4 mr-2" />
                      Register New Business
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/categories/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/products/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Business Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-start">
                    <Link to="/products">
                      <Package className="w-4 h-4 mr-2" />
                      Browse Products
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/cart">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      My Cart
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-start">
                    <Link to="/cart">
                      <Plus className="w-4 h-4 mr-2" />
                      Place New Order
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;