import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Env from "../../data/Env";

// Registering necessary chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExportDemandChart = () => {
  const [demandData, setDemandData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState({
    China: true,
    Germany: false,
    Iran: false,
    Russia: false,
    Japan: false,
    UK: false,
    USA: false
  });
  const [selectedType, setSelectedType] = useState("Black");

  const downloadPDF = () => {
    const input = document.querySelector(".chart");
    html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("landscape");

        // Add logo and title
        const logo = new Image();
        logo.src = `${process.env.PUBLIC_URL}/images/logo.png`;
        logo.onload = () => {
            // Add TeaVerse logo
            pdf.addImage(logo, "PNG", 10, 10, 50, 30);

            // Add TeaVerse title
            pdf.setFontSize(22);
            pdf.setTextColor(40, 40, 40);
            pdf.text("TeaVerse", 70, 20);

            // Add additional details
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text("123 Green Tea Road, Colombo, Sri Lanka", 70, 30);
            pdf.text("Phone: +94 77 123 4567 | Email: contact@teaverse.com", 70, 37);
            pdf.text("Website: www.teaverse.com", 70, 44);

            // Add horizontal line for separation
            pdf.setDrawColor(150);
            pdf.line(10, 50, 280, 50);

            // Add chart image
            pdf.addImage(imgData, "PNG", 10, 55, 280, 140);

            // Adding data table
            pdf.addPage("landscape");
            
            // Table headers
            pdf.setFontSize(16);
            pdf.text("Demand Data Table", 10, 20);
            
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            
            // Define table columns
            const headers = ["Country", "Year", "Month", "Predicted Demand"];
            const columnWidths = [50, 30, 30, 50];
            
            // Starting Y position for the table
            let y = 30;
            
            // Draw table headers
            pdf.setFillColor(200, 200, 200);
            pdf.rect(10, y, columnWidths[0], 10, 'F');
            pdf.rect(10 + columnWidths[0], y, columnWidths[1], 10, 'F');
            pdf.rect(10 + columnWidths[0] + columnWidths[1], y, columnWidths[2], 10, 'F');
            pdf.rect(10 + columnWidths[0] + columnWidths[1] + columnWidths[2], y, columnWidths[3], 10, 'F');
            
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "bold"); // Changed from setFontStyle
            pdf.text(headers[0], 15, y + 7);
            pdf.text(headers[1], 10 + columnWidths[0] + 5, y + 7);
            pdf.text(headers[2], 10 + columnWidths[0] + columnWidths[1] + 5, y + 7);
            pdf.text(headers[3], 10 + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y + 7);
            
            y += 10;
            pdf.setFont("helvetica", "normal"); // Changed from setFontStyle
            
            // Process all demand data
            const allData = [];
            Object.keys(demandData).forEach(country => {
                demandData[country].forEach(data => {
                    allData.push({
                        country,
                        year: data.year.toString(), // Ensure string type
                        month: data.month,
                        demand: data.predicted_demand.toString() // Ensure string type
                    });
                });
            });
            
            // Add table rows
            allData.forEach((row, index) => {
                // Check if we need a new page (leave 20mm margin at bottom)
                if (y > 180) {
                    pdf.addPage("landscape");
                    y = 20;
                    
                    // Redraw headers on new page
                    pdf.setFillColor(200, 200, 200);
                    pdf.rect(10, y, columnWidths[0], 10, 'F');
                    pdf.rect(10 + columnWidths[0], y, columnWidths[1], 10, 'F');
                    pdf.rect(10 + columnWidths[0] + columnWidths[1], y, columnWidths[2], 10, 'F');
                    pdf.rect(10 + columnWidths[0] + columnWidths[1] + columnWidths[2], y, columnWidths[3], 10, 'F');
                    
                    pdf.setTextColor(0, 0, 0);
                    pdf.setFont("helvetica", "bold");
                    pdf.text(headers[0], 15, y + 7);
                    pdf.text(headers[1], 10 + columnWidths[0] + 5, y + 7);
                    pdf.text(headers[2], 10 + columnWidths[0] + columnWidths[1] + 5, y + 7);
                    pdf.text(headers[3], 10 + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y + 7);
                    
                    y += 10;
                    pdf.setFont("helvetica", "normal");
                }
                
                // Alternate row colors
                if (index % 2 === 0) {
                    pdf.setFillColor(240, 240, 240);
                    pdf.rect(10, y, columnWidths[0], 10, 'F');
                    pdf.rect(10 + columnWidths[0], y, columnWidths[1], 10, 'F');
                    pdf.rect(10 + columnWidths[0] + columnWidths[1], y, columnWidths[2], 10, 'F');
                    pdf.rect(10 + columnWidths[0] + columnWidths[1] + columnWidths[2], y, columnWidths[3], 10, 'F');
                }
                
                // Add row data - ensuring all values are strings
                pdf.text(row.country.toString(), 15, y + 7);
                pdf.text(row.year.toString(), 10 + columnWidths[0] + 5, y + 7);
                pdf.text(row.month.toString(), 10 + columnWidths[0] + columnWidths[1] + 5, y + 7);
                pdf.text(row.demand.toString(), 10 + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y + 7);
                
                y += 10;
            });

            pdf.save("ExportDemand.pdf");
        };
    });
};
  
  

  useEffect(() => {
    const fetchDemandData = async () => {
      setLoading(true);
      const upcomingYears = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i);
      const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Sample months for seasonal predictions
      const baseCHCPI = 102.5; // Base CPI value

      try {
        const countryRequests = Object.keys(selectedCountries)
          .filter((country) => selectedCountries[country])
          .map(async (country) => {
            console.log(upcomingYears)
            const requests = upcomingYears.flatMap((year, yearIndex) =>
              months.map((month) => {
                // Dynamically calculate CH_CPI for each year
                const adjustedCHCPI = baseCHCPI * Math.pow(0.9992, yearIndex); // Decreasing by 0.08% yearly
                console.log(demandData)
                return axios.post(Env.BACKEND+"/predict/demand", {
                  year,
                  month,
                  CH_CPI: adjustedCHCPI,
                  Type: selectedType,
                  country,
                });
              })
            );

            const responses = await Promise.all(requests);
            const demandQuantities = responses.map((res, index) => {
              const yearIndex = Math.floor(index / months.length);
              console.log(responses)
              return {
                year: upcomingYears[yearIndex],
                month: res.data.month,
                predicted_demand: res.data.predicted_demand,
              };
            });

            return { country, demandQuantities };
          });

        const data = await Promise.all(countryRequests);

        const formattedData = {};
        data.forEach(({ country, demandQuantities }) => {
          formattedData[country] = demandQuantities;
        });

        setDemandData(formattedData);
      } catch (error) {
        console.error("Error fetching demand data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemandData();
  }, [selectedCountries, selectedType]);

  const handleCountryCheckboxChange = (country) => {
    setSelectedCountries((prev) => ({
      ...prev,
      [country]: !prev[country],
    }));
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  // Prepare chart data
  const availableCountry = Object.keys(demandData).find((country) => demandData[country]?.length > 0);
  const chartData = {
    labels: availableCountry ? demandData[availableCountry].map((data) => `${data.year}-${data.month}`) : [],
    datasets: Object.keys(demandData).map((country, index) => ({
      label: `${country} Demand (${selectedType} Tea)`,
      data: demandData[country]?.map((data) => data.predicted_demand) || [],
      backgroundColor: `rgba(${50 + index * 50}, ${150 - index * 30}, 200, 0.6)`,
      borderColor: `rgba(${50 + index * 50}, ${150 - index * 30}, 200, 1)`,
      borderWidth: 1,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#333",
        },
      },
      title: {
        display: true,
        text: `Predicted Export Demand (${selectedType} Tea) by Country`,
        color: "#333",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#333",
        },
        title: {
          display: true,
          text: "Year",
          color: "#333",
        },
      },
      y: {
        ticks: {
          color: "#333",
        },
        title: {
          display: true,
          text: "Predicted Demand (Kg)",
          color: "#333",
        },
        beginAtZero: true,
      },
    },
  };

  // Tab styles
  const tabStyles = {
    container: {
      display: "flex",
      justifyContent: "center",
      margin: "20px 0",
    },
    tab: {
      padding: "10px 20px",
      margin: "0 5px",
      cursor: "pointer",
      borderRadius: "5px",
      backgroundColor: "#f0f0f0",
      border: "1px solid #ccc",
      fontWeight: "bold",
      color: "#333",
    },
    activeTab: {
      backgroundColor: "#007bff",
      color: "#fff",
      border: "1px solid #0056b3",
    },
  };

  return (
    <div className={'chart'}>
      <div className="cardHeader">
        <h2 style={{ textAlign: "center" }}>Export Demand Prediction</h2>
      </div>
      <div style={tabStyles.container}>
        {["Black", "Green"].map((type) => (
          <div
            key={type}
            style={{
              ...tabStyles.tab,
              ...(selectedType === type ? tabStyles.activeTab : {}),
            }}
            onClick={() => handleTypeChange(type)}
          >
            {type} Tea
          </div>
        ))}
      </div>
      <div className="chartContainer" style={{ marginBottom: "20px" }}>
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
      <div className="controls" style={{ textAlign: "center" }}>
        <h3>Select Countries:</h3>
        {Object.keys(selectedCountries).map((country) => (
          <label
            key={country}
            style={{ marginRight: "15px", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={selectedCountries[country]}
              onChange={() => handleCountryCheckboxChange(country)}
              style={{ marginRight: "5px" }}
            />
            {country}
          </label>
        ))}
      </div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={downloadPDF}
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
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ExportDemandChart;
