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
