// Sidebar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoneyBill, FaHome, FaUser, FaCommentDots, FaQuestionCircle, FaCog, FaSignOutAlt, FaHatCowboy, FaChartBar, FaTree, FaLeaf, FaPlane, FaShip, FaGoogle } from 'react-icons/fa';
import './sidebar.css'

const Sidebar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('userRole');  // Remove user role
    localStorage.removeItem('username'); // Remove authentication token (if applicable)
    localStorage.clear(); // Clear all stored data
    navigate('/welcome'); // Redirect to welcome page
  };
  
  return (
    <div className="navigation">
      <ul>
        <li>
          <Link to="#">
            <span className="nav-icon"><img src={`${process.env.PUBLIC_URL}/images/logo.png`} height={60} alt='icon'/></span>
            <span className="title">TeaVerse</span>
          </Link>
        </li>
        <li>
          <Link to="/welcome">
            <span className="nav-icon"><FaHome className="ic"/></span>
            <span className="title">Home</span>
          </Link>
        </li>
        <li>
          <Link to="/sales">
            <span className="nav-icon"><FaChartBar className="ic"/></span>
            <span className="title">Tea sales Analysis</span>
          </Link>
        </li>
        <li>
          <Link to="/tea-types">
            <span className="nav-icon"><FaLeaf className="ic"/></span>
            <span className="title">Tea Production Analysis</span>
          </Link>
        </li>
        <li>
          <Link to="/export-demand">
            <span className="nav-icon"><FaShip className="ic"/></span>
            <span className="title">Export Demand</span>
          </Link>
        </li>
        <li>
          <Link to="/soocial-media">
            <span className="nav-icon"><FaGoogle className="ic"/></span>
            <span className="title">Tea Trend Demand</span>
          </Link>
        </li>
      </ul>
      <button 
        onClick={handleSignOut} 
        style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ff4d4d',
          color: '#fff',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          width: '140px',
          textAlign: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'background 0.3s ease-in-out'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#e63939'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#ff4d4d'}
      >
        <FaSignOutAlt size={18} />
        Sign Out
      </button>
    </div>
  );
};

export default Sidebar;
