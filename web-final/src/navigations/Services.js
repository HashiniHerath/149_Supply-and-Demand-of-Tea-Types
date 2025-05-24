import React from "react";
import Nav from "../components/nav/Nav";
import HeroSlider from "../components/hero/Hero";
import BlogCards from "../components/blog/BlogContainer";
import Footer from "../components/footer/Footer";

const Services = () => {
  return (
    <div className="open-page">
      {/* Header Section */}
      <Nav />

      {/* Hero Section */}
      <HeroSlider />


      {/* Blog Section */}
      <BlogCards />

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Services;
