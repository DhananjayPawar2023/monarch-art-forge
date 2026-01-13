import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Artists from "./pages/Artists";
import Collections from "./pages/Collections";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminArtworks from "./pages/AdminArtworks";
import AdminAnalytics from "./pages/AdminAnalytics";
import ArtistDashboard from "./pages/ArtistDashboard";
import CollectorDashboard from "./pages/CollectorDashboard";
import Journal from "./pages/Journal";
import JournalPostDetail from "./pages/JournalPostDetail";
import ApplyArtist from "./pages/ApplyArtist";
import AdminArtworkEdit from "./pages/AdminArtworkEdit";
import ForArtists from "./pages/ForArtists";
import ForCollectors from "./pages/ForCollectors";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import SecondaryMarket from "./pages/SecondaryMarket";
import MyListings from "./pages/MyListings";
import Mint from "./pages/Mint";
import NFTGallery from "./pages/NFTGallery";
import ArtworkDetail from "./pages/ArtworkDetail";
import ArtistDetail from "./pages/ArtistDetail";
import CollectionDetail from "./pages/CollectionDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/artists" element={<Artists />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/about" element={<About />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/artworks" element={<AdminArtworks />} />
                <Route path="/admin/artwork/edit/:id" element={<AdminArtworkEdit />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/artist-dashboard" element={<ArtistDashboard />} />
                <Route path="/collector-dashboard" element={<CollectorDashboard />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/journal/:slug" element={<JournalPostDetail />} />
                <Route path="/apply-artist" element={<ApplyArtist />} />
                <Route path="/for-artists" element={<ForArtists />} />
                <Route path="/for-collectors" element={<ForCollectors />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/secondary-market" element={<SecondaryMarket />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/mint" element={<Mint />} />
                <Route path="/nfts" element={<NFTGallery />} />
                <Route path="/artwork/:id" element={<ArtworkDetail />} />
                <Route path="/artist/:slug" element={<ArtistDetail />} />
                <Route path="/collection/:slug" element={<CollectionDetail />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
