import React from 'react';
import Nav from '../components/nav/Nav';
import BusinessCard from '../components/cards/BusinessCard';
import { AiFillPhone, AiFillMail, AiFillMoneyCollect } from 'react-icons/ai'
import Footer from '../components/footer/Footer';
import HeroSlider from '../components/hero/Hero';
import BlogCards from '../components/blog/BlogContainer';

const OpenPage = () => {
  return (
    <div className="open-page">
      {/* Header Section */}
      <Nav/>

      {/* Hero Section */}
      <HeroSlider />
      

      <BlogCards />
      <Footer />
    </div>
  );
};

export default OpenPage;
