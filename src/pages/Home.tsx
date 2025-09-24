import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Package, Store, ShoppingCart, Users, ArrowRight, Eye } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_1: number;
  categories: {
    code: string;
    name: string;
  };
}

interface Category {
  id: string;
  code: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, isBusinessOwner } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            categories (*)
          `)
          .limit(6)
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .limit(4)
          .order('code')
      ]);

      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setFeaturedProducts(productsResult.data || []);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Wholesale Made Simple
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with suppliers, browse products, and manage your wholesale business all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Button size="lg" asChild>
                    <Link to="/auth">
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/signup">
                      Register Business
                      <Store className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="flex gap-4">
                  <Button size="lg" asChild>
                    <Link to="/products">
                      Browse Products
                      <Package className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/dashboard">
                      Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Product Categories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our wide range of wholesale product categories
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-16 h-16 mx-auto mb-4 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <Badge variant="outline" className="mb-2 font-mono">
                      {category.code}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/products">
                  View All Products
                  <Eye className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Featured Products</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Check out our latest and most popular wholesale products
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <Package className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="font-mono">
                        {product.code}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {product.categories.name}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        Starting at ${product.price_1}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per piece
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link to="/products">
                  View All Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make wholesale trading simple, efficient, and profitable
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Wide Product Range</h3>
              <p className="text-muted-foreground">
                Access thousands of wholesale products across multiple categories
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Tiered Pricing</h3>
              <p className="text-muted-foreground">
                Get better prices with volume discounts and bulk ordering
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Trusted Partners</h3>
              <p className="text-muted-foreground">
                Work with verified suppliers and trusted business partners
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Wholesale Trading?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using our platform to streamline their wholesale operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Register Your Business
                  <Store className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;