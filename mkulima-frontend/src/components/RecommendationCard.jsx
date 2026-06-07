import React, { useState } from 'react';

const PredictionCard = () => {
  // State to manage input selections, fetched data, and loading feedback
  const [crop, setCrop] = useState('maize');
  const [county, setCounty] = useState('Makueni');
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Temporary mock historical wholesale prices (12 months context required by your LSTM model)
  // Milestone 5 will replace this with an automated fetch from your Django/PostgreSQL backend!
  const historicalDataMock = [3200, 3400, 3100, 3500, 3600, 3300, 3400, 3700, 3800, 3500, 3600, 3900];

  const handleFetchPrediction = async () => {
    setLoading(true);
    setError(null);
    setForecast([]);

    try {
      // Direct connection to your running local FastAPI microservice
      const response = await fetch('http://127.0.0.1:8001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop: crop,
          county: county,
          historical_data: historicalDataMock
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Save the 6 future price predictions array into state
        setForecast(data.prediction);
      } else {
        throw new Error(data.detail || "Prediction failed");
      }
    } catch (err) {
      console.error("Integration Error:", err);
      setError(err.message || "Could not connect to the ML service server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-md bg-white max-w-md mx-auto my-4">
      <h2 className="text-xl font-bold mb-4 text-green-700">Crop Price Forecaster</h2>
      
      {/* Selection Fields */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Select Crop</label>
        <select 
          value={crop} 
          onChange={(e) => setCrop(e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
        >
          <option value="maize">Maize</option>
          <option value="ndengu">Ndengu (Green Grams)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Select County</label>
        <select 
          value={county} 
          onChange={(e) => setCounty(e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
        >
          <option value="Makueni">Makueni</option>
          <option value="Nairobi">Nairobi</option>
          <option value="Uasin Gishu">Uasin Gishu</option>
        </select>
      </div>

      {/* Trigger Button */}
      <button
        onClick={handleFetchPrediction}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-400"
      >
        {loading ? 'Running LSTM Framework...' : 'Generate 6-Month Forecast'}
      </button>

      {/* Error Feedback */}
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {/* Display Results */}
      {forecast.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="font-semibold text-gray-800 border-b pb-2 mb-2">
            Predicted Monthly Trends for {county} ({crop}):
          </h3>
          <ul className="space-y-1">
            {forecast.map((price, index) => (
              <li key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">Month +{index + 1}:</span>
                <span className="font-bold text-gray-900">KES {price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PredictionCard;