import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import Env from "../../data/Env";

// Registering necessary chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TypesChart = () => {
  const [demandData, setDemandData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("CTC TEA");
  const [selectedQuantities, setSelectedQuantities] = useState({
    HIGH: true,
    LOW: true,
    MEDIUM: true,
  });

  // Handle the prediction request
  useEffect(() => {
    const fetchDemandData = async () => {
      setLoading(true);
      const teaTypes = ["CTC TEA", "GREEN TEA", "ORTHODOX"];
      const quantityLevels = Object.keys(selectedQuantities).filter(
        (level) => selectedQuantities[level]
      );

      try {
        const response = await axios.post(Env.BACKEND+"/predict/local-market-release", {
          processing_method: selectedType,
          elevation: "HIGH", // Example of static value, you may want to adjust it
          year: 2024,
          month: 6,
          inflation_rate: 2.5, // Example inflation rate
        });

        // Simulate the response data for different quantity levels
        const data = {
          CTC: quantityLevels.reduce((acc, level) => {
            acc[level] = Math.random() * 1000 + 100; // Simulated data
            return acc;
          }, {}),
          Green: quantityLevels.reduce((acc, level) => {
            acc[level] = Math.random() * 1000 + 100; // Simulated data
            return acc;
          }, {}),
          Orthodox: quantityLevels.reduce((acc, level) => {
            acc[level] = Math.random() * 1000 + 100; // Simulated data
            return acc;
          }, {}),
        };

         setDemandData(data);
      } catch (error) {
        console.error("Error fetching demand data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemandData();
  }, [selectedType, selectedQuantities]);

  // Handle type change (CTC TEA, GREEN TEA, ORTHODOX)
  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

    // Handle quantity filter change (HIGH, LOW, MEDIUM)
  const handleQuantityChange = (quantity) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [quantity]: !prev[quantity],
    }));
  };

  // Prepare chart data
  const chartData = {
    labels: Object.keys(demandData).map((tea) => tea),
    datasets: Object.keys(demandData).map((tea, index) => ({
      label: `${tea} Tea Demand`,
      data: Object.values(demandData[tea]),
      backgroundColor: `rgba(${50 + index * 50}, ${150 - index * 30}, 200, 0.6)`,
      borderColor: `rgba(${50 + index * 50}, ${150 - index * 30}, 200, 1)`,
      borderWidth: 1,
    })),
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
        text: `Predicted Local Market Release Quantity`,
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
          text: "Tea Type",
          color: "#333",
        },
      },
