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
  const [totalSalesQuantity, setTotalSalesQuantity] = useState(0)

  const handleSalesCodeChange = (code) => {
    setSalesCode(Number(code));
  };

  const fetchSalesData = async () => {
    setLoading(true);
    const currentYear = new Date().getFullYear();
    const elevations = ["High grown", "Low grown", "Mid grown"];
    const baseDollarRate = 300;
    const baseAvgPrice = 1090;

    try {
      const requests = elevations.map((elevation) =>
        axios.post(Env.BACKEND + "/predict/sales-quantity", {
          year: currentYear,
          dollar_rate: baseDollarRate,
          elevation,
          avg_price: baseAvgPrice,
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
    console.log("D")
    setLoading(true);
    const baseDollarRate = 300;
    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

    try {
      const requests = years.map((year) =>
        selectedElevations.map((elevation) =>
          axios.post(Env.BACKEND + "/predict-sales-unit-price", {
            year,
            dollar_rate: baseDollarRate,
            elevation,
            sales_code: salesCode,
            tea_type: teaType
          })
        )
      );

      // Wait for all requests and group responses by year and elevation
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

      console.log(data)

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
        doc.text("Sales Quantity Prediction Overview", 10, 60);
    
        // Capture the chart as an image
        const chartElement = document.querySelector(".chartContainer");
        if (chartElement) {
          html2canvas(chartElement).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            doc.addImage(imgData, "PNG", 10, 70, 200, 120); 
    
            // Add Table Title
            doc.setFontSize(14);
            doc.text("Sales Quantity Prediction Overview", 10, 200);
    
            // Prepare table data
            const tableData = [];
            // Object.keys(salesData).forEach((elevation) => {
            //   salesData[elevation].forEach((data) => {
            //     tableData.push([elevation, data.year, data.predicted_quantity]);
            //   });
            // });
    
            // // Add Table with autoTable
            // doc.autoTable({
            //   head: [["Elevation", "Year", "Predicted Quantity (Kg)"]],
            //   body: tableData,
            //   startY: 210,
            // });
    
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
        doc.text("Sales Type's unit Price over comming years", 10, 60);
    
        // Capture the chart as an image
        const chartElement = document.querySelector(".chartContainerB");
        if (chartElement) {
          html2canvas(chartElement).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            doc.addImage(imgData, "PNG", 10, 70, 260, 220); 
    
            // Add Table Title
            doc.setFontSize(14);
            doc.text("Sales Type's unit Price over comming years", 10, 200);
    
            // Prepare table data
            const tableData = [];
            console.log(barChartData)
            Object.keys(barChartData).forEach((year) => {
                tableData.push([year, barChartData[year]]);
            });
    
            // Add Table with autoTable
            doc.autoTable({
                head: [["Year", "Predicted Unit Price (Rs.)"]],
                body: tableData,
                startY: 210,
            });
    
            // Save the PDF
            doc.save("Sales_Type's_unit_Price.pdf");
          });
        }
      };
    };
    


  useEffect(() => {
    fetchSalesData();
    fetchBarChartData();
  }, [salesCode, selectedElevations, teaType]);

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
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Tea types' unit price Over Coming 10 Years",
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
          text: 'Predicted Unit Price',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
      <div style={{ width: "50%", marginBottom: "20px" }}>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className='chartContainerB'>
            <Bar data={barChartData2} options={barChartOptions} />
            <div style={{ marginTop: "20px" }}>
                <h4>Select Elevation Types:</h4>
                <select
                    
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

      

      <div style={{ width: "50%", height: "400px", display:'flex', justifyContent: 'center' }}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className='chartContainer'>
          <Pie data={chartData} options={chartOptions}  style={{minHeight: '250px'}}/>
          <br></br>
          <center>
            <h4>{'Total Quantity: '+totalSalesQuantity}</h4>
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
          </center>
          
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPieChart;
