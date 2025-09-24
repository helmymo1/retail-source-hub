import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package } from 'lucide-react';

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

const ItemPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error: any) {
        toast({
          title: 'Error fetching product',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-2xl text-muted-foreground mb-4">Product not found</p>
        <Button variant="outline" asChild>
          <Link to="/admin/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/admin/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Product Details</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Package className="w-6 h-6" />
              <div className="flex-1">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-mono mr-3">
                  {product.code}
                </span>
                {product.name}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {product.image_url && (
              <div className="flex justify-center">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="rounded-lg max-h-64 object-cover"
                />
              </div>
            )}

            {product.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-2">Category</h3>
              <p className="text-muted-foreground">{product.categories?.name || 'N/A'}</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Tiered Pricing</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="font-semibold text-sm">1 piece</div>
                  <div className="text-xl font-bold">${product.price_1}</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="font-semibold text-sm">10 pieces</div>
                  <div className="text-xl font-bold">${product.price_10}</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="font-semibold text-sm">50 pieces</div>
                  <div className="text-xl font-bold">${product.price_50}</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="font-semibold text-sm">100 pieces</div>
                  <div className="text-xl font-bold">${product.price_100}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItemPage;
