import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import RegisterSection from "@/components/RegisterSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <div id="categories">
          <CategoriesSection />
        </div>
        <div id="products">
          <FeaturedProducts />
        </div>
        <div id="register">
          <RegisterSection />
        </div>
      </main>
    </div>
  );
};

export default Index;