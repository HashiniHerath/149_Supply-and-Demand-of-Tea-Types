from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from collections import defaultdict
from typing import Dict, List

# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend's origin for better security
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Load Models
sales_model = joblib.load('sales/model_sales_quantity_new.joblib')

types_model = joblib.load('tea_type_demand_rf.joblib')


elevation_map = {'High grown': 0, 'Low grown': 1, 'Mid grown': 2, 'Unknown': 3}

# Pydantic model for Sales Predict
class PredictionInput(BaseModel):
    year: float
    dollar_rate: float
    elevation: str  # Input elevation as a string
    avg_price: float
    sales_code: int


    @app.post("/predict/demand")
    async def predict_demand(input_data: DemandPredictionInput):
        print(input_data.CH_CPI)
    
    try:
        # Ensure the country has a corresponding model
        country = input_data.country.lower()
        if country not in models:
            raise HTTPException(
                status_code=400,
                detail=f"No model available for the country: {country.capitalize()}",
            )
        