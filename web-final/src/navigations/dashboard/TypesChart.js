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