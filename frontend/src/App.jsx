import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Landing page sections
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Categories from "./components/Categories";
import FeaturedProducts from "./components/FeaturedProducts";
import Testimonials from "./components/Testimonials";
import CtaSection from "./components/CtaSection";

// Pages
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";

// ── Home Sections ────────────────────────────────────────────────────────────
const Home = () => (
  <div>
    <Hero />
    <Marquee />
    <Categories />
    <FeaturedProducts />
    <Testimonials />
    <CtaSection />
  </div>
);

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
      </Routes>
    </div>
  );
}

export default App;
