from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os
import numpy as np
import tensorflow as tf

app = FastAPI(title="Mkulima Smart ML Service")

# Enable CORS so the frontend can communicate with this service seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

class PredictionRequest(BaseModel):
    crop: str               
    county: str             
    historical_data: list   # Expects exactly 12 monthly price points

@app.post("/predict")
async def get_prediction(req: PredictionRequest):
    crop_key = req.crop.lower().strip()
    
    if crop_key not in ['maize', 'ndengu']:
        raise HTTPException(status_code=400, detail="Unsupported crop. Choose 'maize' or 'ndengu'")
        
    if len(req.historical_data) < 12:
        raise HTTPException(status_code=400, detail="LSTM requires exactly 12 months of historical pricing context.")

    model_path = os.path.join(MODELS_DIR, f"{crop_key}_model.h5")
    scaler_path = os.path.join(MODELS_DIR, f"{crop_key}_scaler.pkl")
    
    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        raise HTTPException(status_code=500, detail=f"Model components missing for {crop_key} in models folder.")

    try:
        model = tf.keras.models.load_model(model_path)
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
            
        recent_series = np.array(req.historical_data[-12:]).reshape(-1, 1)
        scaled_series = scaler.transform(recent_series).flatten().tolist()
        
        predicted_prices = []
        
        # Iteratively forecast the next 6 months ahead
        for _ in range(6):
            input_sequence = np.array(scaled_series[-12:]).reshape(1, 12, 1)
            predicted_scaled = model.predict(input_sequence, verbose=0)[0][0]
            
            true_currency_price = float(scaler.inverse_transform([[predicted_scaled]])[0][0])
            
            scaled_series.append(predicted_scaled)
            predicted_prices.append(round(true_currency_price, 2))
            
        return {
            "status": "success",
            "crop": req.crop,
            "county": req.county,
            "prediction": predicted_prices  
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction Failure: {str(e)}")