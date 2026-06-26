import React, { memo } from 'react';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import Testimonials from '../components/Testimonials';
import CtaSection from '../components/CtaSection';

// Home is its own lazy chunk. All heavy landing sections are co-located here.
const Home = memo(() => (
  <div>
    <Hero />
    <Marquee />
    <Categories />
    <FeaturedProducts />
    <Testimonials />
    <CtaSection />
  </div>
));

export default Home;
