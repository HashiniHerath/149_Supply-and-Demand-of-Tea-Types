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

const TwitterPostAnalysisChart = () => {
  const [postAnalysisData, setPostAnalysisData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);

      try {
        const response = await axios.get(
          Env.BACKEND+"/fetch-and-analyze-posts",
          {
            params: {
              query: "tea",
              count: 20,
            },
          }
        );
        setPostAnalysisData(response.data);
      } catch (error) {
        console.error("Error fetching Twitter post data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, []);

  