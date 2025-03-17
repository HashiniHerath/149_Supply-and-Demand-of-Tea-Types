from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend's origin for better security
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)



# Load Models
models = {
    "china": joblib.load("export_demand/export_china_rf.joblib"),
    "germany": joblib.load("export_demand/export_Germany_rf.joblib"),
    "iran": joblib.load("export_demand/export_Iran_rf.joblib"),
    "japan": joblib.load("export_demand/export_JPA_rf.joblib"),
    "russia": joblib.load("export_demand/export_RUSS_rf.joblib"),
    "uk": joblib.load("export_demand/export_UK_rf.joblib"),
    "usa": joblib.load("export_demand/export_USA_rf.joblib"),
}

    
# Endpoint for Export Demand by country
class DemandPredictionInput(BaseModel):
    year: int
    month: int
    CH_CPI: float
    Type: str  # Type should match the categories used during training
    country: str  # Country for which prediction is required

@app.post("/predict/demand")
async def predict_demand(input_data: DemandPredictionInput):
    print(input_data.CH_CPI)
    """
    Predict demand based on input parameters and the specified country.

    Parameters:
        input_data (DemandPredictionInput): The input parameters for prediction.

    Returns:
        dict: Predicted demand and model details.
    """
    try:
        # Ensure the country has a corresponding model
        country = input_data.country.lower()
        if country not in models:
            raise HTTPException(
                status_code=400,
                detail=f"No model available for the country: {country.capitalize()}",
            )
        
        # Load the correct model
        selected_model = models[country]

        # Prepare input data for the model
        type_encoding = {"Black": 0, "Green": 1}  # Adjust based on your dataset encoding
        type_encoded = type_encoding.get(input_data.Type, -1)
        if type_encoded == -1:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid Type: {input_data.Type}. Allowed values are 'Black' or 'Green'.",
            )

        model_input = [[
            input_data.year,
            input_data.month,
            input_data.CH_CPI,
            type_encoded
        ]]

        # Predict demand
        prediction = selected_model.predict(model_input)

        return {
            "country": country.capitalize(),
            "predicted_demand": prediction[0],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}") 
