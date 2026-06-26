import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import FeaturedProducts from "./components/FeaturedProducts";

function App() {
  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />
      <Hero />
      <FeaturedProducts />
    </div>
  );
}

export default App;
