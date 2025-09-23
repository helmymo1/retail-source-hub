import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye, TrendingUp } from "lucide-react";

const featuredProducts = [
  {
    code: "A1",
    name: "Premium Office Desk Set",
    category: "Office & Stationery",
    image: "/placeholder.svg",
    prices: {
      1: 89.99,
      10: 79.99,
      50: 69.99,
      100: 59.99
    },
    description: "Complete desk organizer with premium materials",
    trending: true
  },
  {
    code: "B2", 
    name: "Wireless Charging Station",
    category: "Electronics & Tech",
    image: "/placeholder.svg", 
    prices: {
      1: 49.99,
      10: 44.99,
      50: 39.99,
      100: 34.99
    },
    description: "Fast wireless charging for multiple devices",
    trending: false
  },
  {
    code: "C5",
    name: "Modern Table Lamp",
    category: "Home & Lifestyle", 
    image: "/placeholder.svg",
    prices: {
      1: 129.99,
      10: 119.99,
      50: 109.99,
      100: 99.99
    },
    description: "Elegant LED table lamp with adjustable brightness",
    trending: true
  },
  {
    code: "A7",
    name: "Professional Notebook Set",
    category: "Office & Stationery",
    image: "/placeholder.svg",
    prices: {
      1: 24.99,
      10: 22.99,
      50: 19.99,
      100: 17.99
    },
    description: "High-quality notebooks for business use",
    trending: false
  }
];

const FeaturedProducts = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Featured Products
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our best-selling products with competitive tiered pricing for bulk orders.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {featuredProducts.map((product) => (
            <Card key={product.code} className="group hover:shadow-elegant transition-all duration-300 border-0 shadow-card overflow-hidden">
              <div className="relative">
                <div className="h-48 bg-muted flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground/50" />
                </div>
                
                {/* Badges */}
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="font-semibold">
                    {product.code}
                  </Badge>
                </div>
                
                {product.trending && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="destructive" className="bg-accent hover:bg-accent">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-foreground">
                  {product.name}
                </h3>
                <p className="text-sm text-accent mb-2 font-medium">
                  Category {product.category.charAt(0)}
                </p>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                {/* Pricing Tiers */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="bg-secondary/50 rounded p-2 text-center">
                    <div className="font-semibold text-foreground">1 pc</div>
                    <div className="text-muted-foreground">${product.prices[1]}</div>
                  </div>
                  <div className="bg-secondary/50 rounded p-2 text-center">
                    <div className="font-semibold text-foreground">10+ pcs</div>
                    <div className="text-accent font-semibold">${product.prices[10]}</div>
                  </div>
                  <div className="bg-secondary/50 rounded p-2 text-center">
                    <div className="font-semibold text-foreground">50+ pcs</div>
                    <div className="text-accent font-semibold">${product.prices[50]}</div>
                  </div>
                  <div className="bg-accent/10 rounded p-2 text-center border border-accent/20">
                    <div className="font-semibold text-accent">100+ pcs</div>
                    <div className="text-accent font-bold">${product.prices[100]}</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="business" className="flex-1">
                    <Eye className="w-3 h-3" />
                    View
                  </Button>
                  <Button size="sm" variant="default" className="flex-1">
                    <ShoppingCart className="w-3 h-3" />
                    Inquiry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button variant="hero" size="lg" className="px-12">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

const Package = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

export default FeaturedProducts;