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

@app.post("/predict/local-market-release")
async def predict_local_market_release(data: PredictionRequest):
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

# Dictionary to store models
MULTI_MODELS_DEMAND = {
    "Random Forest": loaded_model_1,
    "LightGBM": loaded_model_2,
    "Extra Trees": loaded_model_3
}

# FastAPI endpoint
@app.post("/predict-tea-production-weighted")
async def predict_lm_w(input_data: TeaProductionInput):
    result = predict_lm_weighted(
        input_data.year, input_data.month, input_data.processing_method, input_data.elevation, 
        input_data.production_total, input_data.inflation_rate, input_data.temp_avg, 
        input_data.rain, input_data.humidity_day, input_data.humidity_night
    )

    return result

def predict_tea_whole_production_weighted(year, month, processing_method, elevation, 
                                    inflation_rate, temp_avg, rain, humidity_day, humidity_night):
    try:
        # Encode labels
        processing_method_encoded, elevation_encoded = encode_labels(processing_method, elevation)
        
        if processing_method_encoded == -1 or elevation_encoded == -1:
            return {"error": "Invalid processing method or elevation label."}
        
        # Create input data as DataFrame
        input_data = pd.DataFrame([[year, month, processing_method_encoded, elevation_encoded, 
                                    inflation_rate, temp_avg, rain, humidity_day, humidity_night]],
                                  columns=["year", "month", "Processing Method", "Elevation",
                                           "inflation rate", "Temp AVG", "Rain", "Humidity Day", "Humidity Night"])

        # Get predictions from all models
        predictions = np.array([model.predict(input_data)[0] for model in MULTI_MODELS_WHOLE_PROD.values()])
        
        # Define model weights (assign higher weights to better models)
        weights = np.array([0.4, 0.3, 0.3])  # Example: Higher weight to Random Forest
        
        # Compute weighted prediction
        yr_weights_balance = year - 2020

        final_prediction = np.sum(predictions * weights)
        if(yr_weights_balance > 0):
            final_prediction = final_prediction + ((final_prediction*yr_weights_balance)/100)
        

        return {"predicted_tea_whole_production": final_prediction}
    
    except Exception as e:
        return {"error": str(e)}
    
    # Prediction function
def predict_lm_ensemble(year, month, processing_method, elevation, production_total, 
                                    inflation_rate, temp_avg, rain, humidity_day, humidity_night):
    try:
        # Encode labels
        processing_method_encoded, elevation_encoded = encode_labels(processing_method, elevation)
        
        if processing_method_encoded == -1 or elevation_encoded == -1:
            return {"error": "Invalid processing method or elevation label."}



