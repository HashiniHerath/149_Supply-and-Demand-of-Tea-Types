// pages/SalesPage.js
import React, { useEffect, useState } from 'react';
import Footer from '../../components/footer/Footer';
import Sidebar from '../../components/sidebar/Sidebar';
import Topbar from '../../components/topbar/Topbar';
import SalesChart from './SalesChart';
import TrendAnalysisChart from './TrendAnalysisChart';

const SocialMediaPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  
    useEffect(() => {
      const userRole = localStorage.getItem('userRole'); // Adjust key based on how role is stored
      setIsAdmin(userRole === 'admin');
    }, []);

  return (
    <div className="dashContainer">
      {isAdmin && <Sidebar />}
      <div className={`main ${!isAdmin ? 'full-width' : ''}`}>
        <Topbar />
        
        <div className="details">
          <h2>Tea Types Trends</h2>
          <TrendAnalysisChart />
          
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default SocialMediaPage;
