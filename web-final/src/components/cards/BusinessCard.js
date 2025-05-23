import React from 'react';
import './card.css'; 

const BusinessCard = ({ name, position, logo, details }) => {
  return (
    <div className="business-card">
      <div className="left-section">
        <div className="logo-container">
          <img src={logo} alt="Company Logo" className="logo" />
        </div>
        <div className="company-info">
          {/* <h2>Your Logo</h2>
          <h3>Company Name</h3> */}
        </div>
      </div>
      <div className="right-section">
        <h1 className="name">{name}</h1>
        <h2 className="position">{position}</h2>
        <div className="contact-info">
          {details.map((detail, index) => (
            <div key={index} className="contact-item">
              {detail.icon}
              <span>{detail.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
