# Overview of the Project 

## Repository Link - https://github.com/HashiniHerath/149_Supply-and-Demand-of-Tea-Types
## Research Topic - A Data-Driven Approach to Predict Supply and Demand of tea type in Sri Lanka.
## Project ID - 24-25J-149

### Member 1 - IT21341922 - Herath H.M.H.N (Hashini Herath)/ Component 1 - Analyze tea trends from google trends and social media trends 
### Member 2 - IT21309274 - Ramsith K.V.A.M (IT21309274)/ Component 2 - Analyze how the demand for tea fluctuates throughout the year due to sales factors
### Member 3 - IT21259616 - Sanjula R.A.K (kulan404)/ Component 3 - Predict export demand for tea using economic indicators  
### Member 4 - IT21238376 - Dinujaya M.H.S (sachindinuja)/ Component 4 - Analyze Tea Production in Sri Lanka Category-Wise (Orthodox, CTC, Green Tea)

#### Brief Description of the project - This research project, "A Data-Driven Approach to Predict Supply and Demand of Tea Types in Sri Lanka," aims to develop a web-based prediction system using data mining and machine learning techniques. By integrating data from Google Trends, social media platforms, economic indicators, and historical production records, the system forecasts tea demand and supply fluctuations. The project targets tea producers, exporters, and policymakers, offering actionable insights for market strategy optimization, production planning, and inventory management. Key features include trend analysis, demand forecasting, and dynamic report generation to enhance decision-making across the tea industry. 

# System Architectural Diagram

![Untitled Diagram (1) drawio (1)](https://github.com/user-attachments/assets/50d157ca-88c7-4313-bf98-468a38e12083)

# Dependencies

#### FastAPI: Used to build the RESTful APIs for tasks like sales prediction, demand forecasting, and fetching trends.
#### Uvicorn: ASGI server used to run the FastAPI application.
#### Python-Multipart: Handles file uploads in FastAPI, essential for features like importing data.
#### Tweepy: Integrates with the Twitter API to fetch and analyze Twitter posts.
#### Matplotlib: Visualization library; used for data plotting, if applicable.
#### NumPy: Fundamental numerical operations; aids in processing and manipulating arrays for machine learning or data analysis.
#### Google Cloud Firestore & Firebase-Admin: Manage Firebase database operations and authentication for the application.
#### UUID: Generates unique identifiers, possibly for database entities or API keys.
#### Pandas: Data manipulation and analysis; critical for preprocessing data for predictions or trend analysis.
#### Joblib: Saves and loads machine learning models, such as Random Forest models for sales and demand predictions.
#### Scikit-Learn: Core library for implementing machine learning models, used extensively for predictions.
#### Pytrends: Google Trends API wrapper; fetches and processes trend data for analysis.
