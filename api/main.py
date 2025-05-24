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

# Helper function: Extract posts with their dates
def extract_posts_with_dates(data_string):
    posts_with_dates = []
    data = json.loads(data_string)
    instructions = data.get("result", {}).get("timeline", {}).get("instructions", [])

    for instruction in instructions:
        entries = instruction.get("entries", [])
        for entry in entries:
            content = entry.get("content", {})
            if content.get("__typename") == "TimelineTimelineModule":
                items = content.get("items", [])
                for item in items:
                    user_content = item.get("item", {}).get("itemContent", {}).get("user_results", {}).get("result", {}).get("legacy", {})
                    description = user_content.get("description", "")
                    created_at = user_content.get("created_at", "")

                    if description and created_at:
                        posts_with_dates.append({
                            "content": description,
                            "date": created_at
                        })

    return posts_with_dates

# Helper function: Group posts by year
def group_posts_by_year(posts):
    year_counts = defaultdict(int)
    for post in posts:
        try:
            post_date = datetime.strptime(post['date'], '%a %b %d %H:%M:%S %z %Y')
            year = post_date.year
            year_counts[year] += 1
        except Exception as e:
            print(f"Error parsing date for post: {post}, Error: {e}")

    return dict(year_counts)

# Facebook Analyssis
def count_posts_by_year(data):

    year_count = defaultdict(int)

    # Loop through each post in the response
    for post in data.get("results", []):
        timestamp = post.get("timestamp")
        comments_count = post.get("comments_count", 0)
        if timestamp:
            # Convert timestamp to a datetime object
            date = datetime.utcfromtimestamp(timestamp)
            year = date.year
            year_count[year] = year_count[year] + comments_count

    # Sorting the years in ascending order and return the result
    sorted_year_count = dict(sorted(year_count.items()))
    return sorted_year_count

async def fetch_and_count_posts_facebook(keywords):
    """
    Fetches posts for a list of keywords and counts them by year.

    Args:
        keywords (list): A list of keywords to fetch posts for.

    Returns:
        dict: A dictionary with keywords as keys and year counts as values.
    """
    # API connection details
    conn = http.client.HTTPSConnection("facebook-scraper3.p.rapidapi.com")
    headers = {
        'x-rapidapi-key': "84e293cd23msh8690775f2263e8cp1b99ebjsn333d95c46206", 
        'x-rapidapi-host': "facebook-scraper3.p.rapidapi.com"
    }

    results = {}

    for query in keywords:
        try:
            # API request for the given keyword
            conn.request("GET", f"/search/posts?query={query}", headers=headers)
            res = conn.getresponse()
            data = res.read()

            # Parse the response data
            response_data = json.loads(data.decode("utf-8"))

            # Count posts by year
            year_counts = count_posts_by_year(response_data)

            # Store the results for this keyword
            results[query] = year_counts

        except Exception as e:
            # Handle any errors for the keyword
            results[query] = {"error": str(e)}

    return results

class KeywordsRequest(BaseModel):
    keywords: List[str]

# Fetch and count posts based on the provided keywords
@app.post("/count_posts_by_year_facebook")
async def get_post_counts_facebook(request: KeywordsRequest):
    """
    Fetches posts for a list of keywords and counts them by year.

    Args:
        keywords (list): A list of keywords to fetch posts for.

    Returns:
        dict: A dictionary with keywords as keys and year counts as values.
    """

    result = await fetch_and_count_posts_facebook(request.keywords)
    print(result)

    ## Return the results
    return result

# Instagram
def count_items_by_year_month(data):
    """
    Counts items based on year and month from the device_timestamp.

    Args:
        data (dict): The parsed JSON response containing the items.

    Returns:
        dict: A dictionary with keys as (year, month) and values as counts.
    """
    grouped_data = defaultdict(int)

    for item in data.get("data", {}).get("items", []):
        timestamp = item.get("device_timestamp")
        if timestamp:
            
            timestamp_seconds = timestamp / 1e6 # Convert timestamp to seconds (assuming timestamp is in microseconds)
            date = datetime.fromtimestamp(timestamp_seconds)
            key = (date.year, date.month)
            grouped_data[key] += 1

    # Convert defaultdict to a standard dictionary with formatted keys
     return {f"{year}-{month:02d}": count for (year, month), count in grouped_data.items()}

async def fetch_and_count_keywords_instagram(keywords):
    """
    Fetches data for each keyword and counts items by year and month.

    Args:
        keywords (list): List of hashtags to fetch data for.

    Returns:
        dict: A dictionary with each keyword as a key and counts as values, sorted by date.
    """
    ## API connection details
    conn = http.client.HTTPSConnection("instagram-scraper-api2.p.rapidapi.com")
    headers = {
        'x-rapidapi-key': "6496790f8bmsha07b1cf7256f9c2p1995fbjsne7ca8be11817",
        'x-rapidapi-host': "instagram-scraper-api2.p.rapidapi.com"
    }

    results = {}

    for keyword in keywords:
        try:
            # API request for the current keyword
            conn.request("GET", f"/v1/hashtag?hashtag={keyword}", headers=headers)
            res = conn.getresponse()
            data = res.read()

            response_data = json.loads(data.decode("utf-8"))

            counts = count_items_by_year_month(response_data)

            sorted_counts = {k: counts[k] for k in sorted(counts)}

            results[keyword] = sorted_counts
        except Exception as e:
            
            results[keyword] = {"error": str(e)}

    return results

@app.post("/count_items_by_year_month_instagram")
async def get_item_counts_instagram(request: KeywordsRequest):
    """
    Fetches Instagram data for a list of keywords and counts items by year and month.

    Args:
        request (KeywordsRequest): A Pydantic model containing a list of keywords.

    Returns:
        dict: A dictionary with each keyword as a key and counts by year-month as values.
    """
    # Fetch and count items based on the provided keywords
    result = await fetch_and_count_keywords_instagram(request.keywords)

    # Return the results
    return result

# Google Trend Analysis
class TrendRequest(BaseModel):
    topics: list[str]

@app.post("/get-google-trends")
async def get_google_trends(request: TrendRequest):
    """
    Fetches Google Trends data for the specified topics over the last 5 years.
    """
    pytrends = TrendReq(hl='en-US', tz=360)
    topics = request.topics
    data = {}

    for topic in topics:
        while True:
            try:
                pytrends.build_payload([topic], timeframe='today 5-y', geo='', gprop='')
                interest_over_time = pytrends.interest_over_time()
                data[topic] = interest_over_time[topic].tolist()
                
                break
            except TooManyRequestsError:
                print(f"Too many requests for topic: {topic}. Retrying after 5 minutes.")
                

    return {"trend_data": data}