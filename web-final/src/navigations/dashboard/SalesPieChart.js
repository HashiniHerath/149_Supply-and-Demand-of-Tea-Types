import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { useNavigate } from 'react-router-dom';
import { FaMinus, FaPlus } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import Env from '../../data/Env';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const SalesPieChart = () => {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [salesCode, setSalesCode] = useState(4); // Default sales code
  const [barChartData, setBarChartData] = useState({});
  const [selectedElevations, setSelectedElevations] = useState(["High grown", "Low grown", "Mid grown"]); 
  const [teaType, setTeaType] = useState("BP1");
  const [totalSalesQuantity, setTotalSalesQuantity] = useState(0);
  const [dollarRate, setDollarRate] = useState(300);
  const [avgPrice, setAvgPrice] = useState(1090);
  const [errors, setErrors] = useState({
    dollarRate: '',
    avgPrice: ''
  });

    const validateInput = (name, value) => {
    if (value < 0) {
      return `${name} must be a positive number`;
    }
    if (isNaN(value)) {
      return `${name} must be a valid number`;
    }
    return '';
  };

  const handleDollarRateChange = (e) => {
    const value = parseFloat(e.target.value);
    const error = validateInput('Dollar Rate', value);
    setErrors({...errors, dollarRate: error});
    if (!error) {
      setDollarRate(value);
    }
  };

  const handleAvgPriceChange = (e) => {
    const value = parseFloat(e.target.value);
    const error = validateInput('Average Price', value);
    setErrors({...errors, avgPrice: error});
    if (!error) {
      setAvgPrice(value);
    }
  };

  const handleSalesCodeChange = (code) => {
    setSalesCode(Number(code));
  };

  const fetchSalesData = async () => {
    setLoading(true);
    const currentYear = new Date().getFullYear();
    const elevations = ["High grown", "Low grown", "Mid grown"];

    try {
      const requests = elevations.map((elevation) =>
        axios.post(Env.BACKEND + "/predict/sales-quantity", {
          year: currentYear,
          dollar_rate: dollarRate,
          elevation,
          avg_price: avgPrice,
          sales_code: salesCode,
        })
      );

      const responses = await Promise.all(requests);

      const data = responses.reduce((acc, res, index) => {
        acc[elevations[index]] = res.data.predicted_quantity;
        return acc;
      }, {});

      setSalesData(data);
      const totalQuantity = Object.values(data).reduce((sum, qty) => sum + qty, 0);
      setTotalSalesQuantity(totalQuantity);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarChartData = async () => {
    setLoading(true);
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

    try {
      const requests = years.map((year) =>
        selectedElevations.map((elevation) =>
          axios.post(Env.BACKEND + "/predict-sales-unit-price", {
            year,
            dollar_rate: dollarRate,
            elevation,
            sales_code: salesCode,
            tea_type: teaType
          })
        )
      );

      const responses = await Promise.all(requests.flat());

      const data = responses.reduce((acc, res, index) => {
        const year = years[Math.floor(index / selectedElevations.length)];
        const elevation = selectedElevations[index % selectedElevations.length];
        if (!acc[year]) {
          acc[year] = {};
        }
        acc[year] = res.data.predicted_unit;
        return acc;
      }, {});

      setBarChartData(data);
    } catch (error) {
      console.error("Error fetching bar chart data:", error);
    } finally {
      setLoading(false);
    }
  };


    const generatePDF = async () => {
    const doc = new jsPDF("landscape");
  
    const logo = new Image();
    logo.src = `${process.env.PUBLIC_URL}/images/logo.png`;
  
    logo.onload = () => {
      // Add TeaVerse logo and header
      doc.addImage(logo, "PNG", 10, 10, 50, 30);
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text("TeaVerse", 70, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("123 Green Tea Road, Colombo, Sri Lanka", 70, 30);
      doc.text("Phone: +94 77 123 4567 | Email: contact@teaverse.com", 70, 37);
      doc.text("Website: www.teaverse.com", 70, 44);
      doc.setDrawColor(150);
      doc.line(10, 50, 280, 50);
  
      // Add Report Title
      doc.setFontSize(16);
      doc.text("Sales Quantity Prediction Overview", 10, 60);
  
      // Capture the chart as an image
      const chartElement = document.querySelector(".chartContainer");
      if (chartElement) {
        html2canvas(chartElement).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", 10, 70, 200, 120); 
  
          // Add detailed quantity information
          doc.setFontSize(14);
          doc.text("Detailed Quantity Breakdown (Sales Code: "+salesCode+")", 10, 200);
          
          // Create table data with elevation quantities
          const tableData = [
            ["High Grown", salesData["High grown"] || 0],
            ["Mid Grown", salesData["Mid grown"] || 0],
            ["Low Grown", salesData["Low grown"] || 0],
            ["Total Quantity", totalSalesQuantity]
          ];
  
          // Add Table with autoTable
          doc.autoTable({
            head: [["Elevation Type", "Quantity (Kg)"]],
            body: tableData,
            startY: 210,
            styles: {
              cellPadding: 5,
              fontSize: 12,
              valign: 'middle',
              halign: 'center'
            },
            headStyles: {
              fillColor: [52, 152, 219],
              textColor: 255,
              fontStyle: 'bold'
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245]
            }
          });
  
          // Add parameters used
          doc.setFontSize(12);
          doc.text("Parameters Used:", 10, doc.autoTable.previous.finalY + 15);
          doc.text(`Dollar Rate: ${dollarRate}`, 10, doc.autoTable.previous.finalY + 25);
          // doc.text(`Average Price: ${avgPrice}`, 10, doc.autoTable.previous.finalY + 35);
  
          // Save the PDF
          doc.save("Sales_Quantity_Prediction_Overview.pdf");
        });
      }
    };
  };

  const generateSPDF = async () => {
    const doc = new jsPDF("landscape");
  
    const logo = new Image();
    logo.src = `${process.env.PUBLIC_URL}/images/logo.png`;
  
    logo.onload = () => {
      // Add TeaVerse logo and header
      doc.addImage(logo, "PNG", 10, 10, 50, 30);
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text("TeaVerse", 70, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("123 Green Tea Road, Colombo, Sri Lanka", 70, 30);
      doc.text("Phone: +94 77 123 4567 | Email: contact@teaverse.com", 70, 37);
      doc.text("Website: www.teaverse.com", 70, 44);
      doc.setDrawColor(150);
      doc.line(10, 50, 280, 50);
  
      // Add Report Title
      doc.setFontSize(16);
      doc.text("Sales Type's Unit Price Over Coming Years", 10, 60);
  
      // Capture the chart as an image
      const chartElement = document.querySelector(".chartContainerB");
      if (chartElement) {
        html2canvas(chartElement).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", 10, 70, 260, 220); 
  
          // Add detailed price information
          doc.setFontSize(14);
          doc.text("Detailed Price Prediction (Tea Type: "+teaType+")", 10, 200);
  
          // Prepare table data
          const tableData = [];
          Object.keys(barChartData).forEach((year) => {
              tableData.push([year, 'Rs. ' + barChartData[year].toFixed(2)]);
          });
  
          // Add Table with autoTable
          doc.autoTable({
              head: [["Year", "Predicted Unit Price (Rs.)"]],
              body: tableData,
              startY: 210,
              styles: {
                cellPadding: 5,
                fontSize: 12,
                valign: 'middle',
                halign: 'center'
              },
              headStyles: {
                fillColor: [52, 152, 219],
                textColor: 255,
                fontStyle: 'bold'
              },
              alternateRowStyles: {
                fillColor: [245, 245, 245]
              }
          });
  
          // Add parameters used
          doc.setFontSize(12);
          doc.text("Parameters Used:", 10, doc.autoTable.previous.finalY + 15);
          doc.text(`Dollar Rate: ${dollarRate}`, 10, doc.autoTable.previous.finalY + 25);
          doc.text(`Tea Type: ${teaType}`, 10, doc.autoTable.previous.finalY + 35);
  
          // Save the PDF
          doc.save("Sales_Type_Unit_Price.pdf");
        });
      }
    };
  };

    useEffect(() => {
    fetchSalesData();
    fetchBarChartData();
  }, [salesCode, selectedElevations, teaType, dollarRate, avgPrice]);

  const chartData = {
    labels: Object.keys(salesData),
    datasets: [
      {
        data: Object.values(salesData),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF4C72", "#2D91C2", "#E6B800"],
      },
    ],
  };

  const barChartData2 = {
    labels: Object.keys(barChartData),
    datasets: [
      {
        label: 'Predicted Unit Price (Rs.)',
        data: Object.values(barChartData),
        backgroundColor: '#36A2EB',
        borderColor: '#2D91C2',
        borderWidth: 1,
      },
    ],
  };

    const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: "Sales Quantity Prediction Overview",
        font: {
          size: 18,
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw} kg (${((context.raw / totalSalesQuantity) * 100).toFixed(1)}%)`;
          }
        }
      }
    },
  };

    const barChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Tea types' unit price Over Coming 5 Years",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Predicted Unit Price (Rs.)',
        },
        type: 'linear',
        min: Math.min(...Object.values(barChartData)) - 10,
        max: Math.max(...Object.values(barChartData)) + 10,
        ticks: {
          stepSize: 5,
          callback: function(value) {
            return 'Rs. ' + Math.round(value); // Round to remove decimals
          }
        }
      },
    },
  };

    return (
    <div className="chart" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
      <div style={{ width: "50%", marginBottom: "20px" }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="dollarRate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Dollar Rate:
              </label>
              <input
                id="dollarRate"
                type="number"
                min="0"
                step="0.01"
                value={dollarRate}
                onChange={handleDollarRateChange}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: errors.dollarRate ? '1px solid red' : '1px solid #ccc' }}
              />
              {errors.dollarRate && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.dollarRate}</p>}
            </div>
            <div style={{ flex: 1 }}>
              {/* <label htmlFor="avgPrice" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Average Price:
              </label>
              <input
                id="avgPrice"
                type="number"
                min="0"
                step="0.01"
                value={avgPrice}
                onChange={handleAvgPriceChange}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: errors.avgPrice ? '1px solid red' : '1px solid #ccc' }}
              /> */}
              {errors.avgPrice && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.avgPrice}</p>}
            </div>
          </div>
        </div>
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className='chartContainerB'>
              <Bar data={barChartData2} options={barChartOptions} />
              <div style={{ marginTop: "20px" }}>
                <h4>Select Elevation Types:</h4>
                <select
                  //multiple
                  value={selectedElevations}
                  onChange={(e) => setSelectedElevations(Array.from(e.target.selectedOptions, option => option.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", fontSize: "16px" }}
                >
                  <option value="High grown">High grown</option>
                  <option value="Low grown">Low grown</option>
                  <option value="Mid grown">Mid grown</option>
                </select>
              </div>
              <div>
                <br></br>
                <h4>Switch Tea Type:</h4>
                <label>
                  <input
                    type="radio"
                    name="teaType"
                    value="BP1"
                    checked={teaType === "BP1"}
                    onChange={() => setTeaType("BP1")}
                  />
                  BP1
                </label>
                <label style={{ marginLeft: "20px" }}>
                  <input
                    type="radio"
                    name="teaType"
                    value="PF1"
                    checked={teaType === "PF1"}
                    onChange={() => setTeaType("PF1")}
                  />
                  PF1
                </label>
              </div>
            </div>
          )}
                  </div>
        <div style={{ width: "50%", marginTop: "20px", display: "flex", alignItems: "center" }}>
          <h3>Sales Code: {salesCode}</h3>
          <select
            value={salesCode}
            onChange={(e) => {
              handleSalesCodeChange(Number(e.target.value));
              fetchSalesData();
              fetchBarChartData();
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
                fetchBarChartData();
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
                fetchBarChartData();
              }
            }}
          >
            <FaPlus size={20} />
          </button>
        </div>
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => {
              navigate('/sales');
            }}
                        style={{
              padding: '10px 20px',
              fontSize: '16px',
              marginTop: '20px',
              marginLeft: '20px',
              backgroundColor: '#8e44ad',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: '0.3s',
              borderRadius: '10px',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#9b59b6';
              e.target.style.color = 'black';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#8e44ad';
              e.target.style.color = 'white';
            }}
          >
            In Bar Chart
          </button>
          <button 
            onClick={generateSPDF} 
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              marginTop: '20px', 
              marginLeft: '20px',
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
        </div>
      </div>