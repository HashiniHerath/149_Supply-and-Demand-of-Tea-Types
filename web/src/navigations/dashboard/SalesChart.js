import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaMinus, FaPlus, FaRecycle } from 'react-icons/fa';

import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import Env from '../../data/Env';

// Registering necessary chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesChart = () => {
  const navigate = useNavigate()
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedElevations, setSelectedElevations] = useState({
    'High grown': false,
    'Low grown': true,
    'Mid grown': false
  });
  const [salesCode, setSalesCode] = useState(4); // Default sales code

  const handleSalesCodeChange = (code) => {
    setSalesCode(Number(code));
  };

  const generatePDF = async () => {
    const doc = new jsPDF("landscape");
  
    const logo = new Image();
    logo.src = `${process.env.PUBLIC_URL}/images/logo.png`;
  
    // Wait for the logo to load before adding it to the PDF
    logo.onload = () => {
      // Add TeaVerse logo
      doc.addImage(logo, "PNG", 10, 10, 50, 30); // Adjust position and size
  
      // Add TeaVerse title
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text("TeaVerse", 70, 20);
  
      // Add additional details (small font)
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("123 Green Tea Road, Colombo, Sri Lanka", 70, 30);
      doc.text("Phone: +94 77 123 4567 | Email: contact@teaverse.com", 70, 37);
      doc.text("Website: www.teaverse.com", 70, 44);
  
      // Add horizontal line for separation
      doc.setDrawColor(150);
      doc.line(10, 50, 280, 50);
  
      // Add Report Title
      doc.setFontSize(16);
      doc.text("Sales Quantity Prediction Report", 10, 60);
  
      // Capture the chart as an image
      const chartElement = document.querySelector(".chartContainer");
      if (chartElement) {
        html2canvas(chartElement).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", 10, 70, 260, 120); // Adjust image size for landscape mode
  
          // Add Table Title
          doc.setFontSize(14);
          doc.text("Sales Data Table", 10, 200);
  
          // Prepare table data
          const tableData = [];
          Object.keys(salesData).forEach((elevation) => {
            salesData[elevation].forEach((data) => {
              tableData.push([elevation, data.year, data.predicted_quantity]);
            });
          });
  
          // Add Table with autoTable
          doc.autoTable({
            head: [["Elevation", "Year", "Predicted Quantity (Kg)"]],
            body: tableData,
            startY: 210,
          });
  
          // Save the PDF
          doc.save("Sales_Quantity_Prediction_Report.pdf");
        });
      }
    };
  };
  

  const fetchSalesData = async () => {
    setLoading(true);
    const upcomingYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  
    try {
      const elevationRequests = Object.keys(selectedElevations)
        .filter((elevation) => selectedElevations[elevation])
        .map(async (elevation) => {
          const baseDollarRate = 300;
          const baseAvgPrice = 500;
  
          const requests = upcomingYears.map((year, index) => {
            const adjustedDollarRate = baseDollarRate * Math.pow(0.9992, index);
            const adjustedAvgPrice = baseAvgPrice * Math.pow(1.029, index);
  
            return axios.post(Env.BACKEND+'/predict/sales-quantity', {
              year,
              dollar_rate: adjustedDollarRate,
              elevation,
              avg_price: adjustedAvgPrice,
              sales_code: salesCode, // Use selected sales code
            });
          });
  
          const responses = await Promise.all(requests);
          const salesQuantities = responses.map((res, index) => ({
            year: upcomingYears[index],
            predicted_quantity: res.data.predicted_quantity,
          }));
  
          return { elevation, salesQuantities };
        });
  
      const data = await Promise.all(elevationRequests);
  
      const formattedData = {};
      data.forEach(({ elevation, salesQuantities }) => {
        formattedData[elevation] = salesQuantities;
      });
  
      setSalesData(formattedData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
  
    fetchSalesData();
  }, [selectedElevations]);
  

  const handleCheckboxChange = (elevation) => {
    setSelectedElevations((prev) => ({
      ...prev,
      [elevation]: !prev[elevation],
    }));
  };

  // Prepare chart data
  const chartData = {
    labels:
      Object.values(salesData).length > 0
        ? Object.values(salesData)[0].map((data) => data.year)
        : [], // Use the first available elevation's labels
    datasets: Object.keys(salesData).map((elevation, index) => ({
      label: `${elevation} Sales Quantity (Kg)`,
      data: salesData[elevation]?.map((data) => data.predicted_quantity) || [],
      backgroundColor: `rgba(${50 + index * 50}, ${150 - index * 30}, 200, 0.6)`,
      borderColor: `rgba(${50 + index * 50}, ${150 - index * 30}, 200, 1)`,
      borderWidth: 1,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'Predicted Sales Quantity Over 10 Years by Elevation',
        color: '#333',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#333',
        },
        title: {
          display: true,
          text: 'Year',
          color: '#333',
        },
      },
      y: {
        ticks: {
          color: '#333',
        },
        title: {
          display: true,
          text: 'Sales Quantity (Kg)',
          color: '#333',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart" style={{ display: 'flex', flexDirection: 'row', width: '100%', }}>
      {/* <h5>Filter wth Sales Code</h5>
      <div style={{ width: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        
      </div> */}
      <div style={{ width: '100%', paddingLeft: '40px' }}>
        <div className="chartContainer" >
          {loading ? (
            <img 
              src={`${process.env.PUBLIC_URL}/animations/loading_screen.gif`} 
              className="blog-image" 
              style={{ 
                width: "250px", 
                height: "250px", 
                objectFit: "contain", 
                display: "block", 
                margin: "auto" 
              }} 
            />
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
       
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', }}>
          <div style={{ marginTop: '20px' }}>
            <div className="checkboxContainer">
              <h3>Select Elevation Types:</h3>
              {Object.keys(selectedElevations).map((elevation) => (
                <label key={elevation} style={{ marginRight: '15px' }}>
                  <input
                    type="checkbox"
                    checked={selectedElevations[elevation]}
                    onChange={() => handleCheckboxChange(elevation)}
                  />
                  {elevation}
                </label>
              ))}
            </div>
            <button 
              onClick={generatePDF} 
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px', 
                marginTop: '20px', 
                backgroundColor: 'green', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer', 
                transition: '0.3s',
                borderRadius: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'lightgreen';
                e.target.style.color = 'black';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'green';
                e.target.style.color = 'white';
              }}
            >
              Generate PDF Report
            </button>

            <button onClick={() => {
              navigate('/sales-all')
            }} style={{ 
                padding: '10px 20px', 
                fontSize: '16px', 
                marginTop: '20px', 
                marginLeft: '20px',
                backgroundColor: '#8e44ad', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer', 
                transition: '0.3s',
                borderRadius: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#9b59b6';
                e.target.style.color = 'black';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#8e44ad';
                e.target.style.color = 'white';
              }}>
            In Pie Chart
            </button>

          </div>
          <div style={{ width: "50%", marginTop: "20px", display: "flex", alignItems: "center" }}>
            <h3>Sales Code: {salesCode}</h3>
            <select
              value={salesCode}
              onChange={(e) => {
                handleSalesCodeChange(Number(e.target.value));
                fetchSalesData();
              }}
              style={{ marginLeft: "20px", padding: "5px", borderRadius: "5px", fontSize: "16px" }}
            >
              {[...Array(50)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
            <button 
              style={{ marginLeft: "20px", borderRadius: "50%", padding: "5px" }} 
              onClick={() => {
                if (salesCode > 1) {
                  handleSalesCodeChange(salesCode - 1);
                  fetchSalesData();
                }
              }}
            >
              <FaMinus size={20} />
            </button>
            <button 
              style={{ marginLeft: "10px", borderRadius: "50%", padding: "5px" }} 
              onClick={() => {
                if (salesCode < 50) {
                  handleSalesCodeChange(salesCode + 1);
                  fetchSalesData();
                }
              }}
            >
              <FaPlus size={20} />
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default SalesChart;
