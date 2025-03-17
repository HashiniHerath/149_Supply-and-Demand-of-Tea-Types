from fastapi import FastAPI, HTTPException
from tweepy import OAuth1UserHandler, API
from dotenv import load_dotenv
from pydantic import BaseModel
import os
import joblib
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pytrends.request import TrendReq
from pytrends.exceptions import TooManyRequestsError
import traceback
import time
from collections import defaultdict
from datetime import datetime
import json
import http.client
from typing import Dict, List
import numpy as np


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend's origin for better security
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)



# Tea Types
# Load Models
types_model = joblib.load('tea_type_demand_rf.joblib')

# Categorical mappings
processing_method_mapping = {'CTC TEA': 0, 'GREEN TEA': 1, 'ORTHODOX': 2}
elevation_mapping = {'HIGH': 0, 'LOW': 1, 'MEDIUM': 2}

# Request model for validation
class PredictionRequest(BaseModel):
    year: int
    month: int
    processing_method: str
    elevation: str
    inflation_rate: float

@app.get("/predict/local-market-release/{tea_type}")
async def predict_local_market_release(tea_type: str, data: PredictionRequestX):
    """
    Predicts the Local market Release Quantity (Kg) using the trained Random Forest model.
    """
    if types_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded properly.")

    # Map the categorical inputs to encoded values
    processing_method_encoded = processing_method_mapping.get(data.processing_method)
    elevation_encoded = elevation_mapping.get(data.elevation)

    if processing_method_encoded is None or elevation_encoded is None:
        raise HTTPException(status_code=400, detail="Invalid processing method or elevation value provided.")

    # Prepare the input data for prediction
    input_data = pd.DataFrame([{
        'year': data.year,
        'month': data.month,
        'Processing Method': processing_method_encoded,
        'Elevation': elevation_encoded,
        'whole production Quantity (Kg)': 0,  # Default or dynamic input
        'production Total (kg)': 0,          # Default or dynamic input
        'inflation rate': data.inflation_rate
    }])

    # Handle missing values in features
    input_data = input_data.fillna(input_data.median())

    try:
        # Predict using the trained model
        prediction = types_model.predict(input_data)
        return {"predicted_local_market_release_quantity": prediction[0]}
    except Exception as e:
        error_message = traceback.format_exc()
        print(error_message)
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")

# Local Demand 

loaded_model_1 = joblib.load("local_market_demand/lm_random_forest_model.joblib")
loaded_model_2 = joblib.load("local_market_demand/lm_lgbm_model.joblib")
loaded_model_3 = joblib.load("local_market_demand/lm_etr_model.joblib")




