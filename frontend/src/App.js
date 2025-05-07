import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from './config';
import './App.css';

// These should ideally match or be derived from your `feature_names.joblib`
// For this example, we'll hardcode them based on PIMA dataset conventions
// Make ABSOLUTELY SURE these keys match the 'feature_names' saved by your preprocess_data.py script.
const DEFAULT_FEATURES = {
  Pregnancies: 3,
  Glucose: 120,
  BloodPressure: 70,
  SkinThickness: 20,
  Insulin: 80,
  BMI: 32.0,
  DiabetesPedigreeFunction: 0.470,
  Age: 33,
};

const FEATURE_DETAILS = {
  Pregnancies: { min: 0, max: 17, step: 1, label: "Pregnancies" },
  Glucose: { min: 0, max: 250, step: 1, label: "Glucose (mg/dL)" },
  BloodPressure: { min: 0, max: 140, step: 1, label: "Blood Pressure (mm Hg)" },
  SkinThickness: { min: 0, max: 99, step: 1, label: "Skin Thickness (mm)" },
  Insulin: { min: 0, max: 900, step: 1, label: "Insulin (mu U/ml)" },
  BMI: { min: 0.0, max: 70.0, step: 0.1, label: "BMI (kg/m²)" },
  DiabetesPedigreeFunction: { min: 0.000, max: 2.500, step: 0.001, label: "Diabetes Pedigree Function" },
  Age: { min: 18, max: 100, step: 1, label: "Age (years)" },
};

function App() {
  const [formData, setFormData] = useState(DEFAULT_FEATURES);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(null);
  const [apiHealthMessage, setApiHealthMessage] = useState('');

  const checkApiHealth = useCallback(async () => {
    setLoading(true); // Show loading while checking health
    try {
      console.log(`Checking API health at: ${API_BASE_URL}/health`);
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log("API Health Response:", response);
      if (response.data && response.data.status === "healthy") {
        setApiHealthy(true);
        setApiHealthMessage(response.data.message || "API is healthy.");
        setError(''); // Clear previous errors if API is now healthy
      } else {
        setApiHealthy(false);
        const message = response.data ? response.data.message : 'Unknown API issue.';
        setApiHealthMessage(`API status: ${message}`);
        setError(`API is unhealthy: ${message}`);
      }
    } catch (err) {
      console.error("API health check error:", err);
      setApiHealthy(false);
      let message = 'Failed to connect to the API. Is the backend server running?';
      if (err.message) {
        message += ` (Details: ${err.message})`;
      }
      setApiHealthMessage(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array, checkApiHealth doesn't change

  useEffect(() => {
    checkApiHealth();
  }, [checkApiHealth]); // Run checkApiHealth when component mounts and if checkApiHealth changes (it won't here)

  const handleChange = (e) => {
    const { name, value } = e.target;
    const featureDetail = FEATURE_DETAILS[name];

    if (value === '') { // Allow temporarily empty for user input
      setFormData(prev => ({ ...prev, [name]: '' }));
      return;
    }

    let parsedValue = (featureDetail.step === 0.1 || featureDetail.step === 0.001)
                       ? parseFloat(value)
                       : parseInt(value, 10);

    // If parsing results in NaN (e.g., user types "abc"), keep the input field as is or set to a valid state
    // For simplicity, we'll let the validation on submit catch persistent NaNs.
    // Or, you could choose to revert to a previous valid value or clamp.
    if (isNaN(parsedValue) && value !== "-") { // Allow "-" for negative number input start
        // Potentially set an inline error for this field or just let the value be for now
        // For this example, we'll allow the invalid text to remain until submit validation
        setFormData(prev => ({ ...prev, [name]: value })); // Keep raw value if not parseable
    } else {
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPredictionResult(null);

    // Client-side validation
    const currentFormData = { ...formData };
    for (const key in FEATURE_DETAILS) {
      const value = currentFormData[key];
      if (value === '' || value === null || isNaN(Number(value))) {
        setError(`Please enter a valid number for ${FEATURE_DETAILS[key].label}. Value found: '${value}' for ${key}`);
        setLoading(false);
        return;
      }
      // Ensure correct type for payload if necessary (though numbers should be fine)
      currentFormData[key] = Number(value);
    }

    try {
      console.log("Submitting payload:", currentFormData);
      const response = await axios.post(`${API_BASE_URL}/predict`, currentFormData);
      console.log("Prediction API Response:", response);
      if (response.data) {
        setPredictionResult(response.data);
      } else {
        setError("Received an empty response from the prediction API.");
      }
    } catch (err) {
      console.error("Prediction error details:", err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        setError(`Prediction API Error (${err.response.status}): ${err.response.data.description || err.response.data.error || 'Unknown server error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error("Error request data:", err.request);
        setError('No response from server. The backend might be down or unreachable.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        setError(`An error occurred: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (apiHealthy === null && loading) { // Initial loading state for health check
    return <div className="App"><p>Initializing and checking API status...</p></div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>💉 Diabetes Prediction System</h1>
        <div className={`api-status ${apiHealthy ? 'healthy' : 'unhealthy'}`}>
            API Status: {apiHealthy === null ? "Checking..." : (apiHealthy ? "Healthy" : "Issues Detected")}
            {apiHealthMessage && <small style={{display: 'block'}}> ({apiHealthMessage})</small>}
        </div>
      </header>
      <main>
        {apiHealthy && ( // Only show form if API is healthy
          <form onSubmit={handleSubmit} className="prediction-form">
            <h2>Enter Patient Data</h2>
            <div className="form-grid">
              {Object.keys(FEATURE_DETAILS).map((key) => (
                <div className="form-group" key={key}>
                  <label htmlFor={key}>{FEATURE_DETAILS[key].label}:</label>
                  <input
                    type="number" // "text" might be better with custom parsing if "number" input is finicky
                    id={key}
                    name={key}
                    value={formData[key]} // Directly bind to potentially non-numeric string state
                    onChange={handleChange}
                    min={FEATURE_DETAILS[key].min}
                    max={FEATURE_DETAILS[key].max}
                    step={FEATURE_DETAILS[key].step}
                    required
                    placeholder={`e.g., ${FEATURE_DETAILS[key].min + Math.round((FEATURE_DETAILS[key].max - FEATURE_DETAILS[key].min) / 2 * 10) / 10}`}
                  />
                </div>
              ))}
            </div>
            <button type="submit" disabled={loading || !apiHealthy}>
              {loading ? 'Predicting...' : 'Predict Diabetes Status'}
            </button>
          </form>
        )}

        {/* Display general error message if not loading and error is present */}
        {!loading && error && <p className="error-message">{error}</p>}

        {predictionResult && (
          <div className="results">
            <h2>Prediction Result</h2>
            <p className={predictionResult.prediction === 1 ? 'diabetes-positive' : 'diabetes-negative'}>
              Status: <strong>{predictionResult.prediction === 1 ? 'Likely Diabetic' : 'Likely Not Diabetic'}</strong>
            </p>
            <p>Probability of Diabetes: <strong>{(predictionResult.probability_diabetes * 100).toFixed(2)}%</strong></p>
            <p>Probability of No Diabetes: <strong>{(predictionResult.probability_no_diabetes * 100).toFixed(2)}%</strong></p>
            {predictionResult.model_info && <p><small>Model used: {predictionResult.model_info}</small></p>}
          </div>
        )}
        <p className="disclaimer">
          <strong>Disclaimer:</strong> This tool provides a prediction based on a machine learning model and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for any health concerns.
        </p>
      </main>
    </div>
  );
}

export default App;