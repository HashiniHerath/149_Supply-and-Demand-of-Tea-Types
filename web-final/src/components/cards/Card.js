// components/Card.js
import React from 'react';
import './card.css'

const Card = ({ numbers, cardName, icon }) => {
  return (
    <div className="card">
      <div>
        <div className="numbers">{numbers}</div>
        <div className="cardName">{cardName}</div>
      </div>
      <div className="iconBx">
        <img src={process.env.PUBLIC_URL+icon} height={60} alt='icon'/>
      </div>
    </div>
  );
};

export default Card;
