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

  