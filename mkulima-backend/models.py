from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    phone_number = Column(String(15), unique=True, index=True, nullable=False)
    # Restrict county choices on frontend to: Machakos, Makueni, or Kitui
    county = Column(String(50), nullable=False) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    advisories = relationship("AgronomicAdvisory", back_populates="farmer")


class MarketPriceForecast(Base):
    __tablename__ = "market_price_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    # 'Maize' or 'Ndengu' (Green Gram)
    commodity_name = Column(String(50), nullable=False, index=True) 
    current_market_price = Column(Float, nullable=False)
    predicted_price_month_1 = Column(Float, nullable=False)
    predicted_price_month_2 = Column(Float, nullable=False)
    predicted_price_month_3 = Column(Float, nullable=False)
    # "Hold/Sell" or "Sell Now" based on decision logic
    advisory_action = Column(String(20), nullable=False) 
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)


class WeatherCluster(Base):
    __tablename__ = "weather_clusters"

    id = Column(Integer, primary_key=True, index=True)
    region_name = Column(String(50), nullable=False, index=True) # e.g., Machakos
    cluster_id = Column(Integer, nullable=False) # The K-Means assigned integer
    risk_level = Column(String(20), nullable=False) # e.g., High Drought Risk, Optimal Rainfall
    avg_temperature = Column(Float)
    avg_precipitation = Column(Float)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


class AgronomicAdvisory(Base):
    __tablename__ = "agronomic_advisories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_type = Column(String(50), nullable=False) # Maize or Ndengu
    # The actual output string from your Knowledge-Based Expert System
    advisory_text = Column(Text, nullable=False) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Reverse relationship link
    farmer = relationship("User", back_populates="advisories")