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

    const datasets = Object.keys(postAnalysisData).map((keyword) => {
    const data = filteredMonths.map(
      (month) => postAnalysisData[keyword][month] || 0
    );

    return {
      label: keyword,
      data,
      borderColor:
        keyword === "Black_Tea"
          ? "black"
          : keyword === "White_Tea"
          ? "yellow"
          : "green",
      backgroundColor: "rgba(0, 123, 255, 0.2)",
      fill: true,
      tension: 0.4,
    };
  });

  const lineChartData = {
    labels: filteredMonths,
    datasets: datasets,
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
        text: "Instagram Post Analysis by Month and Year",
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
          text: "Month-Year",
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
    const logo = new Image();
    logo.src = `${process.env.PUBLIC_URL}/images/logo.png`;

    logo.onload = () => {
      // Add logo and header
      doc.addImage(logo, "PNG", 10, 10, 50, 30);
      doc.setFontSize(22);
      doc.text("TeaVerse", 70, 20);
      doc.setFontSize(10);
      doc.text("123 Green Tea Road, Colombo, Sri Lanka", 70, 30);
      doc.text("Phone: +94 77 123 4567 | Email: contact@teaverse.com", 70, 37);
      doc.text("Website: www.teaverse.com", 70, 44);
      doc.setDrawColor(150);
      doc.line(10, 50, 280, 50);
      doc.setFontSize(16);
      doc.text("Instagram Post Analysis Report", 10, 60);

      const chartElement = document.querySelector(".chartContainer3");
      if (chartElement) {
        html2canvas(chartElement).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", 10, 70, 260, 120);

          doc.setFontSize(14);
          doc.text("Estimated Post Data Table", 10, 200);

          const tableData = [];
          Object.keys(postAnalysisData).forEach((teaType) => {
            Object.entries(postAnalysisData[teaType] || {}).forEach(([year, count]) => {
              tableData.push([teaType, year, count]);
            });
          });

          doc.autoTable({
            head: [["Tea Type", "Year", "Number of Posts"]],
            body: tableData,
            startY: 210,
          });

          doc.save("Instagram_Post_Analysis_Report.pdf");
        });
      }
    };
  };