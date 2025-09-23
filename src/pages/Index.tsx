import Header from "@/components/Header";
import RegisterSection from "@/components/RegisterSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <RegisterSection />
        <div id="pricing" />
      </main>
    </div>
  );
};

export default Index;