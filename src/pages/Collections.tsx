import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Collections = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">
              Collections
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Curated collections coming soon
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Collections;
