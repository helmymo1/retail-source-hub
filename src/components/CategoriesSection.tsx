import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import categoryA from "@/assets/category-a.jpg";
import categoryB from "@/assets/category-b.jpg";
import categoryC from "@/assets/category-c.jpg";
import { ArrowRight, Package, Laptop, Home } from "lucide-react";

const categories = [
  {
    code: "A",
    name: "Office & Stationery",
    description: "Complete office supplies and stationery products",
    image: categoryA,
    icon: Package,
    productCount: "2,500+ Products",
    color: "from-blue-500 to-blue-600"
  },
  {
    code: "B", 
    name: "Electronics & Tech",
    description: "Latest electronics and technology accessories",
    image: categoryB,
    icon: Laptop,
    productCount: "1,800+ Products",
    color: "from-purple-500 to-purple-600"
  },
  {
    code: "C",
    name: "Home & Lifestyle",
    description: "Home decor and lifestyle essentials",
    image: categoryC,
    icon: Home,
    productCount: "3,200+ Products", 
    color: "from-green-500 to-green-600"
  }
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Explore Our Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse through our carefully curated product categories with competitive wholesale pricing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.code} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden border-0 shadow-card">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80 group-hover:opacity-70 transition-opacity duration-300`} />
                  
                  {/* Category Code Badge */}
                  <div className="absolute top-4 left-4 bg-primary-foreground/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">{category.code}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className="absolute top-4 right-4 bg-primary-foreground/20 backdrop-blur-sm rounded-full p-3">
                    <IconComponent className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {category.description}
                  </p>
                  <div className="text-sm font-medium text-accent mb-4">
                    {category.productCount}
                  </div>
                  <Button variant="business" className="w-full group">
                    View Category
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;