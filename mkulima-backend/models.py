from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
import numpy as np

# ════════════════════════════════════════════════════════════════════════
# LIGHTWEIGHT MOCK BASE TO PREVENT CIRCULAR IMPORT CRASHES
# ════════════════════════════════════════════════════════════════════════
class Base:
    """Mock base class replacing old SQLAlchemy configurations to allow clean file loading."""
    pass

# ════════════════════════════════════════════════════════════════════════
# BASE UNUSED STRUCTURAL MODELS (RETAINED FOR COMPATIBILITY)
# ════════════════════════════════════════════════════════════════════════
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    phone_number = Column(String(15), unique=True, index=True, nullable=False)
    county = Column(String(50), nullable=False) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    advisories = relationship("AgronomicAdvisory", back_populates="farmer")


class MarketPriceForecast(Base):
    __tablename__ = "market_price_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    commodity_name = Column(String(50), nullable=False, index=True) 
    current_market_price = Column(Float, nullable=False)
    predicted_price_month_1 = Column(Float, nullable=False)
    predicted_price_month_2 = Column(Float, nullable=False)
    predicted_price_month_3 = Column(Float, nullable=False)
    advisory_action = Column(String(20), nullable=False) 
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)


class WeatherCluster(Base):
    __tablename__ = "weather_clusters"

    id = Column(Integer, primary_key=True, index=True)
    region_name = Column(String(50), nullable=False, index=True)
    cluster_id = Column(Integer, nullable=False)
    risk_level = Column(String(20), nullable=False)
    avg_temperature = Column(Float)
    avg_precipitation = Column(Float)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


class AgronomicAdvisory(Base):
    __tablename__ = "agronomic_advisories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_type = Column(String(50), nullable=False)
    advisory_text = Column(Text, nullable=False) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("User", back_populates="advisories")


# ════════════════════════════════════════════════════════════════════════
# YOUR INTEGRATED K-MEANS UNSUPERVISED CLUSTERING CORE ENGINE
# ════════════════════════════════════════════════════════════════════════
class MkulimaKMeansEngine:
    def __init__(self):
        # Exact mathematical centroids extracted from your Colab trained model output
        # Feature vector matching order: [max_temp, min_temp, rainfall]
        self.centroids = {
            0: np.array([0.567962, 0.759362, 0.063089]), # Cluster 0: High Rain, Warm (Optimal)
            1: np.array([0.299309, 0.344019, 0.016158]), # Cluster 1: Low Temp, Low Rain (Cool/Dry)
            2: np.array([0.764849, 0.691525, 0.010653]), # Cluster 2: High Temp, Lowest Rain (Severe Drought)
            3: np.array([0.497786, 0.523988, 0.016682])  # Cluster 3: Moderate Temp, Low Rain (Mild Stress)
        }
        
        # MinMax training scaler reference parameters to normalize real-time metrics safely
        self.scales = {
            "max_temp": [15.0, 40.0],
            "min_temp": [5.0, 25.0],
            "rainfall": [0.0, 250.0]
        }

    def scale_features(self, max_temp: float, min_temp: float, rainfall: float) -> list:
        """Helper to transform raw weather observations into normalized 0-1 metrics."""
        s_max = (max_temp - self.scales["max_temp"][0]) / (self.scales["max_temp"][1] - self.scales["max_temp"][0])
        s_min = (min_temp - self.scales["min_temp"][0]) / (self.scales["min_temp"][1] - self.scales["min_temp"][0])
        s_rain = (rainfall - self.scales["rainfall"][0]) / (self.scales["rainfall"][1] - self.scales["rainfall"][0])
        
        # Clip values safely between 0.0 and 1.0 to ensure mathematical stability
        return [float(np.clip(s_max, 0, 1)), float(np.clip(s_min, 0, 1)), float(np.clip(s_rain, 0, 1))]

    def predict_cluster_id(self, scaled_features: list) -> int:
        """
        Calculates real-time mathematical minimum Euclidean distance to your 
        exact Colab feature clusters.
        """
        input_vector = np.array(scaled_features)
        closest_cluster = None
        min_distance = float('inf')
        
        for cluster_id, centroid in self.centroids.items():
            distance = np.linalg.norm(input_vector - centroid)
            if distance < min_distance:
                min_distance = distance
                closest_cluster = cluster_id
                
        return closest_cluster

# Globally instantiate your model service engine link so main.py can reference it
kmeans_engine = MkulimaKMeansEngine()