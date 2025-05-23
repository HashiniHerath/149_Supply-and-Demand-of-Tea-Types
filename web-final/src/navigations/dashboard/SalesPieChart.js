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
