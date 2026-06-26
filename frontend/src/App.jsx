import Hero from "./components/Hero";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />
      <Hero />
      <div className="h-screen bg-black flex items-center justify-center">
        <p className="text-gray-600 text-xl font-medium tracking-wide animate-pulse">More commerce goodness below...</p>
      </div>
    </div>
  );
}

export default App;
