from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from collections import defaultdict
from typing import Dict, List
from tweepy import OAuth1UserHandler, API
from pytrends.request import TrendReq
from pytrends.exceptions import TooManyRequestsError
from datetime import datetime
import time
import traceback
import http.client
import json
import numpy as np
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

#fast api

app = FastAPI()

#Allow all HTTP methods
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend's origin for better security
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Load Models
sales_model = joblib.load('model_sales_quantity.joblib')

types_model = joblib.load('tea_type_demand_rf.joblib')


elevation_map = {'High grown': 0, 'Low grown': 1, 'Mid grown': 2, 'Unknown': 3}

# Pydantic model for Sales Predict
class PredictionInput(BaseModel):
    year: float
    dollar_rate: float
    elevation: str  # Input elevation as a string
    avg_price: float
    sales_code: int

@app.post("/predict/sales-quantity")
async def predict_sales_quantity(input_data: PredictionInput):
    
    try:
        # Encode elevation
        elevation_encoded = elevation_map.get(input_data.elevation, elevation_map['Unknown'])
        
        model_input = [
            [
                input_data.year,
                input_data.sales_code,
                input_data.dollar_rate,
                elevation_encoded,
                input_data.avg_price
            ]
        ]
        

        prediction = sales_model.predict(model_input)
        
        return {"predicted_quantity": prediction[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")
    
# Sales Tea Types (BP1 and PF1)
rf_model_bp1 = joblib.load("sales/tea_types/model_sales_ttbp1v2.joblib")  
rf_model_pf1 = joblib.load("sales/tea_types/model_sales_ttpf1v2.joblib")

class PredictionRequest(BaseModel):
    year: int
    dollar_rate: float
    elevation: str
    # avg_price: float
    sales_code: int
    tea_type: str  # Either 'BP1' or 'PF1'

# Define prediction function
def predict_price(model, year, dollar_rate, elevation, sales_code):
    input_data = np.array([[year, sales_code, dollar_rate, elevation]])
    prediction = model.predict(input_data)
    yr_weights_balance = year - 2020
    final_prediction = prediction[0]

    if(yr_weights_balance > 0):
            final_prediction = final_prediction + (0.1*(final_prediction*yr_weights_balance)/100)
    return final_prediction


@app.post("/predict-sales-unit-price")
async def predict_tea_price(request: PredictionRequest):
    # Select the correct model based on tea type
    if request.tea_type.upper() == "BP1":
        model = rf_model_bp1
    elif request.tea_type.upper() == "PF1":
        model = rf_model_pf1
    else:
        raise HTTPException(status_code=400, detail="Invalid tea type. Choose 'BP1' or 'PF1'.")

    # Make prediction
    elevation_encoded = elevation_map.get(request.elevation, elevation_map['Unknown'])
    predicted_quantity = predict_price(
        model, request.year, request.dollar_rate, elevation_encoded, request.sales_code
    )

    return {"tea_type": request.tea_type, "predicted_unit": predicted_quantity}

####Tea Trend Analysis

# Twitter API credentials
API_KEY = "6496790f8bmsha07b1cf7256f9c2p1995fbjsne7ca8be11817"
API_SECRET_KEY = "SKHmppgEHdjhWo5UdAOuyccDELGema5KiNqZM2VFGBxi03sRLF"
ACCESS_TOKEN = "Q0NKb2k1cEhrWEpZMXpVRlN4S2o6MTpjaQ"
ACCESS_TOKEN_SECRET = "OEe2ThJ1z5-UIrpoh92Jfvxi6ryKKkOjJoCbGCikwkpRXX03HF"

# Authenticate with Twitter API
auth = OAuth1UserHandler(API_KEY, API_SECRET_KEY, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
twitter_api = API(auth)


# Anlyze Twitter 
class YearlyPostCount(BaseModel):
    year: int
    post_count: int

@app.get("/fetch-and-analyze-posts")
async def fetch_and_analyze_posts(query: str = "tea", count: int = 20) -> List[YearlyPostCount]:
    """
    Fetches posts from the Twitter API, processes post data, groups posts by year, and counts them.

    Args:
        query (str): Search query for Twitter data.
        count (int): Number of posts to retrieve.

    Returns:
        List[YearlyPostCount]: List of post counts grouped by year.
    """
    try:
        # Make request to Twitter API
        data_string = fetch_twitter_data(query, count)

        # Extract posts with content and dates
        posts = extract_posts_with_dates(data_string)
        if not posts:
            raise HTTPException(status_code=400, detail="No valid posts found in the data.")

        # Group posts by year and count them
        year_counts = group_posts_by_year(posts)

        # Convert to sorted list of YearlyPostCount
        yearly_post_counts = sorted(
            [YearlyPostCount(year=year, post_count=count) for year, count in year_counts.items()],
            key=lambda x: x.year
        )

        return yearly_post_counts
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def fetch_twitter_data(query: str, count: int) -> str:
    """
    Fetches Twitter data using the Twitter API.

    Args:
        query (str): Search query for Twitter data.
        count (int): Number of posts to retrieve.

    Returns:
        str: JSON string containing Twitter data.
    """
    conn = http.client.HTTPSConnection("twitter241.p.rapidapi.com")

    headers = {
        'x-rapidapi-key': "6496790f8bmsha07b1cf7256f9c2p1995fbjsne7ca8be11817",
        'x-rapidapi-host': "twitter241.p.rapidapi.com"
    }

    conn.request("GET", f"/search-v2?type=Top&count={count}&query={query}", headers=headers)
    res = conn.getresponse()
    data = res.read()

    return data.decode("utf-8")