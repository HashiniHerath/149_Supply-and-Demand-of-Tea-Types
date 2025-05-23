// pages/SalesPage.js
import React, { useEffect, useState } from 'react';
import Footer from '../../components/footer/Footer';
import Sidebar from '../../components/sidebar/Sidebar';
import Topbar from '../../components/topbar/Topbar';
import SalesPieChart from './SalesPieChart';

const SalesPiePage = () => {
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
          <h2>Sales Quantity Prediction and Tea Types</h2>
          <SalesPieChart />
          
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default SalesPiePage;
