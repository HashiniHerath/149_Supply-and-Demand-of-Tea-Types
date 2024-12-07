from fastapi import FastAPI, HTTPException
from tweepy import OAuth1UserHandler, API
from pydantic import BaseModel
import os
import joblib
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pytrends.request import TrendReq
import traceback
import time
from collections import defaultdict
from datetime import datetime
import json
import http.client
from typing import Dict, List


# Twitter API credentials
API_KEY = "87H3wFmVZtIwYrjemVdw4m2Qa"
API_SECRET_KEY = "SKHmppgEHdjhWo5UdAOuyccDELGema5KiNqZM2VFGBxi03sRLF"
ACCESS_TOKEN = "Q0NKb2k1cEhrWEpZMXpVRlN4S2o6MTpjaQ"
ACCESS_TOKEN_SECRET = "OEe2ThJ1z5-UIrpoh92Jfvxi6ryKKkOjJoCbGCikwkpRXX03HF"

# Authenticate with Twitter API
auth = OAuth1UserHandler(API_KEY, API_SECRET_KEY, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
twitter_api = API(auth)

app = FastAPI()

pytrends = TrendReq()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend's origin for better security
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Trend Analysis
class TrendRequest(BaseModel):
    topics: list[str]



@app.post("/get-google-trends")
async def get_google_trends(request: TrendRequest):
        """
        Fetches Google Trends data for the specified topics over the last 5 years.
        """
        topics = request.topics
        data = {}

        # Fetch trend data for each topic
        for topic in topics:
            pytrends.build_payload([topic], timeframe='today 5-y', geo='', gprop='')
            interest_over_time = pytrends.interest_over_time()
            data[topic] = interest_over_time[topic].tolist()  # Convert to list to send in response
            time.sleep(10)  # Add a delay of 10 seconds between requests

        return {"trend_data": data}

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