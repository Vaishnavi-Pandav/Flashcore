import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import FeaturedProducts from "./components/FeaturedProducts";
import Marquee from "./components/Marquee";

function App() {
  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />
      <Hero />
      <Marquee />
      <FeaturedProducts />
    </div>
  );
}

export default App;
