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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesChart = () => {
  const navigate = useNavigate()
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedElevations, setSelectedElevations] = useState({
    'High grown': true,
    'Low grown': false,
    'Mid grown': false
  });
  const [salesCode, setSalesCode] = useState(4);
  const [dollarRate, setDollarRate] = useState(300);
  const [avgPrice, setAvgPrice] = useState(1000);
  const [errors, setErrors] = useState({});

  const handleSalesCodeChange = (code) => {
    setSalesCode(Number(code));
  };

   const validateInputs = () => {
    const newErrors = {};
    if (dollarRate <= 0) newErrors.dollarRate = 'Dollar rate must be positive';
    if (avgPrice <= 0) newErrors.avgPrice = 'Average price must be positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePDF = async () => {
    const doc = new jsPDF("landscape");
    const logo = new Image();
    logo.src = `${process.env.PUBLIC_URL}/images/logo.png`;
  
    logo.onload = () => {
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
      doc.setFontSize(16);
      doc.text(`Sales Quantity Prediction Report (Sales Code: ${salesCode})`, 10, 60);
  
      const chartElement = document.querySelector(".chartContainer");
      if (chartElement) {
        html2canvas(chartElement).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", 10, 70, 260, 120);
          doc.setFontSize(14);
          doc.text("Sales Data Table", 10, 200);
  
          const tableData = [];
          Object.keys(salesData).forEach((elevation) => {
            salesData[elevation].forEach((data) => {
              tableData.push([elevation, data.year, data.predicted_quantity]);
            });
          });
  
          doc.autoTable({
            head: [["Elevation", "Year", "Predicted Quantity (Kg)"]],
            body: tableData,
            startY: 210,
          });
  
          doc.save("Sales_Quantity_Prediction_Report.pdf");
        });
      }
    };
  };

    const fetchSalesData = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    const upcomingYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  
    try {
      const elevationRequests = Object.keys(selectedElevations)
        .filter((elevation) => selectedElevations[elevation])
        .map(async (elevation) => {
          const requests = upcomingYears.map((year, index) => {
            const adjustedDollarRate = dollarRate * Math.pow(0.9992, index);
            const adjustedAvgPrice = avgPrice * Math.pow(1.029, index);
  
            return axios.post(Env.BACKEND+'/predict/sales-quantity', {
              year,
              dollar_rate: adjustedDollarRate,
              elevation,
              avg_price: adjustedAvgPrice,
              sales_code: salesCode,
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
  }, [selectedElevations, salesCode, dollarRate, avgPrice]);

  const handleCheckboxChange = (elevation) => {
    setSelectedElevations((prev) => ({
      ...prev,
      [elevation]: !prev[elevation],
    }));
  };

  const chartData = {
    labels: Object.values(salesData).length > 0 ? Object.values(salesData)[0].map((data) => data.year) : [],
    datasets: Object.keys(salesData).map((elevation, index) => ({
      label: `${elevation} Sales Quantity (Kg)`,
      data: salesData[elevation]?.map((data) => data.predicted_quantity) || [],
      backgroundColor: `rgba(${50 + index * 50}, ${150 - index * 30}, 200, 0.6)`,
      borderColor: `rgba(${50 + index * 50}, ${150 - index * 30}, 200, 1)`,
      borderWidth: 1,
    })),
  };