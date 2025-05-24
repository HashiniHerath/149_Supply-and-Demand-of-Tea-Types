import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Env from "../../data/Env";

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const InstagramPostAnalysisChart = () => {
  const [postAnalysisData, setPostAnalysisData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);

      try {
        const response = await axios.post(
          Env.BACKEND+"/count_items_by_year_month_instagram",
          {
            keywords: ["Black_Tea", "White_Tea", "Green_tea"],
          }
        );

          setPostAnalysisData(response.data);
      } catch (error) {
        console.error("Error fetching Instagram post data:", error);
      } finally {
        setLoading(false);
      }
    };

      fetchPostData();
  }, []);

  // Get current year and month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed

  const months = Object.keys(postAnalysisData).reduce((acc, keyword) => {
    const dates = Object.keys(postAnalysisData[keyword]);
    return [...acc, ...dates];
  }, []);

  const filteredMonths = Array.from(new Set(months))
    .filter((month) => {
      const [year, monthNum] = month.split("-").map(Number); // Extract year and month
      if (year > 2025) return false; // Exclude future years
      if (year === currentYear && monthNum > currentMonth) return false; // Exclude future months in current year
      return true;
    })
    .sort();