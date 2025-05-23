import React from "react";
import "./blog.css"; 
import { useNavigate } from 'react-router-dom'

const blogData = [
  {
    title: "Investigate Tea Trends",
    image: "https://hospitalityinsights.ehl.edu/hubfs/Tea_Market.jpg",
    link: "/soocial-media",
  },
  {
    title: "Explore Tea Global Demand",
    image: "https://media.licdn.com/dms/image/v2/C4E12AQGsrhliE7Y_XA/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1634805197736?e=2147483647&v=beta&t=wxku00Lli0XNR8JBq8DWZK6bh-BKHWjhRmKg-Sa1XSo",
    link: "/export-demand",
  },
  {
    title: "Get Tea Sales Insights",
    image: "https://wallup.net/wp-content/uploads/2019/09/355029-business-sales-internet-globe-computer.jpg",
    link: "/sales",
  },
  {
    title: "Explore Tea Local Demand",
    image: "https://img.freepik.com/premium-photo/tea-travel-discovering-local-tea-culture_198067-1228.jpg",
    link: "/tea-types",
  },
];

const BlogCards = () => {
  const naviage = useNavigate()

  const handleNavigation = (url) => {
    naviage(url)
  };
  return (
    <div className="blog-container">
      <h2 className="blog-title">Services</h2>
      <div className="blog-grid">
        {blogData.map((post, index) => (
          <div key={index} className="blog-card" onClick={() => handleNavigation(post.link)}>
            <img src={post.image} alt={post.title} className="blog-image" />
            <div className="blog-overlay">
              <p className="blog-text">{post.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogCards;
