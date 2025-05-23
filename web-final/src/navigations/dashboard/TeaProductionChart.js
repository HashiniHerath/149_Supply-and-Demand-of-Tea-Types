import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Env from '../../data/Env';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TeaProductionChart = () => {
  const navigate = useNavigate();
  const defaultYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // Months 1-12
  const processingMethods = ["Orthodox", "CTC", "Green"];
  const [year, setYear] = useState(2022);

  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedElevations, setSelectedElevations] = useState({
    Low: false,
    Medium: false,
    High: true
  });

  const [weatherData, setWeatherData] = useState([]);
  const cities = ['Kandy', 'Nuwara Eliya', 'Badulla', 'Galle'];

  const fetchProductionData = async () => {
    setLoading(true);
    try {
      const weatherMap = {
        Low: weatherData.find(w => w.name === 'Galle'),
        Medium: weatherData.find(w => w.name === 'Kandy'),
        High: weatherData.find(w => w.name === 'Badulla')
      };

      const elevationRequests = Object.keys(selectedElevations)
        .filter(elevation => selectedElevations[elevation])
        .map(async (elevation) => {
          const weather = weatherMap[elevation] || { main: { temp: 25.0, humidity: 75.0 } }; // Default values if no match
  
          const monthRequests = months.map(async (month) => {
            const methodRequests = processingMethods.map(method =>
              axios.post(Env.BACKEND+'/predict-tea-production-weighted', {
                year: year,
                month,
                processing_method: method,
                elevation,
                production_total: 1500,
                inflation_rate: 300,
                temp_avg: weather.main.temp,
                rain: 200.0,
                humidity_day: weather.main.humidity,
                humidity_night: weather.main.humidity + 10 // Example assumption
              })
            );

            const responses = await Promise.all(methodRequests);
            return {
              month,
              data: responses.map((res, index) => ({
                method: processingMethods[index],
                estimated_quantity: res.data.predicted_tea_production
              }))
            };
          });

          const monthlyData = await Promise.all(monthRequests);
          return { elevation, monthlyData };
        });
  
      const data = await Promise.all(elevationRequests);

      // Formatting data for the chart
      const formattedData = {};
      data.forEach(({ elevation, monthlyData }) => {
        formattedData[elevation] = monthlyData;
      });
  
      setChartData(formattedData);
    } catch (error) {
      console.error('Error fetching tea production data:', error);
    } finally {
      setLoading(false);
    }
  };