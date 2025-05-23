import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./hero.css";
import CustomButton from "../buttons/CustomButton";

function HeroSlider() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: `${process.env.PUBLIC_URL}/images/bg_2.jpg`,
      title: "Investigate Tea Trends",
      subtitle: "Analyze global and local market trends influencing Sri Lankan tea.",
      buttonText: "Learn More",
      link: "/soocial-media"
    },
    {
      image: `${process.env.PUBLIC_URL}/images/bg_2.jpeg`,
      title: "Explore Tea Global Demand",
      subtitle: "Understand how international markets are shaping tea consumption.",
      buttonText: "Explore Now",
      link: "/export-demand"
    },
    {
      image: `${process.env.PUBLIC_URL}/images/HD-wallpaper-sri-lanka-railway-bridge-train-plantation.jpg`,
      title: "Get Tea Sales Insights",
      subtitle: "Gain valuable insights on Sri Lanka's tea export and local sales.",
      buttonText: "Explore Now",
      link: "/sales"
    },
    {
      image: `${process.env.PUBLIC_URL}/images/HD-wallpaper-sri-lanka-railway-bridge-train-plantation.jpg`,
      title: "Explore Tea Local Demand",
      subtitle: "Discover consumer preferences and trends in Sri Lanka’s tea market.",
      buttonText: "Explore Now",
      link: "/tea-types"
    },
  ];

  // Function to go to the next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Function to go to the previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto slide functionality (changes every 5 seconds)
  useEffect(() => {
    // const interval = setInterval(nextSlide, 15000); // Change slide every 5 seconds

    // return () => clearInterval(interval); 
  }, [currentSlide]); // Runs when currentSlide changes

  return (
    <section
      className="hero-slider"
      onMouseEnter={() => clearInterval()} // Pause auto-slide on hover
      onMouseLeave={() => setInterval(nextSlide, 5000)} // Resume auto-slide when mouse leaves
    >
      <div className="slides-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: "100%",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.5s ease-in-out",
              opacity: index === currentSlide ? 1 : 0,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <div className="overlay"></div>
            <div className="slide-content">
              <h1 className="slide-title">{slide.title}</h1>
              <p className="slide-subtitle">{slide.subtitle}</p>
              <CustomButton
                text={slide.buttonText}
                onClick={() => navigate(slide.link)}
                color="#ffb80e"
                filled={false}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button className="prev-button" onClick={prevSlide}>
        &#10094;
      </button>
      <button className="next-button" onClick={nextSlide}>
        &#10095;
      </button>
    </section>
  );
}

export default HeroSlider;
