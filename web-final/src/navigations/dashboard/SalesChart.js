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