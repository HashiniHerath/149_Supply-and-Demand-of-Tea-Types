import { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import Env from "../../data/Env";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TeaWholeProductionChart = () => {
  const navigate = useNavigate();
  const defaultYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // Months 1-12
  const processingMethods = ["Orthodox", "CTC", "Green"];
  const elevations = ["Low", "Medium", "High"];
  const cities = { Low: "Galle", Medium: "Kandy", High: "Badulla" };
  const [year, setYear] = useState(2022);

  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedElevations, setSelectedElevations] = useState({ Low: false, Medium: false, High: true });
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    const fetchWeatherForCities = async () => {
      try {
        const responses = await Promise.all(
          Object.values(cities).map((city) =>
            axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=3ca1b71cf73d793ea485f6d257cedd49&units=metric`)
          )
        );
        setWeatherData(responses.map((res) => res.data));
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
    fetchWeatherForCities();
  }, []);