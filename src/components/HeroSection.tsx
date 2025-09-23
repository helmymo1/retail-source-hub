import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-wholesale.jpg";
import { Building2, Users, Package } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-subtle overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Professional wholesale warehouse" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Wholesale Made
            <span className="block bg-gradient-to-r from-accent to-primary-glow bg-clip-text text-transparent">
              Simple
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto">
            Connect with verified suppliers, browse thousands of products, 
            and grow your business with competitive wholesale pricing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              Register Your Shop
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Browse Products
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="bg-primary-foreground/20 p-4 rounded-full mb-3">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-primary-foreground/80">Registered Shops</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-primary-foreground/20 p-4 rounded-full mb-3">
                <Package className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-primary-foreground/80">Products Available</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-primary-foreground/20 p-4 rounded-full mb-3">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-primary-foreground/80">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;