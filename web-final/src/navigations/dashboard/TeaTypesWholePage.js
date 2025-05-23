// pages/TeaTypesPage.js
import React, { useEffect, useState } from 'react';
import Footer from '../../components/footer/Footer';
import Sidebar from '../../components/sidebar/Sidebar';
import Topbar from '../../components/topbar/Topbar';
import TeaWholeProductionChart from './TeaWholeProductionChart';

const TeaTypesWholePage = () => {
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
          <h2>Tea Whole Production Quantity Prediction</h2>
          <TeaWholeProductionChart />
          {/* <TypesChart /> */}
          {/* <PredictionSummary goldDetails={goldDetails}/> */}
          
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default TeaTypesWholePage;
