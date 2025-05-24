import React from 'react';
import PropTypes from 'prop-types';
import './button.css';

const CustomButton = ({ text, onClick, color, filled }) => {
  return (
    <button
      className={`custom-button ${filled ? 'filled' : 'border-only'}`}
      onClick={onClick}
      style={{
        color: filled ? '#fff' : color,
        backgroundColor: filled ? color : 'transparent',
        borderColor: color,
      }}
    >
      {text}
      <span className="arrow">→</span>
    </button>
  );
};

CustomButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  color: PropTypes.string,
  filled: PropTypes.bool,
};

CustomButton.defaultProps = {
  onClick: () => {},
  color: '#6a1b9a', // Default color
  filled: false,
};

export default CustomButton;
