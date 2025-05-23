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