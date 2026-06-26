import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import FeaturedProducts from "./components/FeaturedProducts";
import Marquee from "./components/Marquee";
import Categories from "./components/Categories";

function App() {
  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />
      <Hero />
      <Marquee />
      <Categories />
      <FeaturedProducts />
    </div>
  );
}

export default App;
