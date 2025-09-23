import Header from "@/components/Header";
import RegisterSection from "@/components/RegisterSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div id="register">
          <RegisterSection />
        </div>
      </main>
    </div>
  );
};

export default Index;