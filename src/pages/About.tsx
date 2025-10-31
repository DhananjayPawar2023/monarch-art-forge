import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-serif font-medium mb-12">
              About Monarch Gallery
            </h1>
            
            <div className="space-y-8 text-lg leading-relaxed text-muted-foreground">
              <p>
                Monarch Gallery is a curator-led platform that bridges the worlds of digital and physical art,
                creating a space where stories and artworks converge.
              </p>
              
              <p>
                We believe every piece of art carries a narrative — a journey from concept to creation.
                Through audio stories, artist profiles, and carefully curated collections, we invite collectors
                to connect with the deeper meaning behind each work.
              </p>
              
              <p>
                Our platform empowers artists to share their vision and collectors to discover pieces that
                resonate with their aesthetic and values. Whether through traditional mediums or blockchain
                technology, we celebrate art in all its forms.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
