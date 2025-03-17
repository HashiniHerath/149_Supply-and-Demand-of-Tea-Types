// pages/SalesPage.js
import React, { useEffect, useState } from 'react';
import Footer from '../../components/footer/Footer';
import Sidebar from '../../components/sidebar/Sidebar';
import Topbar from '../../components/topbar/Topbar';
import SalesChart from './SalesChart';

const SalesPage = () => {
    const [isAdmin, setIsAdmin] = useState(false);
  
    useEffect(() => {
      const userRole = localStorage.getItem('userRole'); 
      setIsAdmin(userRole === 'admin');
    }, []);
  

  return (
    <div className="dashContainer">
      {isAdmin && <Sidebar />}
      <div className={`main ${!isAdmin ? 'full-width' : ''}`}>
        <Topbar />
        
        <div className="details">
          <h2>Sales Quantity Prediction</h2>
          <SalesChart />
          {/* <PredictionSummary goldDetails={goldDetails}/> */}
          
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default SalesPage;
