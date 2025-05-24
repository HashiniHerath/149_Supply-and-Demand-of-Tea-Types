import React, { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement, // Import PointElement
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import TwitterPostAnalysisChart from "./TwiterPostsAnalysis";
import FacebookPostAnalysisChart from "./FacebookPostsAnalysis";
import InstagramPostAnalysisChart from "./InstagramPostsAnalysis";
import Env from "../../data/Env";

// Registering necessary chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement, 
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TrendAnalysisChart = () => {
  const [trendData, setTrendData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("Facebook");

  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true);

      try {
        const response = await axios.post(Env.BACKEND+"/get-google-trends-dates", {
          topics: ["Green Tea", "Black Tea", "White Tea"],
        });
        console.log(response.data)
        setTrendData(response.data.trend_data);
      } catch (error) {
        console.error("Error fetching Google Trends data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, []);

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const lineChartData = {
    labels: trendData["dates"] || [],
    datasets: [
      {
        label: "Green Tea",
        data: trendData["Green Tea"] || [],
        borderColor: "green",
        backgroundColor: "rgba(0, 255, 0, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Black Tea",
        data: trendData["Black Tea"] || [],
        borderColor: "black",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "White Tea",
        data: trendData["White Tea"] || [],
        borderColor: "yellow",
        backgroundColor: "rgba(255, 255, 0, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const thisYearData = {
    labels: ["Green Tea", "Black Tea", "White Tea"],
    datasets: [
      {
        data: [
          trendData["Green Tea"] ? trendData["Green Tea"][trendData["Green Tea"].length - 1] : 0,
          trendData["Black Tea"] ? trendData["Black Tea"][trendData["Black Tea"].length - 1] : 0,
          trendData["White Tea"] ? trendData["White Tea"][trendData["White Tea"].length - 1] : 0,
        ],
        backgroundColor: ["green", "black", "yellow"],
        hoverOffset: 4,
      },
    ],
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
        text: `Google Trends Data for Tea Types Over 5 Years`,
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
          text: "Interest",
          color: "#333",
        },
        beginAtZero: true,
      },
    },
  };

