import React from "react";
import Nav from "../components/nav/Nav";
import HeroSlider from "../components/hero/Hero";
import BlogCards from "../components/blog/BlogContainer";
import Footer from "../components/footer/Footer";

const AboutUs = () => {
  return (
    <div className="open-page">
      {/* Header Section */}
      <Nav />

      {/* Hero Section */}
      <HeroSlider />

      {/* About Us Content */}
      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", textAlign: "justify" }}>
        <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "20px" }}>Who We Are</h2>
        <p>
          We are a team of passionate researchers and technology enthusiasts committed to
          revolutionizing the tea industry in Sri Lanka. Our project focuses on leveraging data-driven
          insights to predict the supply and demand of different tea types, helping producers,
          exporters, and policymakers make informed decisions.
        </p>

        <h2 style={{ textAlign: "center", color: "#2c3e50", marginTop: "40px" }}>Our Mission</h2>
        <p>
          Our mission is to enhance the efficiency and profitability of Sri Lanka’s tea industry by
          integrating advanced analytics, machine learning, and real-time market trends.
        </p>

        <h2 style={{ textAlign: "center", color: "#2c3e50", marginTop: "40px" }}>What We Do</h2>
        <ul style={{ paddingLeft: "20px" }}>
          <li>Predicting Tea Demand: Using data analytics and social media trends to analyze consumer behavior and forecast tea demand.</li>
          <li>Supply Chain Optimization: Providing insights to improve market strategies and production planning.</li>
          <li>Data-Driven Decision Making: Helping stakeholders adapt to changing market conditions with real-time reports.</li>
          <li>Innovative Technologies: Implementing AI-driven models and visualization tools for trend analysis.</li>
        </ul>

        <h2 style={{ textAlign: "center", color: "#2c3e50", marginTop: "40px" }}>Why It Matters</h2>
        <p>
          Sri Lanka’s tea industry is a major contributor to the economy, yet traditional forecasting
          methods make it difficult to align production with market demand. Our web application
          bridges this gap by offering intelligent predictions that help reduce losses and ensure sustainable growth.
        </p>

        <h2 style={{ textAlign: "center", color: "#2c3e50", marginTop: "40px" }}>Meet Our Team</h2>
        <ul style={{ paddingLeft: "20px" }}>
          <li><strong>Ramsith K.V.A.M:</strong> Specializing in analyzing sales factors affecting tea demand.</li>
          <li><strong>Herath H.M.H.N:</strong> Focused on mining tea-related data from social media and Google Trends.</li>
          <li><strong>Sanjula R.A.K:</strong> Developing predictive models for export demand using economic indicators.</li>
          <li><strong>Dinujaya M.H.S:</strong> Researching tea production trends for different categories (Orthodox, CTC, Green Tea).</li>
        </ul>
        <p style={{ textAlign: "center", fontWeight: "bold", marginTop: "20px" }}>
          Supervisors: Mrs. Lokesha Weerasinghe & Ms. Thamali Kelegama.
        </p>

        <h2 style={{ textAlign: "center", color: "#2c3e50", marginTop: "40px" }}>Get in Touch</h2>
        <p>
          We welcome collaboration and industry partnerships to refine our model and improve
          forecasting accuracy. If you are a tea producer, exporter, or policymaker looking for data-driven insights, connect with us today!
        </p>
      </div>

      {/* Blog Section */}
      <BlogCards />

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default AboutUs;
