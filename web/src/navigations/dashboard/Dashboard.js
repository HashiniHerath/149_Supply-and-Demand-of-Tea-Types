// pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import Footer from '../../components/footer/Footer';
import Card from '../../components/cards/Card';
import Sidebar from '../../components/sidebar/Sidebar';
import Topbar from '../../components/topbar/Topbar';
import Env from '../../data/Env';
import GoldRatesChart from './GoldRates.chart';
import VolumeList from './Volumes.list';

const Dashboard = () => {
  const [goldDetails, setGoldDetails] = useState(null);
  const [goldStats, setGoldStats] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  

  useEffect(() => {
    const fetchGoldDetails = async () => {
      try {
        const response = await fetch(Env.BACKEND+'/gold-details');
        if (!response.ok) throw new Error('Failed to fetch gold details');
        const data = await response.json();
        console.log(data.gold_details);
        setGoldDetails(data.gold_details);
        setGoldStats(data.statistics);
      } catch (error) {
        console.error('Error fetching gold details:', error);
      }
    };
    const getLKRtoUSD = async () => {
      try {
        var myHeaders = new Headers();
        myHeaders.append("apikey", "pOrA34yTe7k1fNciqMLBchhA9wMkyDnW");
        var requestOptions = {
          method: 'GET',
          redirect: 'follow',
          headers: myHeaders
        };
        
        fetch("https://api.apilayer.com/fixer/convert?to=LKR&from=USD&amount=1", requestOptions)
          .then(response => response.json())
          .then(result => {
            setExchangeRate(result.result)
          })
          .catch(error => console.log('error', error));
        
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        return null;
      }
    };
    fetchGoldDetails();
    getLKRtoUSD();
  }, []);

  return (
    <div className="dashContainer">
      <Sidebar />
      <div className="main">
        <Topbar />
        {goldStats&&exchangeRate&&<div className="cardBox">
          <Card numbers={'$'+goldStats.highest_price["GC=F"]} cardName="Highest Price" icon="https://www.svgrepo.com/show/370773/stock-up.svg" />
          <Card numbers={'$'+goldStats.lowest_price["GC=F"].toFixed(2)} cardName="Lowest Price" icon="https://www.svgrepo.com/show/370774/stock-down.svg" />
          <Card numbers={goldStats.average_volume["GC=F"].toFixed(2)} cardName="Average Volume" icon="https://cdn-icons-png.flaticon.com/512/2997/2997013.png" />
          <Card numbers={'Rs.'+exchangeRate.toFixed(2)} cardName="USD to LKR" icon="https://www.pngall.com/wp-content/uploads/12/USD-PNG-HD-Image.png" />
        </div>}
        <div className="details">
          {/* <h2>Gold Price Details</h2> */}
          {goldDetails&&<GoldRatesChart goldDetails={goldDetails}/>}
          {goldDetails&&<VolumeList goldDetails={goldDetails}/>}
          
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
