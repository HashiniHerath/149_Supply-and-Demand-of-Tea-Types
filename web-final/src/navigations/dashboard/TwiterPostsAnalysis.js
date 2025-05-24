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

    const lineChartData = {
    labels: postAnalysisData.map((item) => item.year),
    datasets: [
      {
        label: "Twitter Posts",
        data: postAnalysisData.map((item) => item.post_count),
        borderColor: "blue",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        fill: true,
        tension: 0.4,
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
        text: "Twitter Post Analysis Over Years",
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
          text: "Number of Posts",
          color: "#333",
        },
        beginAtZero: true,
      },
    },
  };

   const generatePDF = async () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(22);
    doc.text("TeaVerse", 70, 20);
    doc.setFontSize(10);
    doc.text("123 Green Tea Road, Colombo, Sri Lanka", 70, 30);
    doc.text("Phone: +94 77 123 4567 | Email: contact@teaverse.com", 70, 37);
    doc.text("Website: www.teaverse.com", 70, 44);
    doc.setDrawColor(150);
    doc.line(10, 50, 280, 50);
    doc.setFontSize(16);
    doc.text("Twitter Post Analysis Report", 10, 60);
    
    const chartElement = document.querySelector(".chartContainer2");
    if (chartElement) {
      html2canvas(chartElement).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 10, 70, 260, 120);
        doc.save("Twitter_Post_Analysis_Report.pdf");
      });
    }
  };